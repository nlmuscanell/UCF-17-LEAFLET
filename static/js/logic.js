
// Store the API endpoint inside queryUrl (data for all earthquakes in the past month)
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson"

// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
    // Once we get a response, send the data.features object to the createFeatures function
    createFeatures(data.features);
  });

// Set marker size to be based on the magnitude of the earthquake
function markerSize(magnitude) {
  return magnitude * 3;
}

// Set marker color based on the depth of earthquake
function markerColor(depth) {
  switch (true) {
  case depth < 11:
    return "#72F318";
  case depth < 30:
    return "#B4F318";
  case depth < 51:
    return "#F6EF03";
  case depth < 71:
    return "#F69E03";""
  case depth < 91:
    return "#F68803";
  default:
    return "#F33918";
  };
}

// Define a function for each feature in the features array
function createFeatures(earthquakeData) {
  
  // Add a popup describing the place, time, and magnitutde of the earthquake
  function onEachFeature(feature, layer) {
    layer.bindPopup("<h3> Location: " + feature.properties.place +
      "</h3><hr><p>" + new Date(feature.properties.time) + "</p>" +
      "<p> Magnitude: " + feature.properties.mag +  "</p>");
  }

  // Add the markers
  function pointToLayer(feature, latlng) {
    return L.circleMarker(latlng,
    {
      opacity: 1,
      fillOpacity: 1,
      fillColor: markerColor(feature.geometry.coordinates[2]),
      color: "#000000",
      radius: markerSize(feature.properties.mag),
      stroke: true,
      weight: .5
    });
  }

  // Create a GeoJSON layer containing the features array & run onEachFeature function
  var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,
    pointToLayer: pointToLayer
  });

  createMap(earthquakes);
} 
  // Add the earthquakes layer to the createMap function
  function createMap(earthquakes) {

    // Define streetmap layer
    var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
      attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
      tileSize: 512,
      maxZoom: 18,
      zoomOffset: -1,
      id: "mapbox/streets-v11",
      accessToken: API_KEY
    });
  
    // Define a baseMaps object to hold base layers
    var baseMaps = {
      "Street Map": streetmap,
    };
  
    // Create overlay object to hold overlay layer
    var overlayMaps = {
      Earthquakes: earthquakes
    };

  // Create map - display streetmap and earthquakes layers on load
  var myMap = L.map("map", {
    center: [
      0.000000, 15.000000
    ],
    zoom: 2.5,
    layers: [streetmap, earthquakes]
  });

  // Add a layer control with baseMaps and overlayMaps
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  // Add a legend
  var legend = L.control({position: 'bottomright'});
  
  legend.onAdd = function (myMap) {
      var div = L.DomUtil.create('div', 'info legend'),
          grades = [-10, 10, 30, 50, 70, 90],
          labels = [];
      
      for (var i = 0; i < grades.length; i++) {
          div.innerHTML +=
              '<i style="background:' + markerColor(grades[i] + 1) + '"></i> ' +
              grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
      }
      return div;
  }
  legend.addTo(myMap);
  };