//lazada.js
//node lazada.js

var engine=require('ecommerce-scraper')
var fs=require('fs')
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
		if(!$ && $('.pages a').length<=0){
						return 1
		}
        var max=parseInt($('.pages a').last().text());
		// if(max>5){
		// 	return 5
		// }else{
			return 1
		//}
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
		sites:function($){
			return "lazada"
		},
		producturl:function($){
			return $('link[rel=alternate]').attr('href')
		},
		description:function($){
			return $('#productDetails').text();
		},
		discount:function($){
			return $('#product_saving_percentage').text();
		},
		seller:function($){
            return $('.prod_header_brand_action a').first().text()
		},
        title:function($){
            return $('#prod_title').text()
        },
        price:function($){
            return $('#special_price_box').text()
        },
		kategori:function($){
			return $('.header__breadcrumb__wrapper li').first().text()
		}

    },
    onComplated:function(result){
		fs.writeFileSync('lazada.json',JSON.stringify(result),'utf-8')
    }
});
