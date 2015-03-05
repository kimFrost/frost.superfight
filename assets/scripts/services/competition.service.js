(function () {
    'use strict';

    angular
        .module('noerd.BrugSkallen')
        .service('competitionService', competitionService);

    /* @ngInject */
    function competitionService($http) {
        
        /*jshint validthis:true */
        this.joinCompetition = joinCompetition;
        
        function joinCompetition(data) {

            var promise = $http({
                url: '/api/competition/join',
                method: 'POST',
                data: data
            });

            return promise;
        }
        
    }
})();