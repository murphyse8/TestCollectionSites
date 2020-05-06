var esriLeafletMap = (function () {
  var init = function () {
    var map = L.map("map",
    {
      center: [46.5, -94],
      zoom: 6,
      minZoom: 4,
      scrollWheelZoom: false,
      maxBounds: [[35,-105],[60,-80]],
      maxBoundsViscosity: 1.0
    });
    L.esri.basemapLayer("Topographic").addTo(map);

    var siteIcon = L.icon({
      iconUrl: "MNMapPin.svg",
      iconSize: [25, 25],
      iconAnchor: [10,25],
      popupAnchor: [3,-20]
    });

    map.createPane("sites");

    var testingSites = L.esri.featureLayer({
      //url: "https://arcgis.metc.state.mn.us/arcgis/rest/services/covid/TestCollectionLocations/MapServer/0/",
      url: "https://services1.arcgis.com/KoDrdxDCTDvfgddz/arcgis/rest/services/TestCollectionLocations/FeatureServer/0",
      where: "1=1",
      pointToLayer: function (geojson, latlng) {
        return L.marker(latlng, {
          icon: siteIcon,
          renderer: L.svg(),
        });
      },
    });
    map.addLayer(testingSites);
    testingSites.bindPopup(function (layer) {
      var l = layer.feature.properties;
      if (l.HealthSystem === 'Sanford Health') {
        l.CollectAddress1 = "";
        l.CollectAddress2 = "";
      }
      var template =
            "{ HealthSystem }" + 
            "<br/><strong> { CollectSiteName }</strong> ";
      if (l.CollectAddress1 && l.CollectAddress1.length > 0) {
        template += "<br/>{ CollectAddress1 } ";
        if (l.CollectAddress2 && l.CollectAddress2.length > 0) {
          template += "{ CollectAddress2 }";
        }
      }
      template +=
            "<br/>{ City }, { State } { Zip }" +
            "<br/><strong>Weekdays: </strong> { HoursOfOpMF }" +
            "<br/><strong>Weekends: </strong> { HoursOfOpSatSun }";
      template +=
            "<br/><strong>Contact Info: <a href='tel: { Phone }'>{ Phone }</a></strong>";
      template +=
            "<br/>{ DirUtilCol }" +
            "<br/><button onclick='FilterSite(\"{ CollectSiteName }\")'>See more details below.</button>"
      return L.Util.template(template, l);
    }, { maxWidth: 300 });
    // testingSites.on('click', function (e) {
    //   map.setView([e.latlng.lat + 0.015, e.latlng.lng], 13); //map.setZoom(15)
    // });
  };
  return {
    init: init,
  };
})();
esriLeafletMap.init();
