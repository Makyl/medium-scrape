var express = require('express'),
  router = express.Router(),
  request = require('request'),
  throttledRequest = require('throttled-request')(request),
  cheerio = require('cheerio'),
  Article = require('../models/article');
var csvWriter = require('csv-write-stream');
var fs = require('fs');
var writer = csvWriter();

throttledRequest.configure({
  requests: 5,
  milliseconds: 1000
});

module.exports = function (app) {
  app.use('/', router);
};

router.get('/scraper', function (req, res, next) {
  writer.pipe(fs.createWriteStream('links.csv'));
  var hashMap = {
    "https://www.medium.com": 1
  };
  var callback = function () {
    res.status(200).json({data: doc});
  };

  function learnRegExp(s) {
    var regexp = /(http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
    return regexp.test(s);
  }

  function getData(link, callback) {

    if (hashMap[link] == undefined && learnRegExp(link) && link.indexOf("medium.com") !== -1) {
      console.log(link);
      hashMap[link] = 1;
      writer.write({link: link});
      throttledRequest({method: 'GET', uri: link}, function (err, response, body) {
          if (body) {
            var $ = cheerio.load(body);
            var links = $('a');
            var arr = [];
            $(links).each(function (i, link) {
              var tempLink = $(link).attr('href');
              if (tempLink) {
                tempLink = tempLink.split('?')[0];
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
      callback();
    }
  }

  throttledRequest({method: 'GET', uri: "https://www.medium.com"}, function (err, response, body) {
    if (body) {
      var $ = cheerio.load(body);
      var links = $('a');
      var arr = [];
      $(links).each(function (i, link) {
        var tempLink = $(link).attr('href');
        if (tempLink) {
          tempLink = tempLink.split('?')[0];
          if (hashMap[tempLink] == undefined) {
            getData(tempLink, function (err, doc) {
              console.log("A chain completed");
            });
          }
        }
        console.log(i);
      });
    }
  });
})
  .get('/asyncScraper', function(req, res, next){

  })
