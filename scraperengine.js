var cheerio = require('cheerio')
var S = require('string')
var request = require('request').defaults({jar: true})
var md5 = require('MD5')
var fs = require('fs')
var fn={}
var index=-1
var nProcess=0
var doJob=null
var onFinish=null
var onComplated=null
var links=[]
var result=[]
var urls=[]
var baseRequest = request.defaults({
  headers: {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/43.0.2357.134 Safari/537.36'}
})
//DOM PROCESSOR

function urlToCheerio(url,callback){
	console.log('open url '+url)
	if(fs.existsSync('tmp/'+md5(url))) {
		var body= fs.readFileSync('tmp/'+md5(url),'utf-8')
	    return callback && callback(false,cheerio.load(body))
	}else
	baseRequest(url, function (error, response, body) {
	  if (!error && response.statusCode == 200) {
	  	  fs.writeFileSync('tmp/'+md5(url),body,'utf-8')
	     return callback && callback(false,cheerio.load(body))
	  }else{
	  	console.error('Fail load '+url)
	  	return callback && callback(true)
	  }
	})
}


//JOB MANAGER
function Callback(){
	this.done=function(callback){
		callback && callback();
	}
}

var startJob=function(action){		
	if(index>=links.length){
		onFinish && onFinish()
	}else
	if(nProcess==0){
		for(var i=0;i<fn.maxProcess;i++){
			nProcess++;
			startJob(true);
		}
	}else
	if(action)
	{		
		index++;
		console.log('start job '+index+' of '+links.length)
		doJob(links[index],function(){
			nProcess--;
			startJob();
		})		
	}
}

// TASKS
var getPaginationUrls=function(url,callback){	
	urlToCheerio(url,function(error,$){
		console.log('MAX ',fn.getMaxPages($))		
		for(var i=1;i<=parseInt(fn.getMaxPages($));i++){
			urls.push(fn.formatUrl(url,i))
		}		
		callback && callback()
	})
}
var doScrape=function(url,callback){
	urlToCheerio(url,function(error,$){
		var o={}
		for(var key in fn.fields){		
			o[key]=S(fn.fields[key]($)).trim().s
		}	
		result.push(o)
		callback && callback()
	})
	
}

// SCRAPER MAIN CODE
function confCheck(fnConf){
	if(!fnConf){
		throw new Error('.Scraper Object Input required!');
	}
	if(!fnConf.getAllCategorys){
		throw new Error('.getAllCategorys required!');
	}
	if(!fnConf.formatUrl){
		throw new Error('.formatUrl required!');
	}
	if(!fnConf.getMaxPages){
		throw new Error('.getMaxPages required!');
	}	
	if(!fnConf.homepage){
		throw new Error('.homepage required!');
	}
	if(!fnConf.maxProcess){
		throw new Error('.maxProcess required!');
	}	
	// if(!fnConf.fields){
	// 	throw new Error('.fields required!');
	// }		
	return true
}
function ScraperEngine(){
	this.start=function(fnConf){
		fn=fnConf		
		if(confCheck(fn)){
			urlToCheerio(fn.homepage,function(error,$){
				links=fn.getAllCategorys($)					
				doJob=getPaginationUrls			
				onFinish=function(){
					nProcess=0
					index=0
					links=[urls[0]]
					doJob=doScrape
					 onFinish=function(){
					 	onComplated && onComplated(result)
					 }
					startJob()
					//console.log(urls)
				}
				startJob()
			})
		}
	}
	this.done=function(callback){
		onComplated=callback
	}
}
module.exports = new ScraperEngine()
