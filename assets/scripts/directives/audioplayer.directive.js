
(function (undefined) {
    'use strict';

    angular
		.module('noerd.BrugSkallen')
		.directive('audioPlayer', audioPlayer);

    /* @ngInject */
    function audioPlayer(trackingService) {

        var directive = {
            replace: false,
            link: link,
            restrict: 'A',
            scope: true,
            controller: controller
        };

        /* @ngInject */
        function controller($scope, $rootScope) {

            $rootScope.$on('AUDIO_BUTTON_CLICKED', function (e, audioFile) {
                $scope.startOrStopAudio(audioFile);
            });

            $rootScope.$on('AUDIO_PLAY', function (e, audioFile) {
                $scope.startOrStopAudio(audioFile);
            });

            $rootScope.$on('AUDIO_STOP', function () {
                $scope.stopAudio();
            });

        }

        function link(scope, element, attrs) {

            scope.currentAudioFile = '';
            scope.startOrStopAudio = startOrStopAudio;
            scope.startAudio = startAudio;
            scope.stopAudio = stopAudio;

            scope.isPlaying = isPlaying;

            function startOrStopAudio(audioFile) {
                var wasPlaying = scope.isPlaying();

                if (wasPlaying) {
                    scope.stopAudio();
                }

                if (!wasPlaying || audioFile !== scope.currentAudioFile) {
                    scope.startAudio(audioFile);
                }
            }

            function startAudio(audioFile) {
                var filePath = '';
                if (audioFile.indexOf('/media/') > -1) {
                    filePath = audioFile;
                } else {
                    filePath = '/audio/' + audioFile + '.mp3';
                }

                //console.log('Player start: ' + filePath);
                //console.log(element);
                element.attr('src', filePath);
                element[0].play();
                scope.currentAudioFile = audioFile;

                trackingService.trackEvent('Audio', 'Audio started', '', audioFile);
            }

            function stopAudio() {
                //console.log('Player stop');
                element[0].pause();
                //console.log(element[0].currentTime);
            }

            function isPlaying() {
                return !element[0].paused;
            }

        }

        return directive;
    }
})();


