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
    .module('frost.Superfight')
    .controller('MainCtrl', MainCtrl);

  /* @ngInject */
  function MainCtrl($timeout, $http) {

    var main = this;
    main.options = {
      debug: false
    };
    main.cards = [];
    main.decks = {};
    main.gamemode = {};
    main.states = {
      pending: false,
      success: false,
      error: false,
      showFixedmenu: false,
      showMenu: true
    };

    // Public functions
    main.getCards = getCards;
    main.newGame = newGame;

    /**---------------------------------------
     CONSTRUCTORS
     ---------------------------------------**/
    var Gamemode = function (type) {
      type = (type === undefined) ? 'player' : type;

      // PLAYER
      if (type === 'player') {
        this.type = type;
        this.api = {
          inactivateAll: function() {
            for (var i=0; i < this.actions.length; i++) {
              this.actions[i].states.active = false;
            }
          }.bind(this)
        };
        this.actions = [
          {
            text: 'hand',
            action: function(item) {
              this.api.inactivateAll();
              item.states.active = true;
            }.bind(this),
            states: {
              active: false
            }
          },
          {
            text: 'players',
            action: function(item) {
              this.api.inactivateAll();
              item.states.active = true;
            }.bind(this),
            states: {
              active: false
            }
          }
        ];
      }

      // HOST
      else if (type === 'host') {
        this.type = type;
        this.api = {
          inactivateAll: function() {
            for (var i=0; i < this.actions.length; i++) {
              this.actions[i].states.active = false;
            }
          }.bind(this)
        };
        this.actions = [
          {
            text: 'settings',
            action: function(item) {
              this.api.inactivateAll();
              item.states.active = true;
            }.bind(this),
            states: {
              active: false
            }
          },
          {
            text: 'players',
            action: function(item) {
              this.api.inactivateAll();
              item.states.active = true;
            }.bind(this),
            states: {
              active: false
            }
          }
        ];
      }
      return this;
    };

    /**---------------------------------------
     FUNCTION LIBRARY
     ---------------------------------------**/

    function getCards() {
      console.log('getCards');
      main.states.pending = true;
      main.states.success = false;
      main.states.error = false;

      var req = {
        method: 'GET',
        url: '/api/getcards'
      };

      $http(req)
        .success(function (data, status, headers, config) {
          console.log('success', data);
          console.log('status', status);
          main.states.pending = false;
          main.states.success = true;
          main.states.error = false;
          main.cards = data;
        })
        .error(function (data, status, headers, config) {
          console.log('error', data);
          console.log('status', status);
          main.states.pending = false;
          main.states.success = false;
          main.states.error = true;
        });

      // try .bind(data) -> this -> data // Not in a angular object
    }

    function makeDecks() {
      var decks = {
        characters: [],
        traits: [],
        scenarios: [],
        combiCharacter: [],
        combiTrait: [],
        combiScenario: []
      };




      return decks;
    }

    function newGame(type) {
      main.gamemode = new Gamemode(type);

      // Get decks
      main.decks = makeDecks();

      // Show options/actions
      main.states.showMenu = false;
      main.states.showFixedmenu = true;
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

      // Get all cards from db
      //main.cards = getCards();
    getCards();

  }
})();
