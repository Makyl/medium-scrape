var request = require('request'),
  async = require('async'),
  requestThrottler = require('./request-throttler')(request),
  cheerio = require('cheerio'),
  csvWriter = require('csv-write-stream'),
  fs = require('fs'),
  writer = csvWriter();

requestThrottler.config(5, 1000);

module.exports = {
  syncScraper: function () {
    //Initializing write stream
    writer.pipe(fs.createWriteStream('links.csv'));

    //Hash map to keep a record of links already visited with fastest access time
    var hashMap = {};

    //Regexp to check if valid url (Not written by me)
    function learnRegExp(s) {
      var regexp = /(http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
      return regexp.test(s);
    }

    //Function to visit links if not already visited
    function getData(link, callback) {
      //Checking if page not already visited and is a proper link and is of medium.com
      if (hashMap[link] == undefined && learnRegExp(link) && link.indexOf("medium.com") !== -1) {
        //Storing that page has been visited
        hashMap[link] = 1;
        //Writing it on csv
        writer.write({link: link});
        console.log(link);
        //getting links for this current link
        requestThrottler({method: 'GET', uri: link}, function (err, response, body) {
            if (body) {
              console.log("Received");
              var $ = cheerio.load(body);
              var links = $('a');
              $(links).each(function (i, link) {
                var tempLink = $(link).attr('href');
                if (tempLink) {
                  tempLink = tempLink.split('?')[0];
                  tempLink = tempLink.split('#')[0];
                  if (hashMap[tempLink] == undefined) {
                    getData(tempLink, function () {
                      //console.log("inside chain")
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

    //callback();
    getData("https://www.medium.com", function () {
      console.log("-------------------")
    });
  },
  asyncScraper: function () {
    //Initializing write stream
    writer.pipe(fs.createWriteStream('asyncLinks.csv'));

    //Hash map to keep a record of links already visited with fastest access time
    var hashMap = {};


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
        requestThrottler({method: 'GET', uri: link}, function (err, response, body) {
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
            if (arr.length) {
              async.parallel(arr, callback);
            } else {
              callback();
            }
          }
        });
      } else {
        callback();
      }
    }
    getData("https://www.medium.com", function () {
      console.log("Finished");
    });
  }
};
