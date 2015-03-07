'use strict';

// shim layer with setTimeout fallback
window.requestAnimFrame = (function(){
	return  window.requestAnimationFrame       ||
		window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame    ||
		function( callback ){
			window.setTimeout(callback, 1000 / 60);
		};
})();

;(function(window, document, undefined) {

	var banner = {
    options: {
      debug: false,
      //feedUrl: 'assets/scripts/feed.json',
      feedUrl: 'feed.json',
      loop: true,
      maxThumbsShown: 5,
      autoplay: false,
      autoplaytime: 10000,
      boxAnimationTime: 300,
      swipeMinTime: 50,
      swipeMaxTime: 400,
      swipeMinDistance: 100,
      swipeMaxDistance: 1600,
      clickPreventTime: 100
    },
		logCount: 0,
    categories: [],
    products: [],
    autoplay: null,
    currentIndex: 0,
    teaserIndex: 0,
    thumbIndexOffset: 0,
    numOfSlides: 0,
    timer: null,
    states: {
      boxAnimating: false,
      slideAnimating: false
    }
	};
/**---------------------------------------
	Log
---------------------------------------**/
	banner.log = function(msg, msg2) {
    if (!banner.options.debug) {
      return;
    }
		try {
			if (banner.logCount > 500) {
				console.clear();
				banner.logCount = 0;
			}
			if (msg2 !== undefined) {
				console.log(msg, msg2);
			}
			else {
				console.log(msg);
			}
			banner.logCount++;
		}
		catch(err) {
			//send error to developer platform
		}
	};
/**---------------------------------------
	Get Feed Data
---------------------------------------**/
	var getFeed = function() {
    var xmlhttp = new XMLHttpRequest();
    var feedUrl =banner.options.feedUrl;
    xmlhttp.onreadystatechange = function() {
      if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
        var data = JSON.parse(xmlhttp.responseText);
        banner.log('data', data);
        banner.categories = enrichCategories(data.categories);
        banner.products = enrichProducts(data.products);
        banner.teasers = data.teasers;
        banner.numOfSlides = banner.products.length;
        injectHtml();
      }
    };
    xmlhttp.open('GET', feedUrl, true);
    xmlhttp.send();
	};
  // Add states to products and categories
  var enrichCategories = function(list) {
    for (var i=0;i<list.length; i++) {
      var item = list[i];
      item.states = {
        active: true
      };
    }
    return list;
  };
  var enrichProducts = function(list) {
    for (var i=0;i<list.length; i++) {
      var item = list[i];
      item.states = {
        active: false,
        show: true
      };
    }
    return list;
  };
/**---------------------------------------
	DOM Functions
---------------------------------------**/
  // injectHtml
  var injectHtml = function() {

    // Inject Products HTML
    var container = document.querySelector('.banner__slides');
    var thumbContainer = document.querySelector('.banner__thumbs');
    if (container === null || thumbContainer === null) {
      return false;
    }

    var elem = document.createElement('div');
    var elemImg = document.createElement('img');
    elem.className = 'banner__productimage';
    elem.appendChild(elemImg);

    var i;
    for (i=0;i<banner.products.length; i++) {
      var product = banner.products[i];

      var thumbElem = document.createElement('div');
      var thumbElemImg = document.createElement('img');

      //elemImg.src = product.img;

      thumbElem.className = 'banner__thumb';
      var thumbOnclick =  document.createAttribute('onclick');
      thumbOnclick.value = 'window.banner.switchSlide('+i+', true)';
      thumbElem.setAttributeNode(thumbOnclick); // Bind thumb onclick
      //thumbElem.textContent = i; // For debugging
      thumbElemImg.src = product.thumbImg;

      elem.appendChild(elemImg);
      container.appendChild(elem);
      thumbElem.appendChild(thumbElemImg);
      thumbContainer.appendChild(thumbElem);

      product.elem = elem;
      product.elemImg = elemImg;
      product.thumbElem = thumbElem;
      product.index = i;
      banner.log('product', product);
    }

    // Inject Teaser HTML
    container = document.querySelector('.banner__160x600');
    var teaserElem = document.createElement('div');
    var teaserImgElem = document.createElement('img');
    teaserElem.className = 'banner__teaser';
    container.appendChild(teaserElem);
    teaserElem.appendChild(teaserImgElem);

    for (i=0;i<banner.teasers.length; i++) {
      var teaser = banner.teasers[i];
      teaser.teaserImgElem = teaserImgElem;
    }

    updateDOM(true);
    updateTeaser();
  };
  // Update DOM
  var updateDOM = function(updateIndex) {
    updateIndex = (updateIndex === undefined) ? false : updateIndex;
    //banner.log('updateDOM', banner.currentIndex);
    var shownProducts = [];
    var i = 0,
        product;
    // Update product show state
    for (i=0;i<banner.products.length; i++) {
      product = banner.products[i];

      var categoriesValid = false;
      if (product.categories.length === 0) {
        categoriesValid = true; // The product should be shown
      }
      for (var ii = 0; ii < product.categories.length; ii++) {
        var _category = product.categories[ii];
        for (var iii = 0; iii < banner.categories.length; iii++) {
          if (banner.categories[iii].id === _category) {
            if (banner.categories[iii].states.active) {
              categoriesValid = true; // The product should be shown
            }
          }
        }
      }
      product.states.show = categoriesValid;
      if (product.states.show) {
        shownProducts.push(product);
      }
    }
    // Update product active state and position
    var shownIndex = 0;
    banner.numOfSlides = shownProducts.length;
    for (i=0;i<banner.products.length; i++) {
      product = banner.products[i];
      if (product.states.show) {
        if (shownIndex === 0 && updateIndex) {
          banner.currentIndex = product.index;
          //banner.thumbIndexOffset = 0; // Reset thumbs offset index
          banner.thumbIndexOffset = banner.numOfSlides; // Reset thumbs offset index
        }
        var localOffset = (shownIndex + banner.thumbIndexOffset) % banner.numOfSlides;
        //var localOffset = (shownIndex + banner.thumbIndexOffset) % banner.options.maxThumbsShown;
        //banner.log('localOffset', localOffset);
        //banner.log('shownIndex', shownIndex);
        if (localOffset < 5 && localOffset >= 0) {
          product.thumbElem.className = 'banner__thumb banner__thumb--pos'+localOffset;
        }
        /* The math is not correct. I am using a thumbIndexOffset force offset instead in switchThumb()
        else if (shownIndex <= ((banner.numOfSlides + banner.options.maxThumbsShown) + localOffset)) {
          product.thumbElem.className = 'banner__thumb banner__thumb--pos'+Math.abs(localOffset);
        }
        */
        else {
          product.thumbElem.className = 'banner__thumb';
        }
        shownIndex++;
      }
      else {
        product.thumbElem.className = 'banner__thumb';
      }


      // Update product active state
      if (product.index === banner.currentIndex) {
        var container = document.querySelector('.banner__930x600');
        var productInfoContainer = container.querySelector('.banner__productinfo');
        container.querySelector('.splash__line1').innerText = product.splashLine1;
        container.querySelector('.splash__line2').innerText = product.splashLine2;
        var html = '';
        html += '<div class="rte"><img src="'+product.logoImg+'">';
        html += '<div class="rte__headline">'+product.price+'</div>';
        html += '<p class="rte__tiny">'+product.desc+'<br>'+product.descAlt+'</p><a class="btn" href="'+product.href+'" target="_blank">Se detaljer her</a><a class="btn">Se flere tilbud</a>';
        html += '</div>';
        productInfoContainer.innerHTML = html;
        //product.elem.className += ' banner__productimage--active';
        product.elemImg.src = product.img;
        product.thumbElem.className =  product.thumbElem.className + ' banner__thumb--active';
      }
      else {
        product.elem.className = product.elem.className.replace(/banner__productimage--active/g, '');
        product.thumbElem.className = product.thumbElem.className.replace(/banner__thumb--active/g, '');
      }
    }
    banner.log('banner.thumbIndexOffset', banner.thumbIndexOffset);
  };
  // categoryChange
  banner.categoryChange = function(category, elem) {
    //banner.log(category, elem.checked);
    var found = false;
    for (var i=0;i<banner.categories.length;i++) {
      var _category = banner.categories[i];
      //banner.log(_category);
      if (_category.id === category) {
        _category.states.active = elem.checked;
        found = true;
        break;
      }
    }
    if (found) {
      updateDOM(true);
    }
  };
  var updateTeaser = function() {
    var container = document.querySelector('.banner__160x600');
    var teaser = banner.teasers[banner.teaserIndex];
    teaser.teaserImgElem.src = teaser.img;
    container.querySelector('.splash__line1').innerText = teaser.splashLine1;
    container.querySelector('.splash__line2').innerText = teaser.splashLine2;

    setTimeout(function() {
      banner.teaserIndex++;
      if (banner.teaserIndex > 2) {
        banner.teaserIndex = 0;
      }
      updateTeaser();
    }, 5000);
  };
/**---------------------------------------
  SLides Logic
---------------------------------------**/
  // Set state of autoplay
  function setAutoPlay(direction) {
  direction = (direction === undefined) ? 1 : direction;
  if (banner.options.autoplay) {
    banner.timer = setTimeout(function(){
      banner.switchSlide(direction);
    },banner.options.autoplaytime);
  }
}
  // Switch Slide
  banner.switchSlide = function(direction, jump) {
    //banner.log('switchSlide', direction);
    direction = (direction === undefined) ? 1 : direction;
    jump = (jump === undefined) ? false : jump;
    clearTimeout(banner.timer);
    var activeIndex = banner.currentIndex;
    var newActiveIndex;
    if (jump) {
      newActiveIndex = direction;
    }
    else {
      var shownProducts = [];
      var i,
          product;
      for (i=0;i<banner.products.length; i++) {
        product = banner.products[i];
        if (product.states.show) {
          shownProducts.push(product);
        }
      }
      banner.log('shownProducts', shownProducts);
      banner.log('activeIndex', activeIndex);
      if (banner.options.loop) {
        for (i=0;i<shownProducts.length; i++) {
          product = shownProducts[i];
          if (product.index === activeIndex) {

            newActiveIndex = (i+direction) % shownProducts.length;
            if (newActiveIndex < 0) {
              newActiveIndex = shownProducts.length + newActiveIndex;
            }
            banner.log('MATH', (i+direction) % shownProducts.length);
            banner.log('newActiveIndex', newActiveIndex);
            newActiveIndex = shownProducts[newActiveIndex].index;
            /*
            if (shownProducts[i+direction] !== undefined) {
              newActiveIndex = shownProducts[i+direction ].index;
            }
            else {
              newActiveIndex = shownProducts[i+direction].index;
            }
            */
          }
        }
      }
      else {
        for (i=0;i<shownProducts.length; i++) {
          product = shownProducts[i];
          if (product.index === activeIndex) {
            if (shownProducts[i+direction] !== undefined) {
              newActiveIndex = shownProducts[i+direction].index;
            }
          }
        }
      }
      /*
      if (banner.options.loop) {
        newActiveIndex = (activeIndex + direction) % banner.numOfSlides;
      }
      else {
        newActiveIndex = activeIndex + direction;
        if (newActiveIndex > (banner.numOfSlides-1)) {
          newActiveIndex = banner.numOfSlides-1;
        }
      }
      */
    }
    /*
    if (newActiveIndex < 0) {
      if (banner.options.loop) {
        newActiveIndex = Math.abs(banner.numOfSlides + newActiveIndex);
      }
      else {
        newActiveIndex = 0;
      }
    }
    */
    banner.currentIndex = newActiveIndex;
    //setPos();
    updateDOM();
    setAutoPlay(direction);
  };
  // Switch Thumb
  banner.switchThumb = function(direction) {
    banner.thumbIndexOffset -= direction;
    if (banner.thumbIndexOffset <= 0) {
      banner.thumbIndexOffset = banner.numOfSlides;
    }
    updateDOM();
  };
  function setPos() {
    var leftPos = -(banner.currentIndex * 100);
    var css = {
      '-moz-transform': 'translate(' + leftPos +'%, 0%)',
      '-ms-transform': 'translate(' + leftPos +'%, 0%)',
      '-webkit-transform':'translate(' + leftPos +'%, 0%)',
      'transform': 'translate(' + leftPos +'%, 0%)'
    };
    banner.css = css;
  }
/**---------------------------------------
	Bindings
---------------------------------------**/

/**---------------------------------------
	Initialize
---------------------------------------**/
  getFeed();
  window.banner = banner;

})(window, window.document);
