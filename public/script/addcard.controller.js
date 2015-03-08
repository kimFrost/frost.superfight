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
		.module('frost.superfight')
		.controller('AddCardCtrl', AddCardCtrl);

    /* @ngInject */
    function AddCardCtrl($timeout) {

        var main = this;
        main.options = {
            debug: false,
            useWebStorage: false
        };
        main.states = {

        };

        // Public functions
        main.postCard = postCard;

/**---------------------------------------
		FUNCTION LIBRARY
---------------------------------------**/

		function postCard(data) {
			console.log('data', data);
		}

        function setStorage(state) {
            state = (state === undefined) ? true : state;
            if (main.options.useWebStorage && typeof (Storage) !== 'undefined') {
                sessionStorage.setItem(main.options.cookieStorageName, state);
            }
            else {
                setCookie(main.options.cookieStorageName, state, 365);
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
