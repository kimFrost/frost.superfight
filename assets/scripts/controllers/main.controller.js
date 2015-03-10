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
    main.hand = [];
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

      // Commen api functions
      this.api = {
        inactivateAll: function(item) {
          for (var i=0; i < this.actions.length; i++) {
            var _item = this.actions[i];
            if (_item !== item) {
              _item.states.active = false;
            }
          }
        }.bind(this)
      };

      // PLAYER
      if (type === 'player') {
        this.type = type;
        this.options = {
          draw:  {
            char: 3,
            trait: 4
          },
          pick: {
            char: 1,
            trait: 1,
            traitTrade: 0,
            traitRandom: 1
          }
        };
        this.actions = [
          {
            text: 'hand',
            action: function(item) {
              this.api.inactivateAll(item);
              item.states.active = !item.states.active;
            }.bind(this),
            states: {
              active: false
            }
          },
          {
            text: 'players',
            action: function(item) {
              this.api.inactivateAll(item);
              item.states.active = !item.states.active;
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
        this.options = {
          draw:  {
            char: 1,
            trait: 2
          },
          pick: {
            char: 1,
            trait: 2,
            traitTrade: 0,
            traitRandom: 0
          }
        };
        this.actions = [
          {
            text: 'settings',
            action: function(item) {
              this.api.inactivateAll(item);
              item.states.active = !item.states.active;
            }.bind(this),
            states: {
              active: false
            }
          },
          {
            text: 'players',
            action: function(item) {
              this.api.inactivateAll(item);
              item.states.active = !item.states.active;
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

    // Get Cards
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

    // Make Decks
    function makeDecks() {
      var decks = {
        characters: [],
        traits: [],
        scenarios: [],
        combiCharacter: [],
        combiTrait: [],
        combiScenario: []
      };

      var allCharacters = [];
      var allTraits = [];
      var allScenarios = [];
      var allCombiCharacter = [];
      var allCombiTraits = [];
      var allCombiScenario = [];

      for (var i=0; i<main.cards.length; i++) {
        var card = main.cards[i];
        if (card.type === 'character') {
          allCharacters.push(card);
        }
        else if (card.type === 'trait') {
          allTraits.push(card);
        }
        else if (card.type === 'scenarios') {
          allScenarios.push(card);
        }
        else if (card.type === 'combi-character') {
          allCombiCharacter.push(card);
        }
        else if (card.type === 'combi-trait') {
          allCombiTraits.push(card);
        }
        else if (card.type === 'combi-scenario') {
          allCombiScenario.push(card);
        }
      }

      decks.characters = allCharacters;
      decks.traits = allTraits;
      decks.scenarios = allScenarios;

      var cardsTotalSoFar =  decks.characters.length + decks.traits.length + decks.scenarios.length;
      //log('cardsTotalSoFar', cardsTotalSoFar);

      // Logic for get precentage of random combi-cards
      // (MISSING)

      return decks;
    }

    // New Game
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
