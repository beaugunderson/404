'use strict';

var debug = require('debug')('not-found');
var Matter = require('matter-js');
var $ = window.$ = require('jquery');
var _ = require('lodash');

var Bodies = Matter.Bodies;
var Body = Matter.Body;
var Common = Matter.Common;
var Engine = Matter.Engine;
var Events = Matter.Events;
var Render = Matter.Render;
var Svg = Matter.Svg;
var Vertices = Matter.Vertices;
var World = Matter.World;

localStorage.debug = '*';

$(function () {
  var WIDTH = $('body').width();
  var HEIGHT = $('body').height();

  var engine = Engine.create({
    positionIterations: 10
  });

  var render = Render.create({
    element: document.body,
    engine: engine,
    options: {
      width: WIDTH,
      height: HEIGHT,

      background: 'white',
      showAngleIndicator: false,
      wireframes: false
    }
  });

  $.get('./heart.svg').done(function (heart) {
    var vertexSets = [];

    $(heart).find('path').each(function (i, path) {
      var points = Svg.pathToVertices(path, 30);

      vertexSets.push(Vertices.scale(points, 0.1, 0.1));
    });

    function addHeart() {
      debug('addHeart');

      var count = Math.floor(Math.random() * 5);

      _.times(count, function () {
        var color = Common.choose([
          '#1c1d21',
          '#31353d',
          '#445878'
        ]);

        var x = Math.random() * WIDTH;
        var y = -50;

        var body = Bodies.fromVertices(x, y, vertexSets, {
          render: {
            fillStyle: color,
            strokeStyle: color
          }
        }, true);

        Body.rotate(body, Math.random() * 360);

        World.add(engine.world, body);

        setTimeout(function () {
          stopBody(body);
        }, 3000);
      });

      setTimeout(addHeart, 100);
    }

    addHeart();
  });

  var DIMENSION = 25;

  World.add(engine.world, [
    Bodies.rectangle(-DIMENSION, 0, DIMENSION, HEIGHT * 2, {isStatic: true}),
    Bodies.rectangle(WIDTH + DIMENSION, 0, DIMENSION, HEIGHT * 2, {isStatic: true}),
    Bodies.rectangle(0, HEIGHT + DIMENSION, WIDTH * 2, DIMENSION, {isStatic: true})
  ]);

  function stopBody(body) {
    Body.setStatic(body, true);

    body.parts.forEach(function (part) {
      part.render.fillStyle = '#999999';
      part.render.strokeStyle = '#999999';
    });
  }

  function handleCollision(event) {
    var pairs = event.pairs;

    for (var i = 0; i < pairs.length; i++) {
      var pair = pairs[i];

      var parentA = pair.bodyA.parent;
      var parentB = pair.bodyB.parent;

      var movingBody;

      if (parentA.isStatic && !parentB.isStatic) {
        movingBody = parentB;
      } else if (!parentA.isStatic && parentB.isStatic) {
        movingBody = parentA;
      }

      movingBody.handled = true;

      if (movingBody && !movingBody.handled) {
        setTimeout(function () {
          pair.isActive = false;

          stopBody(movingBody);
        }, 500);
      }
    }
  }

  Events.on(engine, 'collisionStart', handleCollision);
  Events.on(engine, 'collisionActive', handleCollision);

  Engine.run(engine);
  Render.run(render);
});
