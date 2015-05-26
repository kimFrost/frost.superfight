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
		main.handFilter = '';
		main.slots = [];
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
		main.pickCard = pickCard;
		main.selectCard = selectCard;
		main.getNumber = getNumber;
		main.getCardClass = getCardClass;

		/**---------------------------------------
		 CONSTRUCTORS
		 ---------------------------------------**/
		var Gamemode = function (type) {
			type = (type === undefined) ? 'player' : type;

			// Commen api functions
			this.api = {
				inactivateAll: function (item) {
					for (var i = 0; i < this.actions.length; i++) {
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
					draw: {
						char: 3,
						trait: 4
					},
					pick: {
						char: 1,
						trait: 1,
						traitTrade: 1
						//traitRandom: 0
					}
				};
				this.actions = [
					{
						text: 'hand',
						action: function (item) {
							this.api.inactivateAll(item);
							// Reset hand filter type and selected card
							pickCard();
							item.states.active = !item.states.active;
						}.bind(this),
						states: {
							active: false
						}
					},
					{
						text: 'players',
						action: function (item) {
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
					draw: {
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
						text: 'hand',
						action: function (item) {
							this.api.inactivateAll(item);
							// Reset hand filter type and selected card
							pickCard();
							item.states.active = !item.states.active;
						}.bind(this),
						states: {
							active: false
						}
					},
					{
						text: 'settings',
						action: function (item) {
							this.api.inactivateAll(item);
							item.states.active = !item.states.active;
						}.bind(this),
						states: {
							active: false
						}
					},
					{
						text: 'players',
						action: function (item) {
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

		function getNumber(n) {
			return new Array(n);
		}

		function getCardClass(value) {
			return 'card--' + value;
		}

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
					main.cards = enrichCards(data);
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

		function enrichCards(cards) {
			for (var i = 0; i < cards.length; i++) {
				var card = cards[i];
				card.states = {
					drawn: false,
					placed: false
				};
			}
			return cards;
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

			for (var i = 0; i < main.cards.length; i++) {
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

			var cardsTotalSoFar = decks.characters.length + decks.traits.length + decks.scenarios.length;
			//log('cardsTotalSoFar', cardsTotalSoFar);

			// Logic for get precentage of random combi-cards
			// (MISSING)

			return decks;
		}

		// Pick Card
		function pickCard(slot) {
			if (slot !== undefined) {
				var type = slot.type;
				var pickFromHand = true;
				// Check for special types
				log('slot', slot);
				if (type === 'traitTrade') {
					type = 'trait';
				}
				if (pickFromHand) {
					slot.states.selected = true;
					main.handFilter = type;
					main.gamemode.actions[0].states.active = true;
				}
			}
			else {
				for (var i = 0; i < main.slots.length; i++) {
					var row = main.slots[i];
					for (var ii = 0; ii < row.slots.length; ii++) {
						var slot = row.slots[ii];
						slot.states.selected = false;
					}
				}
				main.handFilter = '';
			}
		}

		// Select Card
		function selectCard(card) {
			var anyFound = false;
			var selectedSlot = {};
			// Search for a slot which is selected
			for (var i = 0; i < main.slots.length; i++) {
				var row = main.slots[i];
				for (var ii = 0; ii < row.slots.length; ii++) {
					var slot = row.slots[ii];
					if (slot.states.selected) {
						selectedSlot = slot;
						anyFound = true;
						break;
					}
				}
			}
			if (anyFound) {
				// Reset previous placed card
				if (selectedSlot.card.states !== undefined) {
					selectedSlot.card.states.placed = false;
				}
				// Store information
				selectedSlot.card = card;
				card.states.placed = true;
				selectedSlot.states.selected = false;
				main.handFilter = '';
				main.gamemode.actions[0].states.active = false;
			}
		}

		function getNewHand() {
			var cards = [];

			var i;
			var card;
			var randomInt;
			for (i = 0; i < main.gamemode.options.draw.char; i++) {
				if (main.decks.characters.length > 0) {
					randomInt = Math.floor(Math.random() * main.decks.characters.length);
					card = main.decks.characters[randomInt];
					cards.push(card);
					card.states.drawn = true;
				}
			}
			for (i = 0; i < main.gamemode.options.draw.trait; i++) {
				if (main.decks.traits.length > 0) {
					randomInt = Math.floor(Math.random() * main.decks.traits.length);
					card = main.decks.traits[randomInt];
					card.states.drawn = true;
					cards.push(card);
				}
			}

			return cards;
		}

		// New Game
		function newGame(type) {
			main.gamemode = new Gamemode(type);

			// Generate slots column for each pick type
			for (var key in main.gamemode.options.pick) {
				var value = main.gamemode.options.pick[key];
				var row = {
					slots: []
				};
				// Generate a slot X times where x is value
				for (var i = 0; i < value; i++) {
					var slot = {
						type: key,
						card: {},
						states: {
							locked: false,
							selected: false
						}
					};
					row.slots.push(slot);
				}
				main.slots.push(row);
			}

			// Get decks
			main.decks = makeDecks();

			// Get cards in hand
			main.hand = getNewHand();
			console.log('main.hand', main.hand);

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
