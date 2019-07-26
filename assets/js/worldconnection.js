var mymap = L.map('my-custom-map').setView([33.302986, 40.352783], 1);

	L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
		maxZoom: 18,
		attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
			'<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
			'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
		id: 'mapbox.streets'
	}).addTo(mymap);

	L.marker([55.652599, 12.544167]).addTo(mymap)
		.bindPopup("I am here!").openPopup();

L.marker([53.148790, 8.200178]).addTo(mymap)
  .bindPopup("University of Oldenburg");
  L.marker([31.274758, 120.738244]).addTo(mymap)
		.bindPopup("Xi'an Jiaotong-Liverpool University");
    L.marker([36.102804, 129.388426]).addTo(mymap)
  		.bindPopup("Handong Global University");
      L.marker([28.601580, -81.200693]).addTo(mymap)
        .bindPopup("University of Central Florida");
        L.marker([36.398072, 127.363214]).addTo(mymap)
          .bindPopup("Korea Research Institute of Ships and Ocean Engineering");
          L.marker([36.368721, 127.367677]).addTo(mymap)
            .bindPopup("KAIST");


	var popup = L.popup();

	function onMapClick(e) {
		popup
			.setLatLng(e.latlng)
			.setContent("You clicked the map at " + e.latlng.toString())
			.openOn(mymap);
	}

	mymap.on('click', onMapClick);
