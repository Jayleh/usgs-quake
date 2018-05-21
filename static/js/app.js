let quakeUrl = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson';

d3.json(quakeUrl, (error, response) => {
    if (error) throw error;

    console.log(response);

    createFeatures(response.features);
});


function createFeatures(quakeData) {

    // Function to bind popups
    function onEachFeature(feature, layer) {
        let mag = feature.properties.mag,
            place = feature.properties.place,
            time = feature.properties.time;

        layer.bindPopup(
            `<h3>Magnitude ${mag}<br>${place}</h3><hr><p>${new Date(time)}</p>`
        );
    }

    // Function for color scale based on magnitude
    function getColor(mag) {
        return mag >= 9 ? '#800026' :
            mag >= 8 ? '#BD0026' :
                mag >= 7 ? '#E31A1C' :
                    mag >= 6 ? '#FC4E2A' :
                        mag >= 5 ? '#FD8D3C' :
                            mag >= 4 ? '#FEB24C' :
                                mag >= 3 ? '#FED976' :
                                    mag >= 2 ? '#D9EF8B' :
                                        '#A6D96A';
    }

    // Create GeoJSON layer
    let earthquakes = L.geoJSON(quakeData, {
        pointToLayer: (feature, latlng) => {
            let mag = feature.properties.mag;

            // Create and style each circle marker
            return L.circleMarker(latlng, {
                color: getColor(mag),
                fillColor: getColor(mag),
                fillOpacity: 0.8,
                weight: 0,
                radius: mag * 3,
            });
        },
        onEachFeature: onEachFeature
    });

    // Send earthquakes layer to createMap function
    createMap(earthquakes)
}


function createMap(earthquakes) {
    // Mapbox wordmark
    let mbAttr = 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
        '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
        'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        mbUrl = 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?' +
            'access_token=pk.eyJ1IjoiamF5bGVoIiwiYSI6ImNqaDFhaWo3MzAxNTQycXFtYzVraGJzMmQifQ.JbX9GR_RiSKxSwz9ZK4buw';

    // Define light layer
    let light = L.tileLayer(mbUrl, { id: 'mapbox.light', attribution: mbAttr });

    // Define baseMaps object to hold our base layers
    let baseMaps = {
        Light: light
    };

    // Create overlay object to hold overlay layer
    let overlayMaps = {
        Earthquakes: earthquakes
    };

    // Create map
    let myMap = L.map("map", {
        center: [25.3043, -90.0659],
        zoom: 3,
        layers: [light, earthquakes]
    });

    // Create layer control
    L.control
        .layers(baseMaps, overlayMaps, {
            collapsed: false
        })
        .addTo(myMap);

    // // Create a legend for magnitude color scale
    // let legend = L.control({
    //     position: 'bottomright'
    // });
    // // When layer control added, insert div with class 'legend'
    // legend.onAdd = _ => {
    //     let div = L.DomUtil.create('div', 'legend');
    //     return div;
    // };
    // // Add info legend to map
    // legend.addTo(map);



}

