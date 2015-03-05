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
		.directive('stickyContainer', ['$timeout', stickyContainer]);

	function stickyContainer($timeout) {
		var directive = {
			replace: false,
			link: link,
			scope: false,
			restrict: 'A',
			controller: controller,
			controllerAs: 'stickycon',
			bindToController: true
		};
		return directive;

		function link(scope, element, attrs) {

			scope.stickycon.elem = element;

			// Update Loop
			function updateLoop() {
				// Set next update call
				window.requestAnimFrame(updateLoop);
				// Update values
				update();
			}

			// Update
			function update() {
				var el = element[0];
				var offsets = el.getBoundingClientRect();
				// Push from top distance
				var topDiff = offsets.top;
				// Self height
				var height = offsets.height;
				if (topDiff > 0) {
					topDiff = 0;
				}
				topDiff = Math.abs(topDiff);
				scope.stickycon.metric.height = height;
				scope.stickycon.metric.pushFromTop = topDiff;
				// Child component will self cal and monitor distance from bottom
			}

			updateLoop();
		}

		// Inject dependecies to controller
		controller.$inject = ['$element'];

		function controller($element) {
			var stickycon = this;
			stickycon.options = {};
			stickycon.metric = {
				height: null,
				pushFromTop: null
			};
			stickycon.elem = $element;
			stickycon.states = {

			};
			stickycon.temp = {};
			stickycon.css = {};

			// Directive functions
			stickycon.getMetric = function() {
				return this.metric;
			}
		}
	}
})();

