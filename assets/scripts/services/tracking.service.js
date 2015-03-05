(function () {
    'use strict';

    angular
        .module('tracking', [])
        .service('trackingService', trackingService);

    /* @ngInject */
    function trackingService($q) {

        // -------------------------------------------------------------------------
        // Private
        // -------------------------------------------------------------------------     
        var deferred = $q.defer();
        var promise = deferred.promise;

        // -------------------------------------------------------------------------
        // Initialize
        // -------------------------------------------------------------------------
        var timer = setInterval(function () {
            if (window.ga) {
                clearInterval(timer); 
                deferred.resolve();
                //console.log('google analytics is loaded');
            } else {
                //console.log('waiting for google analytics');
            }
        }, 500);


        // -------------------------------------------------------------------------
        // Public
        // -------------------------------------------------------------------------
        /*jshint validthis:true */
        this.trackEvent = trackEvent;


        // -------------------------------------------------------------------------
        // Methods
        // -------------------------------------------------------------------------
        function trackEvent(category, action, label, value) {
            var def = $q.defer();
            //console.log('trackEvent', category, action, label, value);
            promise.then(function () {
                if (typeof window.ga !== 'undefined') {
                    window.ga('send', {
                        'hitType': 'event', // Required.
                        'eventCategory': category, // Required.
                        'eventAction': action, // Required.
                        'eventLabel': label,
                        'eventValue': value,
                        'hitCallback': function () {
                            //console.log('Google Analytics Event Tracked');
                        }
                    });
                } else {
                    //console.error('Google Analytics is not defined!');
                }
            });
            return def.promise;
        }

    }
})();
