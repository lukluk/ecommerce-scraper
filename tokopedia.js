
var engine=require('./ecommerce-scraper')

engine.start({
	homepage:'http://tokopedia.com',
	getAllCategorys:function($){
		var catUrls=[]
		$('.allcat a').each(function(){
			catUrls.push($(this).attr('href'))
		})
		return catUrls
	},
	maxProcess:2,
	getMaxPages:function($){
		return 1
	},
	formatUrl:function(url,page){
		return url+'?page='+page;
	},
	getProductsUrl:function($){
		var productUrls=[]
		$('.product').each(function(){
			productUrls.push($(this).find('a').first().attr('href'))
		})
		return productUrls
	},
	fields:{
		title:function($){
			return $('.product-title').text()
		},
		price:function($){
			return $('span[itemprop=price]').first().text()
		},
		category:function($){
			return $('.breadcrumb li').eq(2).text()
		}

	},
	onComplated:function(result){
		console.log(result)
	}
});
