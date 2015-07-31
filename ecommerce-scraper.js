var pjson = require('./package.json');
var charm = require('charm')();
charm.pipe(process.stdout);
charm.reset();
var S = require('string')
var utils = require('./requestUrl');
var urlToCheerio=utils.urlToCheerio
var write=utils.write
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
if (!fs.existsSync('tmp'))
	fs.mkdirSync('tmp')


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


			var percent = (index / links.length) * 100;
			write('Task Progress ' + percent + '%')


	}
	if (notFinish && index >= links.length) {
		write(notFinish,index,links.length)
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
	console.log("SHELL")
	var spawn = require('child_process').spawn,
	    ls    = spawn('node bitscraper.js', [url]);

	ls.stdout.on('data', function (data) {
	  var jdata = JSON.parse(data)
		for(var i in jdata){
			result.push(jdata[i])
		}
		callback && callback()
	});

	ls.stderr.on('data', function (data) {
		callback && callback()
	  write('stderr: ' + data);
	});

	ls.on('close', function (code) {
	  write('child process exited with code ' + code);

	});
}
var getProductsUrl = function(url, callback) {

	urlToCheerio(url, function(error, $) {
		if (!error) {
			var productsUrl = fn.getProductsUrl($);
			write('___O')
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
