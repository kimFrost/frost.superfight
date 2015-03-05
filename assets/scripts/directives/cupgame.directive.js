(function (undefined) {
    'use strict';

    angular
		.module('noerd.BrugSkallen')
		.directive('cupgame', cupgame);

    /* @ngInject */
    function cupgame($timeout, trackingService) {
        var directive = {
            replace: true,
            link: link,
            restrict: 'A',
            templateUrl: '/templates/cupgame.html',
            scope: {
                cupcount: '@cupcount'
            },
            controller: directiveController
        };

        /* @ngInject */
        function directiveController($scope, $rootScope, $timeout) {

            $scope.cupgame = {
                options: {
                    debug: false,
                    rewardIndex: 1, //0-2
                    shuffleTime: 300,
                    minRotations: 10,
                    maxRotations: 16
                },
                openCupIndex: -1,
                indexes: [],
                states: {
                    initiated: false,
                    shuffling: false,
                    shufflingLoop: false,
                    cupsLocked: false,
                    cupsUserLocked: true,
                    presentChoice: false,
                    presentNewgame: false,
                    defeat: false,
                    won: false
                },
                temp: {
                    requiredRotations: undefined,
                    rotationsCount: undefined
                },
                css: {}
            };

            // FUNCTIONS
            $scope.cupgame.shuffle = function () {
                if (!$scope.cupgame.states.shuffling) {

                    // Check if a multiple rotation loop is in progress
                    if (!$scope.cupgame.states.shufflingLoop) {
                        $scope.cupgame.temp.requiredRotations = Math.floor(Math.random() * ($scope.cupgame.options.maxRotations - $scope.cupgame.options.minRotations + 1) + $scope.cupgame.options.minRotations);
                        $scope.cupgame.temp.rotationsCount = 0;
                        $scope.cupgame.states.shufflingLoop = true;
                    }

                    // Check if all the required rotation count has been fulfilled
                    if ($scope.cupgame.temp.rotationsCount >= $scope.cupgame.temp.requiredRotations) {
                        $scope.cupgame.states.shufflingLoop = false;
                        $scope.cupgame.states.presentChoice = true;
                        $scope.cupgame.states.cupsUserLocked = false;
                    }
                    else {
                        $scope.cupgame.states.shuffling = true;
                        // Pick two random and swithc position, and recal offset
                        var randomIndex1 = Math.floor(Math.random() * $scope.cupgame.indexes.length);
                        var randomIndex2 = Math.floor(Math.random() * $scope.cupgame.indexes.length);
                        while (randomIndex1 === randomIndex2) {
                            randomIndex2 = Math.floor(Math.random() * $scope.cupgame.indexes.length);
                        }

                        // Set halfway destination points
                        var tempPos1 = $scope.cupgame.indexes[randomIndex1].posX;
                        var tempPos2 = $scope.cupgame.indexes[randomIndex2].posX;
                        $scope.cupgame.indexes[randomIndex1].posX = (tempPos1 + tempPos2) / 2;
                        $scope.cupgame.indexes[randomIndex2].posX = (tempPos1 + tempPos2) / 2;

                        $scope.cupgame.indexes[randomIndex1].posY = 1;
                        $scope.cupgame.indexes[randomIndex2].posY = -1;

                        $scope.cupgame.updateOffsets();

                        // Set complete $scope points
                        $scope.cupgame.indexes[randomIndex1].posX = tempPos2;
                        $scope.cupgame.indexes[randomIndex2].posX = tempPos1;
                        $scope.cupgame.indexes[randomIndex1].posY = 0;
                        $scope.cupgame.indexes[randomIndex2].posY = 0;

                        // Change translate position again, to move down again
                        $timeout(function () {
                            $scope.cupgame.updateOffsets(false);
                        }, $scope.cupgame.options.shuffleTime * 1.3);

                        $timeout(function () {
                            $scope.cupgame.states.shuffling = false;
                            $scope.cupgame.temp.rotationsCount++;
                            $scope.cupgame.shuffle();
                        }, $scope.cupgame.options.shuffleTime * 2.6);
                    }

                }
            };

            $scope.cupgame.hasReward = function (index) {
                if ($scope.cupgame.states.showReward && index === $scope.cupgame.options.rewardIndex) {
                    return true;
                }
                else {
                    return false;
                }
            };

            $scope.cupgame.validateChoice = function () {
                //$scope.cupgame.openCupIndex
                $scope.cupgame.states.cupsUserLocked = true;
                $scope.cupgame.states.showReward = true;
                if ($scope.cupgame.openCupIndex === $scope.cupgame.options.rewardIndex) {
                    log('Won');
                    trackingService.trackEvent('Cup game', 'Game won');
                    //$rootScope.$emit('AUDIO_PLAY', '3.Konkurrence_Godt_gaaet');

                    $scope.cupgame.states.won = true;
                    $scope.cupgame.states.defeat = false;
                    $scope.cupgame.states.presentChoice = false;
                    $timeout(function () {
                        $rootScope.$broadcast('MainCtrl:toggleOverlay', {
                            id: 'win',
                            state: true
                        });
                        $scope.cupgame.states.won = false;
                        $scope.cupgame.states.presentNewgame = true;
                        $scope.cupgame.closeCups();
                    }, 400);
                }
                else {
                    log('Defeat');
                    trackingService.trackEvent('Cup game', 'Game lost');

                    $rootScope.$emit('AUDIO_PLAY', '4.Konkurrence_Proev_igen');

                    $scope.cupgame.states.won = false;
                    $scope.cupgame.states.presentChoice = false;
                    $scope.cupgame.states.defeat = true;
                }
            };

            $scope.cupgame.liftCup = function (index, isUser) {
                isUser = (isUser === undefined) ? true : isUser;
                log('liftCup', index);
                log('isUser', isUser);
                if (isUser) {
                    if (!$scope.cupgame.states.cupsUserLocked && $scope.cupgame.states.presentChoice) {
                        $scope.cupgame.openCupIndex = index;
                        $scope.cupgame.validateChoice();
                    }
                }
                else {
                    if (!$scope.cupgame.states.cupsLocked) {
                        $scope.cupgame.openCupIndex = index;
                    }
                }
            };

            $scope.cupgame.closeCups = function () {
                $scope.cupgame.openCupIndex = -1;
            };

            $scope.cupgame.checkCupOpen = function (index) {
                return index === $scope.cupgame.openCupIndex;
            };

            // updateOffset
            $scope.cupgame.updateOffsets = function (updateZIndex) {
                updateZIndex = (updateZIndex === undefined) ? true : updateZIndex;
                for (var i = 0; i < $scope.cupgame.indexes.length; i++) {
                    var index = $scope.cupgame.indexes[i];

                    var leftOffset = 0;
                    var topOffset = 0;
                    var zIndex = 0;

                    leftOffset = index.posX * 100;
                    topOffset = index.posY * 30;
                    zIndex = index.posY;

                    if (!updateZIndex) {
                        zIndex = index.css['z-index'];
                    }

                    index.css = {
                        '-moz-transform': 'translate(' + leftOffset + '%, ' + topOffset + '%)',
                        '-ms-transform': 'translate(' + leftOffset + '%, ' + topOffset + '%)',
                        '-webkit-transform': 'translate(' + leftOffset + '%, ' + topOffset + '%)',
                        'transform': 'translate(' + leftOffset + '%, ' + topOffset + '%)',
                        'z-index': zIndex
                    };
                }
            };

            $scope.cupgame.startNewGame = function () {
                log('startNewGame');
                trackingService.trackEvent('Cup game', 'Game started');

                if ($scope.cupgame.states.shufflingLoop) {
                    return false;
                }
                $scope.cupgame.states.defeat = false;
                $scope.cupgame.states.won = false;
                $scope.cupgame.states.cupsUserLocked = true;
                $scope.cupgame.states.presentNewgame = false;
                $scope.cupgame.states.presentChoice = false;
                $scope.cupgame.states.showReward = true;
                $scope.cupgame.liftCup($scope.cupgame.options.rewardIndex, false);
                $timeout(function () {
                    $scope.cupgame.closeCups();
                }, 2000);
                $timeout(function () {
                    $scope.cupgame.shuffle();
                    $scope.cupgame.states.showReward = false;
                }, 2500);
            };

            // init
            $scope.cupgame.init = function () {
                if (!$scope.cupgame.states.initiated) {

                    // Generate Indexes
                    for (var i = 0; i < $scope.cupcount; i++) {
                        var reward = false;
                        if (i === $scope.cupgame.options.rewardIndex) {
                            reward = true;
                        }
                        $scope.cupgame.indexes.push({
                            index: i,
                            posX: i,
                            posY: 0,
                            reward: reward,
                            css: {}
                        });
                    }

                    $scope.cupgame.updateOffsets();
                    $scope.cupgame.states.initiated = true;
                    $scope.cupgame.states.presentNewgame = true;
                }
            };


            // Debug log
            function log(msg1, msg2) {
                msg1 = (msg1 === undefined) ? null : msg1;
                msg2 = (msg2 === undefined) ? null : msg2;
                if ($scope.cupgame.options.debug) {
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

            $scope.getCupList = function () {
                return $scope.cupgame.indexes;
            };

        }

        return directive;

        function link(scope, element, attrs) {
            // BINDINGS

            // INIT
            scope.cupgame.init();
        }
    }
})();


