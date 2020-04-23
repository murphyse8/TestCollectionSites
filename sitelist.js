var allSiteData = [];
var siteData = [];

var cities = [];
var counties = [];

var currentPage = 1;
var pageSize = 10;

if (!Math.trunc) {
	Math.trunc = function (v) {
		return v < 0 ? Math.ceil(v) : Math.floor(v);
	};
}

$(function () {

  $.when(
    $.ajax({
      type: "get",
      url:
        "https://arcgis.metc.state.mn.us/arcgis/rest/services/covid/TestCollectionLocations/MapServer/0//query?where=1%3D1&outFields=*&returnGeometry=false&f=json",
      dataType: "json",
    })
      .done(function (r) {
        if (r.features.length > 0) {
          var searchAddress;
          var searchLoc;
          $.each(r.features, function (idx, result) {

            if (result.attributes.CollectSiteName) {
              allSiteData.push(result.attributes);
              siteData.push(result.attributes);
            }

            if (result.attributes.City && cities.indexOf(result.attributes.City.trim()) < 0) {
              cities.push(result.attributes.City.trim());
            }

            if (result.attributes.County && counties.indexOf(result.attributes.County.trim()) < 0) {
              counties.push(result.attributes.County.trim());
            }
          });

          PopulateFilters();
          PopulatePager();
          PopulateResults();

        } else $("#SiteList").html("no sites found");
        //$(".site-pager").hide();
      })
      .fail(function () {
        console.warn("Call to site list failed");
        $("#SiteList").html("no sites available");
      })
  );

  $('.city-filter').on('change', function () {
  	  FilterCity($(this).val());
  	  $('.county-filter').val('');
  	  PopulatePager();
  	  PopulateResults();
  });

  $('.county-filter').on('change', function () {
  	  FilterCounty($(this).val());
  	  $('.city-filter').val('');
  	  PopulatePager();
  	  PopulateResults();
  });

});

function FilterCity(city) {
	//console.log('filter by City : ' + city);
	siteData = [];
	$.each(allSiteData, function(idx, result) {
		if (city == "" || (result.City && result.City.trim() == city)) {
			siteData.push(result);
		}
	});
	currentPage = 1;
}

function FilterCounty(county) {
	//console.log('filter by County : ' + county);
	siteData = [];
	$.each(allSiteData, function(idx, result) {
		if (county == "" || (result.County && result.County.trim() == county)) {
			siteData.push(result);
		}
	});
	currentPage = 1;
}

function PopulateFilters() {
	//console.log('filter setup : ' + counties.length + ' ' + cities.length);

	cities.sort();
	counties.sort();
	$.each(cities, function(idx, result) {
		$('.city-filter').append($('<option value="' + result + '">' + result + '</option>'));
	});
	$.each(counties, function(idx, result) {
		$('.county-filter').append($('<option value="' + result + '">' + result + '</option>'));
	});
}

function PopulatePager() {
  var lastPage = Math.trunc((siteData.length - 1) / pageSize) + 1;
  if (lastPage < 2) {
    $(".site-pager").hide();
  } else {
    $(".site-pager").show();
  }
  $(".site-pager li").remove();
  for (i = 1; i <= lastPage; i++) {
    $newPage = $(
      '<li><a href="#" class="page" data-page="' + i + '">' + i + "</a></li>"
    );
    $(".site-pager ul").append($newPage);
  }

  UpdatePager();

  $(".site-pager [data-page]").off().on("click", function (e) {
  	e.preventDefault();
    //console.log("page " + $(this).attr("data-page"));
    currentPage = parseInt($(this).attr("data-page"));

    UpdatePager();
    PopulateResults();
  });
}

function UpdatePager() {
  var lastPage = Math.trunc((siteData.length - 1) / pageSize) + 1;

  $(".site-pager .page").removeClass("current").attr("aria-label", "");
  $(".site-pager .page[data-page=" + currentPage + "]").addClass("current").attr("aria-label", "current page " + currentPage);
  $(".site-pager .pager-prev").attr(
    "data-page",
    (currentPage > 1) ? currentPage - 1 : 1
  );
  $(".site-pager .pager-next").attr(
    "data-page",
    (currentPage < lastPage) ? currentPage + 1 : lastPage
  );
  $(".site-pager .pager-last").attr(
  	"data-page", 
  	lastPage
  );

  var resultsShowTotal =
    currentPage == lastPage
      ? siteData.length - pageSize * (lastPage - 1)
      : pageSize;
  var resultsShowFirst = (currentPage - 1) * pageSize + 1;
  var resultsDisplay =
    "showing " +
    resultsShowFirst +
    " to " +
    (resultsShowFirst + resultsShowTotal - 1) +
    " of " +
    siteData.length;
  $(".site-pager .page-count").html(resultsDisplay);
}

function PopulateResults() {
  siteData.sort(function (a, b) {
    var x = a.CollectSiteName.toLowerCase();
    var y = b.CollectSiteName.toLowerCase();
    if (x < y) {
      return -1;
    }
    if (x > y) {
      return 1;
    }
    return 0;
  });

  currentCount = 0;
  $("#SiteList > div").remove();
  $.each(siteData, function (idx, result) {
    currentCount++;
    if (
      currentCount > (currentPage - 1) * pageSize &&
      currentCount < currentPage * pageSize + 1
    ) {
      $newSite = $("<div class='directory-item'></div>");

      $newSite.append(
        $("<h3 class='site-name'></h3>").text(result.CollectSiteName)
      );
      $newSite.append(
        $("<div class='health-system'></div>").text(result.HealthSystem)
      );
      $newSite.append(
        $("<div class='site-address'></div>").html(
          result.CollectAddress1 +
            "<br>" +
            (result.CollectAddress2 ? result.CollectAddress2 + "<br>" : "") +
            result.City +
            ", " +
            result.State +
            " " +
            (result.Zip ? result.Zip : "")
        )
      );
      if (result.Phone) {
      	$newSite.append(
          $("<div class='site-phone'></div>").append(
          	$('<a href="tel:' + result.Phone + '">' + result.Phone + '</a>')
 		  )
        );
      }

      $siteHours = $('<ul class="site-hours"></ul>');
      var day = new Date().getDay();
      if (result.DirUtilCol) {
      	$siteHours.append(
          $("<li></li>")
            .text(result.DirUtilCol)
            .addClass('directions')
        );
      }
      if (result.HoursOfOpMF)
        $siteHours.append(
          $("<li></li>")
            .text("Weekday Hours: " + result.HoursOfOpMF)
            .addClass(day >= 1 && day <= 5 ? "current" : "")
        );
      if (result.HoursOfOpSatSun)
        $siteHours.append(
          $("<li></li>")
            .text("Weekend Hours: " + result.HoursOfOpSatSun)
            .addClass(day > 6 || day < 1 ? "current" : "")
        );
      // if (result.HoursOfOpMon)
      //   $siteHours.append(
      //     $("<li></li>")
      //       .text("Monday " + result.HoursOfOpMon)
      //       .addClass(day == 1 ? "current" : "")
      //   );
      // if (result.HoursOfOpTue)
      //   $siteHours.append(
      //     $("<li></li>")
      //       .text("Tuesday " + result.HoursOfOpTue)
      //       .addClass(day == 2 ? "current" : "")
      //   );
      // if (result.HoursOfOpWed)
      //   $siteHours.append(
      //     $("<li></li>")
      //       .text("Wednesday " + result.HoursOfOpWed)
      //       .addClass(day == 3 ? "current" : "")
      //   );
      // if (result.HoursOfOpThu)
      //   $siteHours.append(
      //     $("<li></li>")
      //       .text("Thursday " + result.HoursOfOpThu)
      //       .addClass(day == 4 ? "current" : "")
      //   );
      // if (result.HoursOfOpFri)
      //   $siteHours.append(
      //     $("<li></li>")
      //       .text("Friday " + result.HoursOfOpFri)
      //       .addClass(day == 5 ? "current" : "")
      //   );
      // if (result.HoursOfOpSat)
      //   $siteHours.append(
      //     $("<li></li>")
      //       .text("Saturday " + result.HoursOfOpSat)
      //       .addClass(day == 6 ? "current" : "")
      //   );
      // if (result.HoursOfOpSun)
      //   $siteHours.append(
      //     $("<li></li>")
      //       .text("Sunday " + result.HoursOfOpSun)
      //       .addClass(day == 7 ? "current" : "")
      //   );

      $newSite.append($siteHours);

      $newSite.append($('<h4>Accepting</h4>'));

      $siteDetails = $('<ul class="site-details"></ul>');

      if (result.AcptASymWContact && result.AcptASymWContact.toUpperCase() != "NO")
        $siteDetails.append(
          $("<li></li>")
            .text("Accepting asymptomatic patients who may be contacts of infected patients" +
            	((result.AcptASymWContact.toUpperCase() != "YES") ? " (" + result.AcptASymWContact + ")" : ""))
        );

      if (result.AcptAnySymPat && result.AcptAnySymPat.toUpperCase() != "NO") {
        $siteDetails.append(
          $("<li></li>")
            .text("Accepting any symptomatic patient")
        );      	
      } else {
	      if (result.AcptSymPatO65 && result.AcptSymPatO65.toUpperCase() != "NO")
	        $siteDetails.append(
	          $("<li></li>")
	            .text("Accepting symptomatic patients over age 65")
	        );

	      if (result.AcptSymPatCC && result.AcptSymPatO65.toUpperCase() != "NO")
	        $siteDetails.append(
	          $("<li></li>")
	            .text("Accepting symptomatic patients living in or recently in congregate care")
	        );

	      if (result.AcptSymPatHom && result.AcptSymPatHom.toUpperCase() != "NO")
	        $siteDetails.append(
	          $("<li></li>")
	            .text("Accepting symptomatic patients who are experiencing homelessness")
	        );

	      if (result.AcptSymPatDial && result.AcptSymPatDial.toUpperCase() != "NO")
	        $siteDetails.append(
	          $("<li></li>")
	            .text("Accepting symptomatic dialysis patients")
	        );

	      if (result.AcptSymPatFam && result.AcptSymPatFam.toUpperCase() != "NO")
	        $siteDetails.append(
	          $("<li></li>")
	            .text("Accepting symptomatic health care workers and/or their symptomatic family")
	        );

	      if (result.AcptSymPatMedC && result.AcptSymPatMedC.toUpperCase() != "NO")
	        $siteDetails.append(
	          $("<li></li>")
	            .text("Accepting all symptomatic patients with underlying medical conditions")
	        );

	      if (result.AcptSymFirstResp && result.AcptSymFirstResp.toUpperCase() != "NO")
	        $siteDetails.append(
	          $("<li></li>")
	            .text("Accepting symptomatic first responders")
	        );

	      if (result.AcptSymChildCar && result.AcptSymChildCar.toUpperCase() != "NO")
	        $siteDetails.append(
	          $("<li></li>")
	            .text("Accepting symptomatic child care workers")
	        );

	      if (result.AcptSymTransPor && result.AcptSymTransPor.toUpperCase() != "NO")
	        $siteDetails.append(
	          $("<li></li>")
	            .text("Accepting symptomatic transportation workers")
	        );

	      if (result.AcptSymFood && result.AcptSymFood.toUpperCase() != "NO")
	        $siteDetails.append(
	          $("<li></li>")
	            .text("Accepting symptomatic grocery/food production workers")
	        );

	      if (result.AcptSymUtil && result.AcptSymUtil.toUpperCase() != "NO")
	        $siteDetails.append(
	          $("<li></li>")
	            .text("Accepting symptomatic utility workers")
	        );      	
	  }
      $newSite.append($siteDetails);


      $("#SiteList").append($newSite);
    }
  });
}
