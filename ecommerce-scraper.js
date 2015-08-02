var pjson = require('./package.json');
var charm = require('charm')();
charm.pipe(process.stdout);
charm.reset();
var y = 0;
var cheerio = require('cheerio')
var S = require('string')
var request = require('request').defaults({
	jar: true
})
var md5 = require('MD5')
var fs = require('fs')
var fn = {}
var index = 0
var nProcess = 0
var doJob = null
var onFinish = null
var notFinish = true
var links = []
var result = []
var urls = []
var pageurls = []
var baseRequest = request.defaults({
	headers: {
		'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/43.0.2357.134 Safari/537.36'
	}
})
if (!fs.existsSync('tmp'))
	fs.mkdirSync('tmp')

	function write(str) {
		y++;
		charm.position(1, y)
		charm.write(str)
	}
	//DOM PROCESSOR

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


	//JOB MANAGER
	function Callback() {
		this.done = function(callback) {
			callback && callback();
		}
	}

var startJob = function(task, action) {
	charm.foreground('yellow')
	if (notFinish) {
		charm.foreground('red')
		charm.position(1, 2)
		var percent = (index / links.length) * 100;
		charm.write('Task Progress ' + percent + '%')
		charm.position(0, y)
	}
	if (notFinish && index >= links.length) {
		notFinish = false;
		onFinish && onFinish()
	} else
	if (nProcess == 0) {
		notFinish = true;
		fn.maxProcess = (fn.maxProcess <= links.length) ? fn.maxProcess : links.length
		for (var i = 0; i < fn.maxProcess; i++) {
			nProcess++;
			startJob(task, true);
		}
	} else
	if (action && notFinish) {
		nProcess--;
		index++;
		doJob(links[index - 1], function() {
			startJob(task);
		})


	}
}

// TASKS
var getPaginationUrls = function(url, callback) {
	urlToCheerio(url, function(error, $) {
		if (!error) {
			for (var i = 1; i <= parseInt(fn.getMaxPages($)); i++) {

				pageurls.push(fn.formatUrl(url, i))
			}
		}
		callback && callback()
	})
}
var doScraping = function(url, callback) {

	urlToCheerio(url, function(error, $) {
		if (!error) {
			var o = {}
			for (var key in fn.fields) {
				o[key] = S(fn.fields[key]($)).trim().s
			}
			result.push(o)
		}
		callback && callback()
	})

}
var getProductsUrl = function(url, callback) {

	urlToCheerio(url, function(error, $) {
		if (!error) {
			var productsUrl = fn.getProductsUrl($);
			for (var i in productsUrl) {
				urls.push(productsUrl[i])
			}
		}
		callback && callback()
	})
}
// SCRAPER MAIN CODE
	function confCheck(fnConf) {
		charm.foreground('white')
		if (!fnConf) {
			throw new Error('.Scraper Object Input required!');
		}
		if (!fnConf.getAllCategorys) {
			throw new Error('.getAllCategorys required!');
		}
		if (!fnConf.formatUrl) {
			throw new Error('.formatUrl required!');
		}
		if (!fnConf.getMaxPages) {
			throw new Error('.getMaxPages required!');
		}
		if (!fnConf.homepage) {
			throw new Error('.homepage required!');
		}
		if (!fnConf.maxProcess) {
			throw new Error('.maxProcess required!');
		}
		if (!fnConf.getProductsUrl) {
			throw new Error('.getProductsUrl required!');
		}
		if (!fnConf.onComplated) {
			throw new Error('.onComplated required!');
		}
		// if(!fnConf.fields){
		// 	throw new Error('.fields required!');
		// }
		return true
	}

	function ScraperEngine() {
		this.start = function(fnConf) {
			fn = fnConf
			write(pjson.name + ' ' + pjson.version + '\n')
			write('preparing... \n')
			write('----------------- \n')

			if (confCheck(fn)) {
				urlToCheerio(fn.homepage, function(error, $) {
					links = fn.getAllCategorys($)
					doJob = getPaginationUrls
					onFinish = function() {
						charm.foreground('magenta')
						write('done \n')
						nProcess = 0
						index = 0
						links = pageurls
						doJob = getProductsUrl
						onFinish = function() {
							charm.foreground('magenta')
							write('done \n')
							nProcess = 0
							index = 0
							links = urls
							// links=[]
							// for(var i=0;i<10;i++){
							//   links.push(urls[i])
							// }
							doJob = doScraping
							onFinish = function() {
								charm.foreground('magenta')
								write('done \n')
								charm.foreground('white')
								fn.onComplated && fn.onComplated(result)
							}
							charm.foreground('magenta')
							write("start doScraping\n")
							startJob("doScraping")
						}
						charm.foreground('magenta')
						write("start getProductUrl\n")
						startJob("getProductUrl")
					}
					charm.foreground('magenta')
					write("start getPaginationUrls\n")
					startJob("getPaginationUrls")
				})
			}
		}
		this.done = function(callback) {
			onComplated = callback
		}
	}
module.exports = new ScraperEngine()