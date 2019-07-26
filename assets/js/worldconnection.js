var mymap = L.map('my-custom-map').setView([33.302986, 40.352783], 1.7);

	L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
		maxZoom: 18,
		attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
			'<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
			'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
		id: 'mapbox.streets'
	}).addTo(mymap);

  var jinkiCircleIcon = {
      radius: 500,
      fillColor: "#ff7800",
      color: "green",
      weight: 5,
      opacity: 1,
      fillOpacity: 0.8
  };

  var shipCircleIcon = {
      radius: 500,
      fillColor: "#ff7800",
      color: "red",
      weight: 5,
      opacity: 1,
      fillOpacity: 0.8
  };

	L.circle([55.652599, 12.544167], jinkiCircleIcon).addTo(mymap)
		.bindPopup("I am here!");

L.circle([53.148790, 8.200178], shipCircleIcon).addTo(mymap)
  .bindPopup("University of Oldenburg");
  L.circle([31.274758, 120.738244], shipCircleIcon).addTo(mymap)
		.bindPopup("Xi'an Jiaotong-Liverpool University");
    L.circle([36.102804, 129.388426], shipCircleIcon).addTo(mymap)
  		.bindPopup("Handong Global University");
      L.circle([28.601580, -81.200693], shipCircleIcon).addTo(mymap)
        .bindPopup("University of Central Florida");
        L.circle([36.398072, 127.363214], shipCircleIcon).addTo(mymap)
          .bindPopup("Korea Research Institute of Ships and Ocean Engineering");
          L.circle([36.368721, 127.367677], shipCircleIcon).addTo(mymap)
            .bindPopup("KAIST");
