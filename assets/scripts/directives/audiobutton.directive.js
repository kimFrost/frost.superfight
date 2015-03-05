
(function (undefined) {
    'use strict';

    angular
		.module('noerd.BrugSkallen')
		.directive('audioButton', audioButton);

    /* @ngInject */
    function audioButton() {

        var directive = {
            replace: false,
            link: link,
            restrict: 'A',
            scope: true,
            controller: controller
        };

        /* @ngInject */
        function controller($scope, $rootScope) {

            $scope.clicked = clicked;
            $scope.audioFile = '';
            
            function clicked() {
                $rootScope.$emit('AUDIO_BUTTON_CLICKED', $scope.audioFile);
            }
            
        }

        function link(scope, element, attrs) {
            element.bind('click', scope.clicked);
            scope.audioFile = attrs.audioFile;
        }

        return directive;
    }
})();


