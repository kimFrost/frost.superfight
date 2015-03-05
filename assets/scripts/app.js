(function (undefined) {
    'use strict';

/**
 * @ngdoc overview
 * @name angularApp
 * @description
 * # angularApp
 *
 * Main module of the application.
 */
angular
  .module('noerd.BrugSkallen', ['ngAnimate', 'tracking'])
    .config(['$locationProvider', function($locationProvider) {
        $locationProvider.html5Mode({
            enabled: true,
            requireBase: false
        });
        //$locationProvider.hashPrefix('!');
    }])
  .run(function () {
    //console.log('Main Application Run()');
  });
})();