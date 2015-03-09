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
		.controller('AddCardCtrl', AddCardCtrl);

	/* @ngInject */
	function AddCardCtrl($timeout, $http) {

		var main = this;
		main.options = {
			debug: false,
			useWebStorage: false
		};
		main.states = {};

		// Public functions
		main.postCard = postCard;

		/**---------------------------------------
		 FUNCTION LIBRARY
		 ---------------------------------------**/

		function postCard(formdata) {
			console.log('data', formdata);
			formdata.pending = true;
			formdata.success = false;
			formdata.error = false;

			var req = {
				method: 'POST',
				url: '/api/addcard',
				data: formdata
			};

			$http(req)
				.success(function (data, status, headers, config) {
					console.log('success', data);
					console.log('status', status);
					formdata.pending = false;
					formdata.success = true;
					formdata.error = false;
				})
				.error(function (data, status, headers, config) {
					console.log('error', data);
					console.log('status', status);
					formdata.pending = false;
					formdata.success = false;
					formdata.error = true;
				});

			// try .bind(data) -> this -> data // Not in a angular object
		}

		function setStorage(state) {
			state = (state === undefined) ? true : state;
			if (main.options.useWebStorage && typeof (Storage) !== 'undefined') {
				sessionStorage.setItem(main.options.cookieStorageName, state);
			}
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


	}
})();
