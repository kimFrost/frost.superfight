(function (window, document, undefined) {
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
   * @name MainController
   * @description
   * #
   *
   * Main module of the application.
   */

  angular
    .module('noerd.BrugSkallen')
    .controller('CatchgameCtrl', CatchgameCtrl);

  /* @ngInject */
  function CatchgameCtrl($rootScope, $scope, $timeout) {

    var base = this;
    base.options = {
      debug: false,
      useRoundNum: false,
      gravity: 0.03,
      showCollisonModel: false,
      spawnTicksRequired: 50,
      playerWidth: 275,
      playerHeight: 141,
      eggWidth: 55,
      eggHeight: 76,
      playerColumns: 4,
      playerRows: 2
    };
    var data = {
      scaleMultiplier: 1,
      gameTicks: 0,
      spawnTicks: 0,
      canvas: null,
      canvasCtx: null,
      canvasWidth: 0,
      canvasHeight: 0,
      lastCanvasWidth: 0,
      lastCanvasHeight: 0,
      entities: [],
      players: [],
      playerImage: document.createElement('img'),
      playerMidImage: document.createElement('img'),
      playerFrontImage: document.createElement('img'),
      playerShadowImage: document.createElement('img'),
      eggImages: [],
      fpsCount: 0,
      fps: 0,
      lives: [{lost: false}, {lost: false}, {lost: false}],
      eggsCatched: 0,
      logCount: 0,
      states: {
        initiated: false,
        presentNewgame: false,
        playing: false,
        control: false,
        defeat: false,
        won: false,
        showWonMsg: false
      }
    };

    // Public variables
    base.data = data; // Expose data object

    // Public functions
    base.newGame = newGame;
    base.updateSize = updateSize;
    base.log = log;

/**---------------------------------------
    Constructors
---------------------------------------**/
    var Entity = function() {
      this.x = 0;
      this.y = 0;
      this.dx = 0;
      this.dy = 0;
      this.width = 0;
      this.height = 0;
      this.slots = [];
      this.attachments = [];
      this.collision = {
        type: 'box',
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        radius: 0
      };
      this.image = data.eggImages[Math.floor(Math.random() * data.eggImages.length)];
      return this;
    };
/**---------------------------------------
    Log
---------------------------------------**/
    function log(msg, msg2) {
      if (!base.options.debug) {
        return;
      }
      try {
        if (data.logCount > 500) {
          console.clear();
          data.logCount = 0;
        }
        if (msg2 !== undefined) {
          console.log(msg, msg2);
        }
        else {
          console.log(msg);
        }
        data.logCount++;
      }
      catch (err) {
        //send error to developer platform
      }
    }
/**---------------------------------------
    Game states functions
---------------------------------------**/
    function loseLife() {
      // Will return true if all lives is lost
      for (var i=0; i < data.lives.length; i++) {
        var life = data.lives[i];
        if (!life.lost) {
          life.lost = true;
          return (i === (data.lives.length - 1));
        }
      }
    }
/**---------------------------------------
    Utilities
---------------------------------------**/
    // Linear interpolation
    function lerp(a, b, f) {
      return a + f * (b - a);
    }
/**---------------------------------------
    Draw/Update
---------------------------------------**/
    function updateLoop() {
      window.requestAnimFrame(updateLoop);
      checkSpawn();
      update();
      data.fpsCount++;
      data.gameTicks++;
    }

    function checkSpawn() {
      if (data.spawnTicks > base.options.spawnTicksRequired) {
        var entity = new Entity();
        entity.x = Math.floor(Math.random() * (data.canvasWidth - 50));
        entity.y = -(base.options.eggHeight * data.scaleMultiplier);
        entity.width = base.options.eggWidth * data.scaleMultiplier;
        entity.height = base.options.eggHeight * data.scaleMultiplier;
        entity.collision.width = entity.width;
        entity.collision.height = entity.height;
        data.entities.push(entity);
        // Reset spawn ticks
        data.spawnTicks = 0;
      }
    }

    function timedUpdate() {
      var i,
        player;
      for (i=0;i<data.entities.length;i++) {
        var entity = data.entities[i];
        entity.dy += base.options.gravity;
        entity.x += entity.dx;
        entity.y += entity.dy;
        if (base.options.useRoundNum) {
          entity.x = Math.round(entity.x);
          entity.y = Math.round(entity.y);
        }
        // Check entities for out of screen
        if ((entity.y - entity.height) > data.canvasHeight) {
          data.entities.splice(i, 1);
          var gameover = loseLife();
          if (gameover) {
            data.states.presentNewgame = false;
            data.states.won = false;
            data.states.defeat = true;
            data.states.control = false;
            data.states.playing = false;
            base.data.entities = [];
            $rootScope.$emit('AUDIO_PLAY', '4.Konkurrence_Proev_igen');
          }
        }
        // Collision detect with player
        else {
          for (var ii=0;ii<data.players.length;ii++) {
            player = data.players[ii];
            if (collisionDetect(player, entity)) {
              var won = putEgg(player, entity);
              data.entities.splice(i, 1);
              if (won) {
                data.states.presentNewgame = true;
                data.states.won = true;
                data.states.showWonMsg = true;
                data.states.defeat = false;
                data.states.control = false;
                data.states.playing = false;
                base.data.entities = [];

                $timeout(showWinOverlay, 1500);
              }
            }
          }
        }
      }
      // Increate spawn tick
      if (data.states.playing) {
        data.spawnTicks++;
      }
    }

    function showWinOverlay() {
      data.states.showWonMsg = false;
      $rootScope.$broadcast('MainCtrl:toggleOverlay', {
        id: 'win',
        state: true
      });
    }

    function update() {
      var i,
        player;
      // Update player bounds
      for (i=0;i<data.players.length;i++) {
        player = data.players[i];
        if (player.x < 0) {
          player.x = 0;
        }
        else if (player.x + player.width > data.canvasWidth) {
          player.x = data.canvasWidth - player.width;
        }
      }
      draw();
    }

    function putEgg(player, entity) {
      // Return true if all slots are filled
      for (var i=0; i<player.slots.length; i++) {
        var slot = player.slots[i];
        if (slot.entities.length === 0) {
          slot.entities.push(entity);
          data.eggsCatched++;
          return (i === (player.slots.length - 1));
        }
      }
    }

    function draw() {
      data.canvasCtx = data.canvas.getContext('2d');
      var ctx = data.canvasCtx;
      ctx.clearRect(0, 0, data.canvasWidth, data.canvasHeight);
      ctx.save();
      var i;
      var ii;
      var iii;
      var entity;
      var slot;

      // Players
      if (data.states.playing) {
        for (i = 0; i < data.players.length; i++) {
          var player = data.players[i];
          // Draw player shadow (HACK 2000)
          ctx.drawImage(data.playerShadowImage, player.x - (200 * data.scaleMultiplier / 2), player.y + (120 * data.scaleMultiplier), player.width + (200 * data.scaleMultiplier), player.height * 0.75);

          // Draw player back image
          ctx.drawImage(data.playerImage, player.x, player.y, player.width, player.height);
          if (base.options.showCollisonModel) {
            ctx.fillStyle = 'rgba(150,0,0,0.3)';
            ctx.fillRect(player.x + player.collision.x, player.y + player.collision.y, player.collision.width, player.collision.height);
          }
          // Entities stored in player slots
          // Draw back eggs
          for (ii = 0; ii < player.slots.length; ii++) {
            slot = player.slots[ii];
            if (slot.iy === 0) {
              //ctx.fillStyle = 'rgba(90,20,120,0.7)';
              //ctx.fillRect(player.x + slot.x, player.y + slot.y, 5, 5);
              for (iii = 0; iii < slot.entities.length; iii++) {
                entity = slot.entities[iii];
                ctx.drawImage(entity.image, player.x + slot.x - (entity.width / 2), player.y + slot.y - (entity.height / 2), entity.width, entity.height);
              }
            }
          }
          // Draw player mid image
          ctx.drawImage(data.playerMidImage, player.x, player.y, player.width, player.height);
          // Draw front eggs
          for (ii = 0; ii < player.slots.length; ii++) {
            slot = player.slots[ii];
            if (slot.iy === 1) {
              //ctx.fillStyle = 'rgba(90,20,120,0.7)';
              //ctx.fillRect(player.x + slot.x, player.y + slot.y, 5, 5);
              for (iii = 0; iii < slot.entities.length; iii++) {
                entity = slot.entities[iii];
                ctx.drawImage(entity.image, player.x + slot.x - (entity.width / 2), player.y + slot.y - (entity.height / 2), entity.width, entity.height);
              }
            }
          }
          // Draw player front image
          ctx.drawImage(data.playerFrontImage, player.x, player.y, player.width, player.height);
        }
        // Entities
        for (i = 0; i < data.entities.length; i++) {
          entity = data.entities[i];
          ctx.drawImage(entity.image, entity.x, entity.y, entity.width, entity.height);
          if (base.options.showCollisonModel) {
            ctx.fillStyle = 'rgba(150,0,0,0.3)';
            ctx.fillRect(entity.x + entity.collision.x, entity.y + entity.collision.y, entity.collision.width, entity.collision.height);
          }
        }
      }

      // Debug
      if (base.options.debug) {
        ctx.fillStyle = 'rgb(0,0,0)';
        ctx.font='20px Georgia';
        ctx.fillText('FPS: ' + data.fps,10,30);
        ctx.fillText('TICKS: ' + data.gameTicks,10,50);
        ctx.fillText('EGGS: ' + data.entities.length, 10,70);
      }
    }
    /**---------------------------------------
     Collision Detection
     ---------------------------------------**/
    var collisionDetect = function(c1, c2, type) {
      type = (type === undefined) ? 'box' : type;
      var x1 = c1.x + c1.collision.x;
      var y1 = c1.y + c1.collision.y;
      var x2 = c2.x + c2.collision.x;
      var y2 = c2.y + c2.collision.y;
      if (type === 'box') {
        return (x1 < x2 + c2.collision.width &&
        x1 + c1.collision.width > x2 &&
        y1 < y2 + c2.collision.height &&
        c1.collision.height + y1 > y2);
      }
      else if (type === 'circle') {
        var dx = x1 - x2;
        var dy = y1 - y2;
        var dist = c1.collision.radius + c2.collision.radius;
        return (dx * dx + dy * dy <= dist * dist);
      }
    };
/**---------------------------------------
    Resize
---------------------------------------**/
    function updateSize() {
      // Update canvas size
      var parent = data.canvas.parentElement;
      resize(parent.clientWidth, parent.clientHeight);
    }
    var resize = function(width, height) {
      data.canvas.width = width;
      data.canvas.height= height;
      recal();
    };
    var recal = function() {
      data.canvasWidth = data.canvas.width;
      data.canvasHeight = data.canvas.height;
      var widthRatio = data.canvasWidth / data.lastCanvasWidth;

      // Set Size Profile
      if (data.canvasWidth > 1050) {
        data.scaleMultiplier = 1;
      }
      else if (data.canvasWidth > 600) {
        data.scaleMultiplier = 0.7;
      }
      else {
        data.scaleMultiplier = 0.4;
      }

      // Set player size and position
      var player = data.players[0];
      player.x = player.x * widthRatio;
      player.y = data.canvasHeight - (370 * data.scaleMultiplier);
      player.width = base.options.playerWidth * data.scaleMultiplier;
      player.height = base.options.playerHeight * data.scaleMultiplier;
      player.collision.y = 80 * data.scaleMultiplier;
      player.collision.width = player.width;
      player.collision.height = 20 * data.scaleMultiplier;

      var i;
      var ii;
      var entity;
      var slotGridWidth;
      for (i = 0; i < player.slots.length; i++) {
        var slot = player.slots[i];
        if (slot.iy === 0) {
          slotGridWidth = player.width * 0.9;
        }
        else {
          slotGridWidth = player.width * 0.97;
        }
        slot.x = slot.ix * (slotGridWidth / base.options.playerColumns) + (slotGridWidth / base.options.playerColumns / 2) + ((player.width - slotGridWidth) / 2);
        slot.y = slot.iy * player.height * 0.20 + (player.height * 0.4);
        for (ii = 0; ii < slot.entities.length; ii++) {
          entity = slot.entities[ii];
          entity.width = base.options.eggWidth * data.scaleMultiplier;
          entity.height = base.options.eggHeight * data.scaleMultiplier;
        }
      }

      for (i=0;i<data.entities.length;i++) {
        entity = data.entities[i];
        entity.x = entity.x * widthRatio;
        entity.width = base.options.eggWidth * data.scaleMultiplier;
        entity.height = base.options.eggHeight * data.scaleMultiplier;
        entity.collision.width = entity.width;
        entity.collision.height = entity.height;
      }

      // Store canvas sizes for ratio calculations
      data.lastCanvasWidth = data.canvasWidth;
      data.lastCanvasHeight = data.canvasHeight;
    };
    /**---------------------------------------
     BINDINGS
     ---------------------------------------**/
    var setupBindings = function() {
      data.canvas.addEventListener('mousedown', function(event) {
        //base.log('mousedown');
      });
      data.canvas.addEventListener('mouseup', function(event) {
        //base.log('mouseup');
      });
      data.canvas.addEventListener('touchstart', function(event) {
        //base.log('touchstart');
      });
      data.canvas.addEventListener('touchend', function(event) {
        //base.log('touchend');
      });
      data.canvas.addEventListener('mousemove', function(event) {
        //base.log('mousemove', event);
        if (data.states.playing && data.states.control) {
          data.players[0].x = event.x - (data.players[0].width / 2);
        }
      });
      data.canvas.addEventListener('touchmove', function(event) {
        //base.log('touchmove', event);
        if (data.states.playing && data.states.control) {
          event.preventDefault();
          data.players[0].x = event.touches[0].clientX - (data.players[0].width / 2);
        }
      });
      // Resize
      window.addEventListener('resize', function(event){
        // Update canvas size
        updateSize();
      });
    };
/**---------------------------------------
    Start
---------------------------------------**/
    var startLoop = function() {
      updateLoop();
      setInterval(timedUpdate, 1000 / 60);
      data.states.presentNewgame = true;
    };
    function newGame() {
      var i;
      var ii;

      // Reset lives
      i = 0;
      while (data.lives[i]) {
        data.lives[i].lost = false;
        i++;
      }

      // Reset catched eggs
      for (i = 0; i < base.data.players.length; i++) {
        var player = base.data.players[i];
        for (ii = 0; ii < player.slots.length; ii++) {
          var slot = player.slots[ii];
          slot.entities = [];
        }
      }
      data.eggsCatched = 0;

      // Set states
      data.states.presentNewgame = false;
      data.states.won = false;
      data.states.defeat = false;
      data.states.control = true;
      data.states.playing = true;
    }
/**---------------------------------------
    Initialize
---------------------------------------**/
    var initiate = function () {
      var canvas = document.createElement('canvas');
      var canvasAttrWidth = document.createAttribute('width');
      canvasAttrWidth.value = '1200';
      canvas.setAttributeNode(canvasAttrWidth);
      var canvasAttrHeight = document.createAttribute('height');
      canvasAttrHeight.value = '800';
      canvas.setAttributeNode(canvasAttrHeight);
      document.querySelector('.game__game').appendChild(canvas);
      //document.body.appendChild(canvas);
      data.canvas = canvas;
      data.canvasCtx = canvas.getContext('2d');
      data.playerImage.src = '/images/graphic/easter/bakke.png';
      data.playerFrontImage.src = '/images/graphic/easter/bakke_front.png';
      data.playerMidImage.src = '/images/graphic/easter/bakke_mid.png';
      data.playerShadowImage.src = '/images/graphic/easter/bakke_shadow.png';

      // Create Paddle
      var player = new Entity();
      player.x = Math.floor(0.5 * data.canvasWidth - (base.options.playerWidth / 2));
      player.y = data.canvasHeight - 370;
      player.width = base.options.playerWidth;
      player.height = base.options.playerHeight;
      player.collision.type = 'box';
      player.collision.x = 0;
      player.collision.y = 80;
      player.collision.width = player.width;
      player.collision.height = 20;
      player.attachments.push({});

      // Create player slot for eggs
      var slotGridWidth;
      for (var i=0; i < base.options.playerColumns * base.options.playerRows; i++) {
        var ix = i % base.options.playerColumns;
        var iy = Math.floor(i / base.options.playerColumns);
        if (iy === 0) {
          slotGridWidth = player.width * 0.9;
        }
        else {
          slotGridWidth = player.width * 0.97;
        }
        player.slots.push({
          ix: ix,
          iy: iy,
          x: ix * (slotGridWidth / base.options.playerColumns) + (slotGridWidth / base.options.playerColumns / 2) + ((player.width - slotGridWidth) / 2),
          y: iy * player.height * 0.20 + (player.height * 0.4),
          entities: []
        });
      }
      data.players.push(player);

      // Create egg images
      data.eggImages.push(document.createElement('img'));
      data.eggImages.push(document.createElement('img'));
      data.eggImages.push(document.createElement('img'));
      data.eggImages.push(document.createElement('img'));
      data.eggImages.push(document.createElement('img'));
      data.eggImages.push(document.createElement('img'));

      data.eggImages[0].src = '/images/graphic/easter/egg-1.png';
      data.eggImages[1].src = '/images/graphic/easter/egg-2.png';
      data.eggImages[2].src = '/images/graphic/easter/egg-3.png';
      data.eggImages[3].src = '/images/graphic/easter/egg-4.png';
      data.eggImages[4].src = '/images/graphic/easter/egg-5.png';
      data.eggImages[5].src = '/images/graphic/easter/egg-6.png';

      // Update canvas size
      var parent = data.canvas.parentElement;
      resize(parent.clientWidth, parent.clientHeight);

      data.states.initiated = true;
      setupBindings();
      startLoop();
      setInterval(function() {
        data.fps = data.fpsCount;
        data.fpsCount = 0;
      },1000);
    };
    initiate();
    window.catchgame = base;
  }
})(window, window.document);
