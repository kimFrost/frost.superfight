
(function (undefined) {
    'use strict';

    angular
		.module('noerd.BrugSkallen')
		.directive('competitionOverlay', competitionOverlay);

    /* @ngInject */
    function competitionOverlay(competitionService, trackingService) {

        var directive = {
            replace: false,
            link: link,
            restrict: 'A',
            scope: true,
            controller: controller
        };
        
        /* @ngInject */
        function controller($scope) {

            $scope.submitForm = submitForm;
            $scope.resetForm = resetForm;

            $scope.showResponse = false;
            $scope.status = { StatusCode: -1 };

            function submitForm() {
                
                if ($scope.competitionForm.$valid) {

                    var promise = competitionService.joinCompetition($scope.entry);

                    promise.then(function (response) {
                        console.log('Yay');
                        console.log(response);
                        $scope.status = response.data;
                    }, function (reason) {
                        console.error('Failed: ', reason);
                        $scope.status = { StatusCode: 3 };
                    });

                    trackingService.trackEvent('Competition', 'Submit info');

                    $scope.showResponse = true;
                }                
            }

            function resetForm() {
                $scope.showResponse = false;
                $scope.status = { StatusCode: -1 };
            }

        }
        
        function link(scope, element, attrs) {
        }

        return directive;
    }
})();


