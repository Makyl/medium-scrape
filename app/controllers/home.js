var express = require('express'),
  router = express.Router(),
  request = require('request'),
  async = require('async'),
  throttledRequest = require('throttled-request')(request),
  cheerio = require('cheerio'),
  csvWriter = require('csv-write-stream'),
  fs = require('fs'),
  writer = csvWriter();

throttledRequest.configure({
  requests: 5,
  milliseconds: 1000
});

module.exports = function (app) {
  app.use('/', router);
};

router.get('/scraper', function (req, res) {
    //Initializing write stream
    writer.pipe(fs.createWriteStream('links.csv'));

    //Hash map to keep a record of links already visited with fastest access time
    var hashMap = {};

    //Callback to inform user that a csv will be generated
    var callback = function () {
      res.status(200).json({message: "The CSV file is being generated. please check for links.csv in your code directory."});
    };

    //Regexp to check if valid url (Not written by me)
    function learnRegExp(s) {
      var regexp = /(http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
      return regexp.test(s);
    }

    //Function to visit links if not already visited
    function getData(link, callback) {
      //Checking if page not already visited and is a proper link and is of medium.com
      if (hashMap[link] == undefined && learnRegExp(link) && link.indexOf("medium.com") !== -1) {
        console.log(link);
        //Storing that page has been visited
        hashMap[link] = 1;
        //Writing it on csv
        writer.write({link: link});
        //getting links for this current link
        throttledRequest({method: 'GET', uri: link}, function (err, response, body) {
            if (body) {
              var $ = cheerio.load(body);
              var links = $('a');
              var arr = [];
              $(links).each(function (i, link) {
                var tempLink = $(link).attr('href');
                if (tempLink) {
                  tempLink = tempLink.split('?')[0];
                  tempLink = tempLink.split('#')[0];
                  if (hashMap[tempLink] == undefined) {
                    getData(tempLink, function () {
                      console.log("inside chain")
                    });
                  }
                }
              });
            }
          }
        );
      } else {
        if (callback) {
          callback();
        }
      }
    }

    callback();
    getData("https://www.medium.com", function () {
      console.log("-------------------")
    });
  })
  .get('/asyncScraper', function (req, res) {
    //Initializing write stream
    writer.pipe(fs.createWriteStream('asyncLinks.csv'));

    //Hash map to keep a record of links already visited with fastest access time
    var hashMap = {};

    //Callback to inform user that a csv will be generated
    var callback = function () {
      res.status(200).json({message: "The CSV file is being generated. please check for asyncLinks.csv in your home code directory."});
    };

    //Regexp to check if valid url (Not written by me)
    function learnRegExp(s) {
      var regexp = /(http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
      return regexp.test(s);
    }

    //Function to visit links if not already visited
    function getData(link, callback) {
      //Checking if page not already visited and is a proper link and is of medium.com
      if (hashMap[link] == undefined && learnRegExp(link) && link.indexOf("medium.com") !== -1) {
        console.log(link);
        //Storing that page has been visited
        hashMap[link] = 1;
        //Writing it on csv
        writer.write({link: link});
        //getting links for this current link
        throttledRequest({method: 'GET', uri: link}, function (err, response, body) {
          if (body) {
            var $ = cheerio.load(body);
            var links = $('a');
            var arr = [];
            $(links).each(function (i, link) {
              var tempLink = $(link).attr('href');
              if (tempLink) {
                tempLink = tempLink.split('?')[0];
                tempLink = tempLink.split('#')[0];
                if (hashMap[tempLink] == undefined) {
                  //pushing functions to array to be able to do async.parallel over it
                  arr.push(function (cb) {
                    getData(tempLink, cb)
                  });
                }
              }
            });
            async.parallel(arr, callback);
          }
        });
      } else {
        callback();
      }
    };

    callback();
    getData("https://www.medium.com", function () {
      console.log("Finished");
    });
  });
