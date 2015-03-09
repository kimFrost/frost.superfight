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

(function (window, document, undefined) {

  var base = {
    options: {
      debug: true,
      useRoundNum: true,
      gravity: 0.05
    },
    canvas: null,
    canvasCtx: null,
    canvasWidth: 0,
    canvasHeight: 0,
    entities: [],
    players: [],
    playerImage: document.createElement('img'),
    eggImage: document.createElement('img'),
    fpsCount: 0,
    fps: 0,
    logCount: 0,
    states: {}
  };
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
    return this;
  };
/**---------------------------------------
  Log
---------------------------------------**/
  base.log = function (msg, msg2) {
    if (!base.options.debug) {
      return;
    }
    try {
      if (base.logCount > 500) {
        console.clear();
        base.logCount = 0;
      }
      if (msg2 !== undefined) {
        console.log(msg, msg2);
      }
      else {
        console.log(msg);
      }
      base.logCount++;
    }
    catch (err) {
      //send error to developer platform
    }
  };
/**---------------------------------------
  Draw/Update
---------------------------------------**/
  function updateLoop() {
    window.requestAnimFrame(updateLoop);
    update();
    base.fpsCount++;
  }

  function update() {
    //base.log(base.entities.length);
    for (var i=0;i<base.entities.length;i++) {
      var entity = base.entities[i];
      entity.dy += base.options.gravity;
      entity.x += entity.dx;
      entity.y += entity.dy;
      if (base.options.useRoundNum) {
        entity.x = Math.round(entity.x);
        entity.y = Math.round(entity.y);
      }
      if ((entity.y - entity.height) > base.canvasHeight) {
        base.entities.splice(i, 1);
      }
    }
    draw();
  }

  function draw() {
    base.canvasCtx = base.canvas.getContext('2d');
    var ctx = base.canvasCtx;
    ctx.clearRect(0, 0, base.canvasWidth, base.canvasHeight);
    ctx.save();
    var i;
    var entity;
    // Entities
    for (i=0;i<base.entities.length;i++) {
      entity = base.entities[i];
      ctx.drawImage(base.eggImage, entity.x, entity.y, entity.width, entity.height);
      /*
      ctx.beginPath();
      ctx.fillStyle = 'rgba(155, 155, 155, 1)';
      ctx.arc(entity.x, entity.y, 10, 0, 2*Math.PI, false);
      ctx.closePath();
      ctx.fill();
      */
    }
    for (i=0;i<base.players.length;i++) {
      var player = base.players[i];
      ctx.drawImage(base.playerImage, player.x, player.y, player.width, player.height);
      //base.log(player);
      for (var ii=0;ii<base.entities.length;ii++) {
        entity = base.entities[ii];
        if (collisionDetect(player, entity)) {
          base.entities.splice(ii, 1);
        }
      }
    }
    // Fps
    ctx.font='20px Georgia';
    ctx.fillText(base.fps,10,30);
  }
/**---------------------------------------
  Collision Detection
---------------------------------------**/
  var collisionDetect = function(c1, c2, type) {
    type = (type === undefined) ? 'box' : type;
    if (type === 'box') {
      return (c1.x < c2.x + c2.width &&
      c1.x + c1.width > c2.x &&
      c1.y < c2.y + c2.height &&
      c1.height + c1.y > c2.y);
    }
    else if (type === 'circle') {
      var dx = c1.x - c2.x;
      var dy = c1.y - c2.y;
      var dist = c1.radius + c2.radius;
      return (dx * dx + dy * dy <= dist * dist);
    }
  };
/**---------------------------------------
  Resize
---------------------------------------**/
  var recal = function() {
    base.canvasWidth = base.canvas.width;
    base.canvasHeight = base.canvas.height;
  };
/**---------------------------------------
  Bindings
---------------------------------------**/
  var setupBindings = function() {
    base.canvas.addEventListener('mousedown', function(event) {
      //base.log('mousedown');
    });
    base.canvas.addEventListener('mouseup', function(event) {
      //base.log('mouseup');
    });
    base.canvas.addEventListener('touchstart', function(event) {
      //base.log('touchstart');
    });
    base.canvas.addEventListener('touchend', function(event) {
      //base.log('touchend');
    });
    base.canvas.addEventListener('mousemove', function(event) {
      base.log('mousemove', event);
      base.players[0].x = event.x - (base.players[0].width / 2);
    });
    base.canvas.addEventListener('touchmove', function(event) {
      base.log('touchmove', event);
      base.players[0].x = event.touches[0].clientX - (base.players[0].width / 2);
    });
  };
/**---------------------------------------
  Start
---------------------------------------**/
  var start = function() {
    setInterval(function() {
      var entity = new Entity();
      entity.x = Math.floor(Math.random() * base.canvasWidth);
      entity.y = -80;
      entity.width = 50;
      entity.height = 80;
      base.entities.push(entity);
    }, 20);
    updateLoop();
  };
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
    //canvas.style.width = '100%';
    //canvas.style.height = '100%';
    document.body.appendChild(canvas);
    base.canvas = canvas;
    base.canvasCtx = canvas.getContext('2d');
    base.eggImage.src = 'egg.png';
    base.playerImage.src = 'paddle.png';

    // Update canvas size
    recal();

    // Create Paddle
    var player = new Entity();
    player.x = Math.floor(0.5 * base.canvasWidth - 100);
    player.y = base.canvasHeight - 100;
    player.width = 200;
    player.height = 60;
    base.players.push(player);

    setupBindings();
    start();
    setInterval(function() {
      base.fps = base.fpsCount;
      base.fpsCount = 0;
    },1000);
  };
  initiate();
  window.base = base;

})(window, window.document);
