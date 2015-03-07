(function (undefined) {
    'use strict';

    /**
     * @ngdoc overview
     * @name dashboard - MainController
     * @description
     * # dashboard
     *
     * Main module of the application.
     */

    angular
      .module('dashboard')
      .controller('MainCtrl', MainCtrl);

    /* @ngInject */
    function MainCtrl() {
        console.log('MainCtrl');
    }
})();