var cheerio = require('cheerio')
var S = require('string')
var request = require('request').defaults({
	jar: true
})
var urlToCheerio = require('./requestUrl');
var md5 = require('MD5')
var fs = require('fs')
var url =process.argv[2]
urlToCheerio(url, function(error, $) {
  if (!error) {
    var o = {}
    for (var key in fn.fields) {
      o[key] = S(fn.fields[key]($)).trim().s
    }
    result.push(o)
  }
  console.log(JSON.stringify(result));
})
