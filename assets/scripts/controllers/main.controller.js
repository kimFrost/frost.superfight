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
	 * @name MainController
	 * @description
	 * #
	 *
	 * Main module of the application.
	 */

    angular
		.module('noerd.BrugSkallen')
		.controller('MainCtrl', MainCtrl);

    /* @ngInject */
    function MainCtrl($rootScope, $scope, $window, $interval, $timeout, $location, trackingService) {

        var main = this;
        main.options = {
            debug: false,
            useWebStorage: false,
            cookieStorageName: 'CookieAccepted'
        };
        main.activePanelIndex = 0;
        main.lockScrollTop = 0;
        main.experimentIdentifier = '/aegsperiment/';
        main.overlays = {
            juicy: {
                states: {
                    show: false
                }
            }
        };
        main.states = {
            showCookiePopup: true,
            expandHeader: false,
            lockPageScroll: false,
            showOverlayScrollIndicator: false
        };

        // Public functions
        main.setStorage = setStorage;
        main.toggleHeader = toggleHeader;
        main.activePanel = activePanel;
        main.toggleOverlay = toggleOverlay;
        main.registerOverlay = registerOverlay;
        main.closeAllOverlays = closeAllOverlays;
        main.navigateOverlay = navigateOverlay;

        // -------------------------------------------------

        $rootScope.$on('$locationChangeSuccess', function() {
            var identifier = main.experimentIdentifier;
            var url = $location.url();
            var urlName = '';

            if (url.indexOf(identifier) === 0) {
                urlName = url.replace(identifier, '');

                // Navigate to experiments section
                //main.activePanel(2);
                //window.snap.scrolltoIndex(2);

                // Open overlay
                main.toggleOverlay(urlName, true, false, undefined, true);
            }
        });

        /**---------------------------------------
                FUNCTION LIBRARY
        ---------------------------------------**/

        // Navigate overlay
        function navigateOverlay(urlName) {
            var url = main.experimentIdentifier + urlName;
          //log.log(url);
          $location.url(url);
        }

        // Overlay
        function toggleOverlay(id, state, doTrack, title, showScrollIndicator) {
            state = (state === undefined) ? 'toggle' : state;
            doTrack = (doTrack === undefined) ? false : doTrack;
            title = (title === undefined) ? 'No title' : title;
            showScrollIndicator = (showScrollIndicator === undefined) ? false : showScrollIndicator;
            if (main.overlays[id] === undefined) {
                return undefined;
            }
            if (state === 'toggle') {
                state = !main.overlays[id].states.show;
            }
            log('state', state);
            main.overlays[id].states.show = state;
            main.states.lockPageScroll = state;
            window.snap.scrollLock = main.states.lockPageScroll;
            if (state) {
                //main.lockScrollTop = document.documentElement.scrollTop;
                main.lockScrollTop = window.pageYOffset;
                //console.log(main.lockScrollTop);
                if (doTrack) {
                    trackingService.trackEvent('Overlay', 'Show', '', title);
                }
                if (showScrollIndicator) {
                    main.states.showScrollIndicator = true;
                    $timeout(function () {
                        main.states.showScrollIndicator = false;
                    }, 3000);
                }
                for (var key in main.overlays) {
                    if (key !== id) {
                        main.overlays[key].states.show = !state;
                    }
                }
            }
            else {
                main.states.showScrollIndicator = false;
                setTimeout(function () {
                    window.scrollTo(0, main.lockScrollTop);
                }, 50);
            }
        }

        function closeAllOverlays(event) {
            for (var key in main.overlays) {
                main.overlays[key].states.show = false;
            }
            main.states.lockPageScroll = false;
            main.states.showScrollIndicator = false;
            window.snap.scrollLock = main.states.lockPageScroll;
            // Reset URL
            $location.url('');
            setTimeout(function () {
                window.scrollTo(0, main.lockScrollTop);
            }, 50);
        }

        function registerOverlay(id) {
            log('registerOverlay', id);
            if (id !== undefined) {
                main.overlays[id] = {
                    states: {
                        show: false
                    }
                };
            }
        }

        // Header Toggle
        function toggleHeader(state) {
            state = (state === undefined) ? 'toggle' : state;
            if (state === 'toggle') {
                state = !main.states.expandHeader;
            }
            main.states.expandHeader = state;
        }

        function activePanel(index) {
            if (index !== undefined) {
                var container = document.querySelector('#scrollCapture');
                var scrollTop = container.scrollTop;

                return true;
            }
        }

        // Cookie
        function checkCookie() {
            var CookieAccepted = false;
            if (main.options.useWebStorage && typeof (Storage) !== 'undefined') {
                CookieAccepted = sessionStorage.getItem(main.options.cookieStorageName);
                if (CookieAccepted !== undefined && CookieAccepted !== null) {
                    CookieAccepted = (CookieAccepted === 'true');
                    main.states.showCookiePopup = !CookieAccepted;
                }
                else {
                    setStorage(false);
                }
            }
            else {
                CookieAccepted = getCookie(main.options.cookieStorageName);
                if (CookieAccepted !== undefined && CookieAccepted !== null) {
                    CookieAccepted = (CookieAccepted === 'true');
                    main.states.showCookiePopup = !CookieAccepted;
                }
                else {
                    setStorage(false);
                }
            }
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
        function setCookie(cname, cvalue, exdays) {
            var d = new Date();
            d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
            var expires = 'expires=' + d.toUTCString();
            document.cookie = cname + '=' + cvalue + '; ' + expires + '; path=/';
        }
        function getCookie(cname) {
            var name = cname + '=';
            var ca = document.cookie.split(';');
            for (var i = 0; i < ca.length; i++) {
                var c = ca[i];
                while (c.charAt(0) === ' ') {
                    c = c.substring(1);
                }
                if (c.indexOf(name) !== -1) {
                    return c.substring(name.length, c.length);
                }
            }
            return '';
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

        $scope.$on('MainCtrl:toggleOverlay', function (event, data) {
            toggleOverlay(data.id, data.state, false);
        });

        //Get Active Panel Index from window.snap
        $interval(function () {
            main.activePanelIndex = window.snap.activeIndex;
        }, 100);

        //angular.element(window).bind("scroll", function(){});

        checkCookie();
    }
})();
