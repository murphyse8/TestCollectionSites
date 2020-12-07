var allSiteData = [];
var siteData = [];

var cities = [];
var counties = [];

var currentPage = 1;
var pageSize = 10;
var maxPages = 12;

var acceptingAsymptomatic = true;

if (!Math.trunc) {
	Math.trunc = function (v) {
		return v < 0 ? Math.ceil(v) : Math.floor(v);
	};
}

var dataUrlTest = "https://services1.arcgis.com/KoDrdxDCTDvfgddz/arcgis/rest/services/CovidTestLocations_ProductionMapTest/FeatureServer/0/query?where=1%3D1&outFields=*&returnGeometry=false&f=json";
var dataUrlProd = "https://services1.arcgis.com/KoDrdxDCTDvfgddz/ArcGIS/rest/services/CovidTestLocations_ProductionMap/FeatureServer/0/query?where=1%3D1&outFields=*&returnGeometry=false&f=json";
var dataUrl = dataUrlProd;

$(function () {
  $.when(
    $.ajax({
      type: "get",
      url: dataUrl,
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

          var groupsOfFive = Math.trunc((allSiteData.length - 1) / 5) + 1;
          var howManyGroups = Math.trunc((groupsOfFive -1) / maxPages) + 1;
          pageSize = howManyGroups * 5;

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
  	  $('.comm-sites-filter').val('');
  	  PopulatePager();
  	  PopulateResults();
  	  $('.directory-item').first().focus();

  });

  $('.county-filter').on('change', function () {
  	  FilterCounty($(this).val());
  	  $('.city-filter').val('');
  	  $('.comm-sites-filter').val('');
  	  PopulatePager();
  	  PopulateResults();
	  $('.directory-item').first().focus();

  });

  $('.health-system-filter').on('change', function () {
  	  FilterHealthSystem($(this).val());
  	  $('.city-filter').val('');
  	  $('.county-filter').val('');
  	  PopulatePager();
  	  PopulateResults();
	  $('.directory-item').first().focus();

  });

  $('.comm-sites-filter').on('change', function () {
  	  FilterCommunitySitesOnly($(this).val());
  	  $('.city-filter').val('');
  	  $('.county-filter').val('');
  	  PopulatePager();
  	  PopulateResults();
	  $('.directory-item').first().focus();

  });

});

function FilterSite(nameId) {
	nameId = nameId.split(" ").join("_");
	FilterCity('');
	PopulatePager();
	PopulateResults();
	let siteCount = 0;
	$.each(siteData, function (idx, result) {
		siteCount++;
		if (siteCount > pageSize) {
			currentPage++;
			siteCount = 1;
		}
		if (result.CollectSiteName.split(" ").join("_") == nameId) {
			UpdatePager();
			PopulateResults();
			//console.log('page ' + currentPage);
			$('.directory-item[id="site-' + nameId + '"]').focus();
			return false;
		}
	});
}

function FilterCity(city) {
	// console.log('filter by City : ' + city);
	siteData = [];
	$.each(allSiteData, function(idx, result) {
		if (city == "" || (result.City && result.City.trim() == city)) {
			siteData.push(result);
		}
	});
	currentPage = 1;
}

function FilterCounty(county) {
	// console.log('filter by County : ' + county);
	siteData = [];
	$.each(allSiteData, function(idx, result) {
		if (county == "" || (result.County && result.County.trim() == county)) {
			siteData.push(result);
		}
	});
	currentPage = 1;
}

function FilterHealthSystem(healthSystem) {
	// console.log('filter by Health System : ' + healthSystem);
	siteData = [];
	$.each(allSiteData, function(idx, result) {
		if (county == "" || (result.HealthSystem && result.HealthSystem.trim() == healthSystem)) {
			siteData.push(result);
		}
	});
	currentPage = 1;
}

function FilterCommunitySitesOnly(communitySitesOnly) {
	// console.log('filter by Health System : ' + healthSystem);
	siteData = [];
	$.each(allSiteData, function(idx, result) {
		if (communitySitesOnly && (result.SiteID > 1000)) {
			siteData.push(result);
		}
	});
	currentPage = 1;
}

function PopulateFilters() {
	// console.log('filter setup : ' + counties.length + ' ' + cities.length);

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
    // console.log("page " + $(this).attr("data-page"));
    currentPage = parseInt($(this).attr("data-page"));

    UpdatePager();
    PopulateResults();
    $('.directory-item').first().focus();

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
    var x = a.CollectSiteName.replace('MN Community Testing - ', '').toLowerCase();
    var y = b.CollectSiteName.replace('MN Community Testing - ', '').toLowerCase();
    //var x = a.SiteID;
    //var y = b.SiteID;
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
      $newSite = $("<div class='directory-item'></div>").attr("tabindex", "0").attr("id", "site-" + result.CollectSiteName.split(" ").join("_"));

      $newSite.append(
        $("<h3 class='site-name'></h3>").text(result.CollectSiteName)
      );
      if (result.HealthSystem != result.CollectSiteName) {
      	$newSite.append(
      	  $("<div class='health-system'></div>").text(result.HealthSystem)
      	);
      }
      var isSanford = (result.HealthSystem == "Sanford Health");
      $newSite.append(
        $("<div class='site-address'></div>").html(
            (!isSanford ? result.CollectAddress1 + "<br>" : "") +
            // ((!isSanford && result.CollectAddress2) ? result.CollectAddress2 + "<br>" : "") +
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
            .append($('<span>' + replaceURLWithHTMLLinks(result.DirUtilCol) + '</span>'))
            .addClass('directions')
        );
      }
      if (result.SiteID > 2000) {
	      if (result.HoursOfOpMF)
	        $siteHours.append(
	          $("<li></li>")
	            .text(result.HoursOfOpMF)
	            .addClass("current")
	        );
	      if (result.HoursOfOpSatSun)
	        $siteHours.append(
	          $("<li></li>")
	            .text(result.HoursOfOpSatSun)
	            .addClass("current")
	        );
      } else {
	      if (result.HoursOfOpMF)
	        $siteHours.append(
	          $("<li></li>")
	            .text("Weekday Hours : " + result.HoursOfOpMF)
	            .addClass(day >= 1 && day <= 5 ? "current" : "")
	        );
	      if (result.HoursOfOpSatSun)
	        $siteHours.append(
	          $("<li></li>")
	            .text("Weekend Hours : " + result.HoursOfOpSatSun)
	            .addClass(day > 5 || day < 1 ? "current" : "")
	        );
      }
      if (result.CollectAddress2) {
      	$siteHours.append(
          $("<li></li>")
            .append($('<span>' + replaceURLWithHTMLLinks('For more details, visit ' + result.CollectAddress2) + '</span>'))
            .addClass('directions')
        );
      }

      $newSite.append($siteHours);

      $newSite.append($('<h4>Accepting</h4>'));

      $siteDetails = $('<ul class="site-details"></ul>');

      var acceptingAny = false;

      if (result.AcptAnySymPat && result.AcptAnySymPat.toUpperCase() != "NO") {
      	acceptingAny = true;
        $siteDetails.append(
          $("<li></li>")
            .html("Accepting any symptomatic patient" +
            	((result.AcptAnySymPat.toUpperCase() != "YES") ? " <b>(" + CleanDetails(result.AcptAnySymPat) + ")</b>" : ""))
        );      	
      } 

      AddSiteDetails($siteDetails, acceptingAny, result.AcptSymPatO65, "Accepting symptomatic patients over age 65");
      AddSiteDetails($siteDetails, acceptingAny, result.AcptSymPatCC, "Accepting symptomatic patients living in or recently in congregate care");
      AddSiteDetails($siteDetails, acceptingAny, result.AcptSymPatHom, "Accepting symptomatic patients who are experiencing homelessness");
      AddSiteDetails($siteDetails, acceptingAny, result.AcptSymPatDial, "Accepting symptomatic dialysis patients");
      AddSiteDetails($siteDetails, acceptingAny, result.AcptSymPatFam, "Accepting symptomatic health care workers and/or their symptomatic family");
      AddSiteDetails($siteDetails, acceptingAny, result.AcptSymPatMedC, "Accepting all symptomatic patients with underlying medical conditions");
      AddSiteDetails($siteDetails, acceptingAny, result.AcptSymFirstResp, "Accepting symptomatic first responders");
      AddSiteDetails($siteDetails, acceptingAny, result.AcptSymChildCar, "Accepting symptomatic child care workers");
      AddSiteDetails($siteDetails, acceptingAny, result.AcptSymTransPor, "Accepting symptomatic transportation workers");
      AddSiteDetails($siteDetails, acceptingAny, result.AcptSymFood, "Accepting symptomatic grocery/food production workers");
      AddSiteDetails($siteDetails, acceptingAny, result.AcptSymUtil, "Accepting symptomatic utility workers");

      //result.AcptASymWContact = "test this list, more";
      if (acceptingAsymptomatic && result.AcptASymWContact && result.AcptASymWContact.toUpperCase() != "NO") {
        let asymResult = result.AcptASymWContact.toUpperCase();
    	if (asymResult == "YES" || asymResult == "ANY" || asymResult == "ALL") {
        	$siteDetails.append(
	          $("<li></li>")
	            .html("Accepting any <i>asymptomatic</i> patient")
	        );  
        } else {
	        $siteDetails.append(
	          $("<li></li>")
	            .html("Accepting the following <i>asymptomatic</i> patients: " +
	            	((result.AcptASymWContact.toUpperCase() != "YES") ? " <b>" + CleanDetails(result.AcptASymWContact) + "</b>" : ""))
	        );        	
        }
      }

      $newSite.append($siteDetails);


      $("#SiteList").append($newSite);
    }
  });
  
  function AddSiteDetails($siteDetails, acceptingAny, details, text) {
  	details = CleanDetails(details);
	if (details && details.toUpperCase() != "NO" && (!acceptingAny || (details.toUpperCase() != "YES")))
	    $siteDetails.append(
	      $("<li></li>")
	        .html(text +
	    	((details.toUpperCase() != "YES") ? " <b>(" + details + ")</b>" : ""))
	    );      	  	
  }

  function CleanDetails(details) {
  	if (!details) {
  		return details;
  	}
  	details = details.replace('<Null>', '');
  	if (details.length > 5 && details.substring(0, 5).toUpperCase() == "YES, ") {
  		details = details.substring(5);
  	}
  	return details;
  }


}

function replaceURLWithHTMLLinks(text) {
	text = text.replace(' www.', ' https://www.');
    var re = /(\(.*?)?\b((?:https?|ftp|file):\/\/[-a-z0-9+&@#\/%?=~_()|!:,.;]*[-a-z0-9+&@#\/%=~_()|])/ig;
    return text.replace(re, function(match, lParens, url) {
        var rParens = '';
        lParens = lParens || '';

        // Try to strip the same number of right parens from url
        // as there are left parens.  Here, lParenCounter must be
        // a RegExp object.  You cannot use a literal
        //     while (/\(/g.exec(lParens)) { ... }
        // because an object is needed to store the lastIndex state.
        var lParenCounter = /\(/g;
        while (lParenCounter.exec(lParens)) {
            var m;
            // We want m[1] to be greedy, unless a period precedes the
            // right parenthesis.  These tests cannot be simplified as
            //     /(.*)(\.?\).*)/.exec(url)
            // because if (.*) is greedy then \.? never gets a chance.
            if (m = /(.*)(\.\).*)/.exec(url) ||
                    /(.*)(\).*)/.exec(url)) {
                url = m[1];
                rParens = m[2] + rParens;
            }
        }
        return lParens + "<a href='" + url + "' target='_blank'>" + url.replace('https://', '') + "</a>" + rParens;
    });
}