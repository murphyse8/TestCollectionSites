var esriLeafletMap = (function () {
  var init = function () {
    var map = L.map("map").setView([46.5, -94], 6);
    L.esri.basemapLayer("Topographic").addTo(map);
    //L.esri.basemapLayer('Streets').addTo(map);

    var siteIcon = L.icon({
      iconUrl: "MNMapPin.svg",
      iconSize: [20, 20],
    });

    map.createPane("sites");

    var testingSites = L.esri.featureLayer({
      //url: 'https://services1.arcgis.com/KoDrdxDCTDvfgddz/arcgis/rest/services/MockupSites/FeatureServer/0',
      url:
        "https://services1.arcgis.com/KoDrdxDCTDvfgddz/ArcGIS/rest/services/CovidTestCollectionSites_Public/FeatureServer/0",
      //url: 'https://services.arcgis.com/8ZpVMShClf8U8dae/ArcGIS/rest/services/TestingLocations_public/FeatureServer/0', //GISCorps Nation-wide map service
      where: "1=1",
      onEachFeature: function (feature, layer) {
        console.dir(layer.feature);
      },
      pointToLayer: function (geojson, latlng) {
        return L.marker(latlng, {
          icon: siteIcon,
          renderer: L.svg(),
        });
        // return L.circleMarker(latlng, {
        //   pane: 'sites',
        //   color: 'gray',
        //   radius: 6,
        //   renderer: L.svg()
        // });
      },
    });
    map.addLayer(testingSites);
    testingSites.bindPopup(function (layer) {
      return L.Util.template(
        "<p>" +
          "{ HealthSystem } <strong> { CollectSiteName }</strong >" +
          "<br/>{ CollectAddress1 } { CollectAddress2 }" +
          "<br/>{ City }, { State } { Zip }" +
          "<br/><strong>Sun</strong> { HoursOfOpSun }" +
          "<br/><strong>Mon</strong> { HoursOfOpMon }" +
          "<br/><strong>Tue</strong> { HoursOfOpTues }" +
          "<br/><strong>Wed</strong> { HoursOfOpWed }" +
          "<br/><strong>Thu</strong> { HoursOfOpThurs }" +
          "<br/><strong>Fri</strong> { HoursOfOpFri }" +
          "<br/><strong>Sat</strong> { HoursOfOpSat }" +
          "<br/><strong>Contact Info: { Phone }</strong>" +
          "</p>",
        layer.feature.properties
      );
    });
  };
  return {
    init: init,
  };
})();
esriLeafletMap.init();
