let quakeUrl = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson';

d3.json(quakeUrl, (error, response) => {
    if (error) throw error;

    console.log(response);

    createFeatures(response.features);
});


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
                radius: mag * 3.2,
            });
        },
        onEachFeature: onEachFeature
    });

    // Techtonic plates json path
    let platesUrl = 'https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json';

    // Create a layer group for faultlines
    let techPlates = new L.LayerGroup();

    // Perform a GET request to the query URL: APIlink_plates
    d3.json(platesUrl, (error, platesData) => {
        if (error) throw error;

        // once we get a response, send the geoJson.features array of objects object to the L.geoJSON method
        L.geoJSON(platesData.features, {
            style: (geoJsonFeature) => {
                return {
                    weight: 1,
                    // color: 'blue'
                }
            },
        }).addTo(techPlates);
    })

    // Send earthquakes layer to createMap function
    createMap(earthquakes, techPlates)
}


function createMap(earthquakes, techPlates) {
    // Mapbox wordmark
    let mbAttr = 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
        '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
        'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        mbKey = 'pk.eyJ1IjoiamF5bGVoIiwiYSI6ImNqaDFhaWo3MzAxNTQycXFtYzVraGJzMmQifQ.JbX9GR_RiSKxSwz9ZK4buw',
        mbUrl = `https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=${mbKey}`,
        mbStyleUrl = `https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/256/{z}/{x}/{y}?access_token=${mbKey}`;

    // Define light layer
    let light = L.tileLayer(mbUrl, { id: 'mapbox.light', attribution: mbAttr }),
        streets = L.tileLayer(mbStyleUrl, { id: 'streets-v10', attribution: mbAttr }),
        dark = L.tileLayer(mbUrl, { id: 'mapbox.dark', attribution: mbAttr }),
        naviNight = L.tileLayer(mbStyleUrl, { id: 'navigation-preview-night-v2', attribution: mbAttr }),
        satellite = L.tileLayer(mbUrl, { id: 'mapbox.satellite', attribution: mbAttr });

    // Define baseMaps object to hold our base layers
    let baseMaps = {
        Light: light,
        Streets: streets,
        Dark: dark,
        Night: naviNight,
        Satellite: satellite
    };

    // Create overlay object to hold overlay layer
    let overlayMaps = {
        Earthquakes: earthquakes,
        'Fault Lines': techPlates
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

    // Create a legend for magnitude color scale
    let legend = L.control({
        position: 'bottomright'
    });

    // When layer control added, insert div with class 'legend'
    legend.onAdd = function () {
        let div = L.DomUtil.create('div', 'legend'),
            magList = [1, 2, 3, 4, 5, 6, 7, 8, 9];

        for (let i = 0, ii = magList.length; i < ii; i++) {
            div.innerHTML +=
                `<i style='background:${getColor(magList[i])};'></i>${magList[i]}<br>`;
        }

        return div;
    };

    // Add info legend to map
    legend.addTo(myMap);
}

