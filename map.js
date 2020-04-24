var esriLeafletMap = (function () {
  var init = function () {
    var map = L.map("map",
    {
      center: [46.5, -94],
      zoom: 6,
      minZoom: 4,
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
      url: "https://arcgis.metc.state.mn.us/arcgis/rest/services/covid/TestCollectionLocations/MapServer/0/",
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
      var template =
            "{ HealthSystem }" +
            "<br/><strong> { CollectSiteName }</strong> " +
            "<br/>{ CollectAddress1 } { CollectAddress2 }" +
            "<br/>{ City }, { State } { Zip }" +
            "<br/><strong>Weekdays: </strong> { HoursOfOpMF }" +
            "<br/><strong>Weekends: </strong> { HoursOfOpSatSun }" +
            "<br/><strong>Contact Info: <a href='tel: { Phone }'>{ Phone }</a></strong>" +
            "<br/>{ DirUtilCol }" +
            "<br/><button onclick='FilterSite(\"{ CollectSiteName }\")'>See more details below.</button>"
      return L.Util.template(template, layer.feature.properties);
    }, { maxWidth: 550 });
  };
  return {
    init: init,
  };
})();
esriLeafletMap.init();
