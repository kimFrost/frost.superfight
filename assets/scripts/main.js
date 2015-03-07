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
      debug: false,
      feedUrl: 'feed.json',
      updateMarkerInterval: 1000, // 1 sec
      requestInterval: 30000, // 30 sec
      checkin: {
        hotTime: (1000 * 60 * 15), // 30 minutes,
        maxRadius: 30,
        minRadius: 0
      }
    },
    map: null,
    vectorSource: null,
    salespersons: [],
    checkedInToday: [],
    checkedInBefore: [],
    logCount: 0,
    states: {}
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
  function lerp(a, b, f) {
    return a + f * (b - a);
  }
  /**---------------------------------------
  DOM Constructors
---------------------------------------**/
  var newRow = function(title, location, time, date) {
    title = (title === undefined) ? '' : title;
    location = (location === undefined) ? '' : location;
    time = (time === undefined) ? '' : time;
    date = (date === undefined) ? '' : date;

    var row = document.createElement('tr');
    var cellTitle = document.createElement('td');
    var cellLocation = document.createElement('td');
    var cellTime = document.createElement('td');
    var cellDate = document.createElement('td');

    cellTitle.textContent = title;
    cellLocation.textContent = location;
    cellTime.textContent = time;
    cellDate.textContent = date;

    row.appendChild(cellTitle);
    row.appendChild(cellLocation);
    row.appendChild(cellTime);
    row.appendChild(cellDate);

    return row;
  };
/**---------------------------------------
  DOM Function
---------------------------------------**/
  base.parseSalespersons = function() {
    base.checkedInToday = [];
    base.checkedInBefore = [];
    var i;
    for (i=0; i<base.salespersons.length;i++) {
      var salesperson = base.salespersons[i];
      var checkinDate = salesperson.checkin.date;
      checkinDate = new Date(checkinDate);

      var checkinDay = checkinDate.getDate();
      var checkinMonth = checkinDate.getMonth();
      var checkinYear = checkinDate.getFullYear();

      var thisDate = new Date();
      var thisDay = thisDate.getDate();
      var thisMonth = thisDate.getMonth();
      var thisYear = thisDate.getFullYear();

      //base.log('thisDate', thisDay + ' ' + thisMonth + ' ' + thisYear);
      //base.log('checkinDate', checkinDay + ' ' + checkinMonth + ' ' + checkinYear);

      if (thisDay === checkinDay && thisMonth === checkinMonth && thisYear === checkinYear) {
        base.checkedInToday.push(salesperson);
      }
      else {
        base.checkedInBefore.push(salesperson);
      }

    }
  };
  base.updateDom = function() {
    // Get containers
    var containerCheckedin = document.querySelector('#checkedin');
    var containerNotCheckedin = document.querySelector('#notcheckedin');
    // Remove all child nodes
    while (containerCheckedin.firstChild) {
      containerCheckedin.removeChild(containerCheckedin.firstChild);
    }
    while (containerNotCheckedin.firstChild) {
      containerNotCheckedin.removeChild(containerNotCheckedin.firstChild);
    }
    // Construct new child nodes
    var i;
    var salesperson;
    var row;
    for (i=0; i<base.checkedInToday.length;i++) {
      salesperson = base.checkedInToday[i];
      row = parsePerson(salesperson);
      containerCheckedin.appendChild(row);
    }
    for (i=0; i<base.checkedInBefore.length;i++) {
      salesperson = base.checkedInBefore[i];
      row = parsePerson(salesperson);
      containerNotCheckedin.appendChild(row);
    }
    function parsePerson(salesperson) {
      var data;
      var date = new Date(salesperson.checkin.date);
      var hours = date.getHours();
      var minutes = date.getMinutes();
      var day = date.getDay();
      var month = date.getMonth() + 1;
      if (hours < 10) {
        hours = '0' + hours.toString();
      }
      if (minutes < 10) {
        minutes = '0' + minutes.toString();
      }
      if (day < 10) {
        day = '0' + day.toString();
      }
      if (month < 10) {
        month = '0' + month.toString();
      }
      var time = hours + '.' + minutes;
      date = day + '.' + month;
      data = newRow(salesperson.title, salesperson.checkin.location.title, time, date);
      return data;
    }
  };
/**---------------------------------------
  getFeed
---------------------------------------**/
  var getFeed = function() {
    var xmlhttp = new XMLHttpRequest();
    var feedUrl = base.options.feedUrl;
    xmlhttp.onreadystatechange = function() {
      if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
        var data = JSON.parse(xmlhttp.responseText);
        base.log('data', data);
        base.salespersons = data.salespersons;
        base.parseSalespersons();
        base.updateDom();
        base.createSalesPersons();
      }
    };
    xmlhttp.open('GET', feedUrl, true);
    xmlhttp.send();
  };
/**---------------------------------------
  Map functions
---------------------------------------**/
  base.createSalesPersons = function(){
    var ol = window.ol;
    base.vectorSource.clear(); // Remove all features
    for (var i=0; i<base.checkedInToday.length; i++) {
      var salesPerson = base.checkedInToday[i];
      var iconFeature = new ol.Feature({
        //geometry: new ol.geom.Point(ol.proj.transform([Math.random()*360-180, Math.random()*180-90], 'EPSG:4326',   'EPSG:3857')),
        geometry: new ol.geom.Point(ol.proj.transform([salesPerson.checkin.location.long, salesPerson.checkin.location.lat], 'EPSG:4326',   'EPSG:3857')),
        //name: 'Null Island ' + i,
        id: salesPerson.id,
        title: salesPerson.title,
        checkin: salesPerson.checkin.date
      });
      base.vectorSource.addFeature(iconFeature);
    }
    base.updateSalesPersons();
  };
  base.updateSalesPersons = function() {
    var ol = window.ol;
    var featureList = base.vectorSource.getFeatures();
    for (var i=0; i < featureList.length; i++) {
      var feature = featureList[i];
      var styles = [];

      var title = feature.get('title');
      var checkin = feature.get('checkin');
      var checkinAge = new Date().getTime() - checkin;

      var hotProcent = (base.options.checkin.hotTime - checkinAge) / base.options.checkin.hotTime * 100;
      if (hotProcent < 0) {
        hotProcent = 0;
      }
      var radius = Math.round(lerp(base.options.checkin.minRadius, base.options.checkin.maxRadius, (hotProcent / 100)));

      // Make sure the radius is odd
      /*
      if (radius % 2 !== 0) {
        radius = radius -1;
      }
      */

      base.log('hotProcent', hotProcent);
      base.log('checkinAge', checkinAge);
      base.log('hotTime', base.options.checkin.hotTime);
      base.log('hotTime', base.options.checkin.minRadius);
      base.log('hotTime', base.options.checkin.maxRadius);
      base.log('radius', radius);
      base.log('radius % 2', radius % 2);


      var styleBackground = new ol.style.Style({
        image: new ol.style.Circle({
          radius: radius + 25,
          fill: new ol.style.Fill({
            color: 'rgba(255, 255, 255, 0.15)'
          })
        })
      });
      styles.push(styleBackground);

      var style = new ol.style.Style({
        image: new ol.style.Circle({
          radius: 25,
          fill: new ol.style.Fill({
            color: '#006245'
          })
        }),
        text: new ol.style.Text({
          text: feature.get('title'),
          offsetY: 0,
          font: '16px Eurostile LT W01 Bold',
          //fontSize: 30,
          //fontFamily: 'Eurostile Next W01 Bold',
          fill: new ol.style.Fill({
            color: '#fff'
          })
        })
      });
      styles.push(style);

      feature.setStyle(styles);
    }
  };
  var initMap = function() {
    var ol = window.ol;
    var raster = new ol.layer.Tile({
      /*
      source: new ol.source.TileJSON({
        //url: 'http://api.tiles.mapbox.com/v3/mapbox.world-dark.jsonp'
        //url: 'http://api.tiles.mapbox.com/v3/mapbox.geography-class.jsonp'
      })
      */
      source: new ol.source.XYZ({
        url: 'http://a.tiles.mapbox.com/v4/dmkjr.l4eh6baj/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiZG1ranIiLCJhIjoiVWhtTFY4byJ9._T6QqteLqUPaGPTnoGhtJg'
      })
    });

    var iconStyle = new ol.style.Style({
      /*
      image: new ol.style.Circle({
        radius: 10,
        fill: new ol.style.Fill({
          color: '#0000FF'
        }),
        stroke: new ol.style.Stroke({
          color: '#000000'
        })}),
        */
      /*
       image: new ol.style.Icon( ({
       anchor: [0.5, 46],w
       anchorXUnits: 'fraction',
       anchorYUnits: 'pixels',
       opacity: 0.75,
       src: 'icon.png'

       })),
       */
      /*
      text: new ol.style.Text({
        text: 'asdsd',
        offsetY: -25,
        fill: new ol.style.Fill({
          color: '#fff'
        })
      })
      */
    });

    var vectorSource = new ol.source.Vector({
      //features: iconFeatures //add an array of features
    });

    var vectorLayer = new ol.layer.Vector({
      source: vectorSource,
      style: iconStyle
    });

    var map = new ol.Map({
      layers: [raster, vectorLayer],
      target: 'map',
      view: new ol.View({
        //center: ol.proj.transform([10.92405, 56.1], 'EPSG:4326', 'EPSG:3857'),
        center: ol.proj.transform([12.4, 56.1], 'EPSG:4326', 'EPSG:3857'),
        zoom: 8
      })
    });
    base.map = map;
    base.vectorSource = vectorSource;
  };
/**---------------------------------------
  Bindings
 ---------------------------------------**/
  window.addEventListener('load', function() {
    //initMap();
  });
/**---------------------------------------
  Initialize
---------------------------------------**/
  var initiate = function () {
    initMap();
    getFeed();
    setInterval(function() {
      base.updateSalesPersons();
    }, base.options.updateMarkerInterval);
    setInterval(function() {
      //getFeed();
    }, base.options.requestInterval);
  };
  initiate();
  window.dashboard = base;

})(window, window.document);
