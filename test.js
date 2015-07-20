var engine=require('./scraperengine')
engine.start({
	homepage:'http://lazada.co.id',
	getAllCategorys:function($){
		var urls=[]
		$('.sidebarSecond__itemTitle a').each(function(){			
			urls.push($(this).attr('href'))
		})
		return urls
	},
	maxProcess:1,
	getMaxPages:function($){
		//return $('.pages a').last().text();
		return 1
	},
	formatUrl:function(url,page){
		return url+'?page='+page;
	}

});
engine.done(function(result){
	console.log(result)
})