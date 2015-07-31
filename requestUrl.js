var charm = require('charm')();
var fs = require('fs');
var md5 = require('MD5')
var cheerio = require('cheerio')
var request = require('request').defaults({
	jar: true
})

var baseRequest = request.defaults({
	headers: {
		'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/43.0.2357.134 Safari/537.36'
	}
})

var y=1;
function write(str) {
  y++;
  charm.position(1, y)
  charm.write(str)
}

function urlToCheerio(url, callback, nocache) {
  charm.foreground('blue')

  if (!nocache && fs.existsSync('tmp/' + md5(url))) {
    var body = fs.readFileSync('tmp/' + md5(url), 'utf-8')
    write('|--DONE ' + url + '\n')
    return callback && callback(false, cheerio.load(body))
  } else
    baseRequest(url, function(error, response, body) {
      if (!error && response.statusCode == 200) {
        fs.writeFileSync('tmp/' + md5(url), body, 'utf-8')
        write('|--DONE ' + url + '-' + md5(url) + '\n')
        return callback && callback(false, cheerio.load(body))
      } else {
        charm.foreground('red')
        write('|--FAIL ' + url)
        return callback && callback(true)
      }
    })
}
var utils={
  write:write,
  urlToCheerio:urlToCheerio
}
module.exports=utils;
