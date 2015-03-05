(function (undefined) {
	'use strict';

	angular
		.module('noerd.BrugSkallen')
		.controller('SlidesCtrl', SlidesCtrl);

	/* @ngInject */
	function SlidesCtrl($scope, $rootScope , $timeout, $element, trackingService) {

		var slides = this;
		slides.options = {
			debug: false,
			loop: true,
			autoplay: false,
			autoplaytime: 10000,
			boxAnimationTime: 300,
			swipeMinTime: 50,
			swipeMaxTime: 400,
			swipeMinDistance: 100,
			swipeMaxDistance: 1600,
			clickPreventTime: 100
		};
		slides.autoplay = null;
		slides.currentIndex = 0;
		slides.numOfSlides = 0;
		slides.timer = null;
		slides.states = {
			show: false,
			boxAnimating: false,
			slideAnimating: false,
			moveListen: false
		};
		slides.temp = {
			baseTime: null,
			basePointX: null,
			baseX: null,
			allowClick: true,
			lastTouchClientX: null
		};
		slides.css = {};

		// Public functions
		slides.switchSlide = switchSlide;
		slides.checkActive = checkActive;

/**---------------------------------------
		FUNCTION LIBRARY
---------------------------------------**/
		// Debug log
		function log(msg1, msg2) {
			msg1 = (msg1 === undefined) ? null : msg1;
			msg2 = (msg2 === undefined) ? null : msg2;
			if (slides.options.debug) {
				if (msg2 !== null) {
					try {
						console.log(msg1, msg2);
					}
					catch(err) {

					}
				}
				else {
					try {
						console.log(msg1);
					}
					catch(err) {

					}
				}
			}
		}
		// Check active
		function checkActive(id) {
			if (id !== undefined) {
				if (id === slides.currentIndex) {
					return true;
				}
				else {
					return false;
				}
			}
		}
		// Set state of autoplay
		function setAutoPlay(direction) {
			direction = (direction === undefined) ? 1 : direction;
			log('setAutoPlay', slides.options.autoplay);
			if (slides.options.autoplay) {
				slides.timer = $timeout(function(){
					switchSlide(direction);
				},slides.options.autoplaytime);
			}
		}
		// Switch Slide
		function switchSlide(direction, jump) {
			direction = (direction === undefined) ? 1 : direction;
			jump = (jump === undefined) ? false : jump;
			log('switchSlide', slides);
			$timeout.cancel(slides.timer);
			var activeIndex = slides.currentIndex;
			var newActiveIndex;
			if (jump) {
				newActiveIndex = direction;
			}
			else {
				if (slides.options.loop) {
					newActiveIndex = (activeIndex + direction) % slides.numOfSlides;
				}
				else {
					newActiveIndex = activeIndex + direction;
					if (newActiveIndex > (slides.numOfSlides-1)) {
						newActiveIndex = slides.numOfSlides-1;
					}
				}
			}
			if (newActiveIndex < 0) {
				if (slides.options.loop) {
					newActiveIndex = Math.abs(slides.numOfSlides + newActiveIndex);
				}
				else {
					newActiveIndex = 0;
				}
			}
			slides.currentIndex = newActiveIndex;
			setPos();
			setAutoPlay(direction);
      $rootScope.$broadcast('AUDIO_STOP');
			trackingService.trackEvent('Recipes', 'Switch slide', 'Index', newActiveIndex);
		}
		function setPos() {
			var leftPos = -(slides.currentIndex * 100);
			var css = {
				'-moz-transform': 'translate(' + leftPos +'%, 0%)',
				'-ms-transform': 'translate(' + leftPos +'%, 0%)',
				'-webkit-transform':'translate(' + leftPos +'%, 0%)',
				'transform': 'translate(' + leftPos +'%, 0%)'
			};
			slides.css = css;
		}
/**---------------------------------------
		BINDINGS
---------------------------------------**/
		// Watch slides list count from attribute. Yes, I know its dirty.
		$scope.$watch($element.attr('data-slides'), function(val) {
			slides.numOfSlides = val;
		});
		// Watch slides autoplay state from attribute. Yes, I know its dirty.
		$scope.$watch($element.attr('data-slides-autoplay'), function(val) {
      if (val === 'false') {
        val = false;
      }
      else if (val === 'true') {
        val = true;
      }
			slides.options.autoplay = val;
			setAutoPlay();
		});


		// Bind mouse down
		$element.bind('mousedown touchstart', function(event) {
			var baseX = 0;
			if (event.touches !== undefined) {
				baseX = event.touches[0].clientX;
			}
			else {
				baseX = event.clientX;
			}
			slides.temp.baseTime = Date.now();
			slides.temp.baseX = baseX;
			slides.temp.basePointX = baseX;

			//$scope.$apply(function() {
				slides.states.noAnimate = true;
				slides.states.moveListen = true;
			//});

		});

		// Prevent firefox link drag from blocking script
		$element.bind('dragstart', function(event) {
			event.preventDefault();
		});

		// Move while holding down
		$element.bind('mousemove touchmove', function(event) {
			if (slides.states.moveListen) {
				var posX = 0;
				if (event.touches !== undefined) {
					posX = event.touches[0].clientX;
				}
				else {
					posX = event.clientX;
				}
				slides.temp.baseX = posX;
			}
		});

		// Bind mouse Up and Leave
		$element.bind('mouseup mouseleave touchend', function (event) {
			slides.states.noAnimate = false;
			slides.states.moveListen = false;

			var x = 0;
			if (event.changedTouches !== undefined) {
				x = event.changedTouches[0].clientX;
			}
			else {
				x = event.clientX;
			}
			var timeDiff = Date.now() - slides.temp.baseTime;
			var xDistance = x - slides.temp.basePointX;
			var direction = 1;
			if (xDistance > 0) {
				direction = -1;
			}
			xDistance = Math.abs(xDistance);

			//log('v---------GROUP----------v');
			//log('x', x);
			//log('timeDiff', timeDiff);
			//log('xDistance', xDistance);
			//log('direction', direction);
			//log('slides.states.noAnimate', slides.states.noAnimate);

			if (timeDiff > slides.options.swipeMinTime &&
				timeDiff < slides.options.swipeMaxTime &&
				xDistance < slides.options.swipeMaxDistance &&
				xDistance > slides.options.swipeMinDistance
				) {
				log('swipe');
				slides.temp.allowClick = false;
				slides.switchSlide(direction);
				$scope.$apply();
			}
			else if (xDistance === 0) {
				// Didn't move cursor, therefore a single click
				slides.temp.allowClick = true;

			}
			else {
				slides.temp.allowClick = false;
				//log('recal');
				//recalPos();
			}

			//$scope.$apply();

		});


	}
})();
