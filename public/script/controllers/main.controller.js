(function (undefined) {
	'use strict';

	// shim layer with setTimeout fallback
	window.requestAnimFrame = (function () {
		return window.requestAnimationFrame ||
			window.webkitRequestAnimationFrame ||
			window.mozRequestAnimationFrame ||
			function (callback) {
				window.setTimeout(callback, 1000 / 60);
			};
	})();

	/**
	 * @ngdoc overview
	 * @name AddCard
	 * @description
	 * #
	 *
	 * Main module of the application.
	 */

	angular
		.module('frost.Superfight')
		.controller('MainCtrl', MainCtrl);

	/* @ngInject */
	function MainCtrl($timeout, $http) {

		var main = this;
		main.options = {
			debug: false
		};
		main.cards = [];
		main.states = {
			pending: false,
			success: false,
			error: false
		};

		// Public functions
		main.getCards = getCards;

		/**---------------------------------------
		 FUNCTION LIBRARY
		 ---------------------------------------**/

		function getCards() {
			console.log('getCards');
			main.states.pending = true;
			main.states.success = false;
			main.states.error = false;

			var req = {
				method: 'GET',
				url: '/api/getcards'
			};

			$http(req)
				.success(function (data, status, headers, config) {
					console.log('success', data);
					console.log('status', status);
					main.states.pending = false;
					main.states.success = true;
					main.states.error = false;
					return data;
				})
				.error(function (data, status, headers, config) {
					console.log('error', data);
					console.log('status', status);
					main.states.pending = false;
					main.states.success = false;
					main.states.error = true;
				});

			// try .bind(data) -> this -> data // Not in a angular object
		}

		// Debug log
		function log(msg1, msg2) {
			msg1 = (msg1 === undefined) ? null : msg1;
			msg2 = (msg2 === undefined) ? null : msg2;
			if (main.options.debug) {
				if (msg2 !== null) {
					try {
						console.log(msg1, msg2);
					}
					catch (err) {

					}
				}
				else {
					try {
						console.log(msg1);
					}
					catch (err) {

					}
				}
			}
		}

		/**---------------------------------------
		 BINDINGS
		 ---------------------------------------**/

		// Get all cards from db
		main.cards = getCards();
		console.log('main.cards', main.cards);

	}
})();
