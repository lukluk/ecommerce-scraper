# ecommerce-scraper
ecommerce scraper

## install
```
npm install ecommerce-scraper
```
## Examples
### Lazada Scraper
```
//lazada.js
//node lazada.js

var engine=require('ecommerce-scraper')

engine.start({
	homepage:'http://lazada.co.id',
	getAllCategorys:function($){
		var catUrls=[]
		$('.sidebarSecond__itemTitle a').each(function(){
			catUrls.push($(this).attr('href'))
		})
		return catUrls
	},
	maxProcess:2,
	getMaxPages:function($){
		//return $('.pages a').last().text();
		return 1
	},
	formatUrl:function(url,page){
		return url+'?page='+page;
	},
	getProductsUrl:function($){
		var productUrls=[]
		$('.product-card').each(function(){
			productUrls.push($(this).attr('href'))
		})
		return productUrls
	},
	fields:{
		title:function($){
			return $('#prod_title').text()
		},
		brand:function($){
			return $('.prod_header_brand_action a').first().text()
		},
		special_price:function($){
			return $('#special_price_box').text()
		}

	},
	onComplated:function(result){
		console.log(result)
	}
});

```
### Tokopedia Scraper
```
// tokopedia.js
// node tokopedia.js

var engine=require('ecommerce-scraper')

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
```
