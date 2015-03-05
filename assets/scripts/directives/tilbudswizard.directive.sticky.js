// shim layer with setTimeout fallback
window.requestAnimFrame = (function(){
	return  window.requestAnimationFrame       ||
		window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame    ||
		function( callback ){
			window.setTimeout(callback, 1000 / 60);
		};
})();

(function (undefiend) {
	'use strict';

	angular
		.module('tilbudswizard')
		.directive('sticky', ['$timeout', sticky]);

	function sticky($timeout) {
		var directive = {
			replace: false,
			require: '^stickyContainer',
			link: link,
			scope: false,
			restrict: 'A',
			controller: controller,
			controllerAs: 'sticky',
			bindToController: true
		};
		return directive;

		function link(scope, element, attrs, controller) {

			function updateLoop() {
				window.requestAnimFrame(updateLoop);
				update();
			}

			function update() {
				var metric = controller.getMetric();
				var offsets = element[0].getBoundingClientRect();
				// Only force update if one of the metrics has changes
				if (metric.pushFromTop != scope.sticky.metric.pushFromTop || metric.height != scope.sticky.metric.containerHeight || scope.sticky.metric.height != offsets.height) {
					scope.sticky.metric.pushFromTop = metric.pushFromTop;
					scope.sticky.metric.containerHeight = metric.height;
					scope.sticky.metric.height = offsets.height;
					updateData();
				}
			}

			function updateData() {
				var value = scope.sticky.metric.pushFromTop;
				var maxPush = scope.sticky.metric.containerHeight - scope.sticky.metric.height;
				if (value > maxPush) {
					value = maxPush;
				}

				// Js direct set style for much better performance.
				element[0].style.mozTransform = 'translate(0px, '+ value +'px)';
				element[0].style.msTransform = 'translate(0px, '+ value +'px)';
				element[0].style.webkitTransform = 'translate(0px, '+ value +'px)';
				element[0].style.OTransform  = 'translate(0px, '+ value +'px)';
				element[0].style.transform = 'translate(0px, '+ value +'px)';

				/*
				var css = {
					"-moz-transform": "translate(0px, "+ value +"px)",
					"-ms-transform": "translate(0px, "+ value +"px)",
					"-webkit-transform": "translate(0px, "+ value +"px)",
					"transform": "translate(0px, "+ value +"px)"
				};
				scope.sticky.css = css;
				setTimeout(function(){
					scope.$apply(); // Remove this for a better performance. But will not update on every tick
				},0);
				*/
			}
			updateLoop();
		}

		function controller() {
			var sticky = this;
			sticky.options = {};
			sticky.metric = {
				top: null,
				left: null,
				pushFromTop: null,
				height: null,
				containerHeight: null
			};
			sticky.states = {};
			sticky.temp = {};
			sticky.css = {};

			// Function Library
			// Visible
			sticky.visible = function(element) {
				return (element.offsetWidth > 0 && element.offsetHeight > 0);
				/*
				if (element.offsetWidth > 0 && element.offsetHeight > 0) {
					return true;
				}
				else {
					return false;
				}
				*/
			};

		}
	}
})();
