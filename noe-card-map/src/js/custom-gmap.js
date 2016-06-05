var map;
var markers = [];
var infowindow =  new google.maps.InfoWindow({
    content: ""
});
var markerCluster;
var selectedData = [];
var data = [];
var ROOT_URL = 'http://niederoesterreich-card.at';

var gMapInitialize = function () {
    var location = getGeolocation();
    if (typeof location !== "object") {
        // fallback
        location = {lat: 47.8077887, long: 16.1458353};
    }
    var center = new google.maps.LatLng(location.lat, location.long);

    map = new google.maps.Map(document.getElementById('gmap'), {
        zoom: 10,
        center: center,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    });
    $.getJSON("map-src/noe-card-data.json")
        .done(function(dataClustered, textStatus) {
            // console.log(textStatus);
            $.each(dataClustered, function (index) {
                // todo find 4 missing pois ... 324 expected 320 returned
                $.each(dataClustered[index].pois, function (jndex) {
                    data.push(dataClustered[index].pois[jndex]);
                });
            });
            var sortedData = sortByGeolocationDistance(data, location.lat, location.long);
            setMarkers(sortedData);
            printDataTitle(sortedData);
        })
        .fail(function(jqxhr, settings, exception) {
            // console.log(exception);
        });

    // Bind event listener on button to reload markers
    $('#reloadMarkers').on('click', function () {
        // update data by filter
        // updated selected data by filter
        // selectedData = filterByFilterString(data.photos, $('#project-category').val());

        // refresh markers on map
        // reloadMarkers(selectedData);

        // redo projectlist
        // printDataTitle(selectedData);
    });
};

// setup infowindow on click on marker
var bindInfoWindow = function (marker, map, infowindow, description) {
    marker.addListener('click', function() {
        // infowindow.setContent(description);
        // infowindow.open(map, this);
        // update content and open modal
        $('#poiModal').modal('show');
        // title
        $('#poiModal .modal-title').html(this.title);
        // descrtion to body
        $('#poiModal .modal-body').html(description);
        // route info to button
        $('#poiModal .modal-route').attr('#' + this.title);
    });
};

// setup markers from data
var setMarkers = function (locations) {
    for (var i = 0; i < locations.length; i++) {
        var location = locations[i];
        var latLng = new google.maps.LatLng(location.latLng.latitude,
            location.latLng.longitude);
            // todo check if property isset
            var contentString = '<div id="infowindow-content">'+
            '<div id="siteNotice">'+
            '</div>'+
            //'<h3 id="firstHeading" class="firstHeading">' + location.title + '</h3>'+
            '<div id="infowindow-body-content">';
            if (location.images[0].url !== "") {
                contentString += '<a href="' + ROOT_URL + location.url + '" target="_blank"><img src="' + location.images[0].url + '" alt="Image: ' + location.images[0].description + '" width="270"></a>';
            }
            if (location.images[0].copyright !== "") {
                contentString += '<p>by ' + location.images[0].copyright + '</p>';
            }
            contentString += '<p><a class="btn btn-primary" role="button" href="' + ROOT_URL + location.url + '" target="_blank"><span class="glyphicon glyphicon-hand-right"></span> mehr Infos</a>'+
            '</div>'+
            '</div>';
            var marker = new google.maps.Marker({
                position: latLng,
                map: map,
                title: location.title
            });
            bindInfoWindow(marker, map, infowindow, contentString);
            markers.push(marker);
        }
        markerCluster = new MarkerClusterer(map, markers);
};

var reloadMarkers = function (markerDataArray) {
    // Loop through markers and set map to null for each
    for (var i=0; i<markers.length; i++) {
        markers[i].setMap(null);
    }
    markerCluster.clearMarkers(null);

    // Reset the markers array
    markers = [];

    // Call set markers to re-add markers
    setMarkers(markerDataArray);
};

// projectlist
var printDataTitle = function (data) {
    // bulid string for instertion
    var listString = '';
    // concat all output
    for (var i = 0; i < data.length; i++) {
        listString += '<li class="list-group-item"><a href="'+ ROOT_URL + data[i].url + '" target="_blank">' + data[i].title + '</a> (' + Math.round(data[i].distance * 100) / 100 + ' km)</li>';
    }
    // write to document
    $('#project-list').html(listString);
};

// filter
var filterByFilterString = function (arr, filterString) {
    var filteredArray = arr;
    if (filterString !== "") {
        filteredArray = [];
        for (var i = 0; i < arr.length; i++) {
            if (arr[i].hasOwnProperty('filter')) {
                if (arr[i].filter === filterString) {
                    filteredArray.push(arr[i]);
                }
            }
        }
    }
    return filteredArray;
};

// geolocation
var getGeolocation = function () {
    var location = false;
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(function (position) {
            console.log('thx for sharing your location at: ', position.coords.latitude, position.coords.longitude);
            location = {lat: position.coords.latitude, long: position.coords.longitude};
            showGeoSuccess();
        }, function (error) {
            console.log(error.PERMISSION_DENIED);
            showGeoFail();
        });
    } else {
        // no geolocation avaliable
        showGeoFail();
    }
    return location;
};

var showGeoSuccess = function () {
    $('h1').parent().prepend('<div class="alert alert-success fade in"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a><strong>Hab dich!</strong> Geolocation ermittelt!</div>');
};

var showGeoFail = function () {
    $('h1').parent().prepend('<div class="alert alert-warning fade in"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a><strong>:-( Geolocation konnte nicht bestimmt werden - Wiener Neustadt wird als Ausgangspunkt gewählt</div>');
};

var sortByGeolocationDistance = function (arr, currentLatitude, currentLongitude) {
    var sortedData = [];
        for (var i = 0; i < arr.length; i++) {
            // (arr[i].latLng.latitude - currentLatitude) + (arr[i].latLng.longitude - currentLongitude);
            // get the distance to current location
            arr[i].distance = distance(arr[i].latLng.latitude, arr[i].latLng.longitude, currentLatitude, currentLongitude);

            // sort by comparing to elements allready in the array
            // start with the first one by just adding it
            // if distance is higher or equal add to back of array
            if(i === 0 || arr[i].distance >= sortedData[sortedData.length - 1].distance) {
                sortedData.push(arr[i]);
            } else {
                // if the distance is smaller check the next smaller element
                for (var j = sortedData.length - 1; j >= 0 && (arr[i].distance < sortedData[j].distance); j--) {
                    if (j === 0 || arr[i].distance > sortedData[j - 1].distance) {
                        sortedData.splice(j, 0, arr[i]);
                        break;
                    }
                }
            }
        }
    return sortedData;
};

// https://en.wikipedia.org/wiki/Haversine_formula
var distance = function (lat1, lon1, lat2, lon2) {
  var p = 0.017453292519943295;    // Math.PI / 180
  var c = Math.cos;
  var a = 0.5 - c((lat2 - lat1) * p)/2 +
          c(lat1 * p) * c(lat2 * p) *
          (1 - c((lon2 - lon1) * p))/2;

  return 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
};

google.maps.event.addDomListener(window, 'load', gMapInitialize);
