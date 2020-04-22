
   var siteData = [];
   var currentPage = 1;
   var pageSize = 1;

	$(function () {
		console.log('ready');


       $.when(
          $.ajax({
              type: "get",
              url: "https://services1.arcgis.com/KoDrdxDCTDvfgddz/ArcGIS/rest/services/CovidTestCollectionSites_Public/FeatureServer/0/query?where=1%3D1&outFields=*&returnGeometry=false&f=json",
              dataType: "json"
          })
          .done(function (r) {
              if (r.features.length > 0) {
                  var searchAddress;
                  var searchLoc;
                  $.each(r.features, function (idx, result) {
                  		console.log('idx=' + idx);
                  		console.log('result=' + result);
                  		console.log('result.attributes=' + result.attributes);
                  		console.log('result.attributes.CollectSiteName=' + result.attributes.CollectSiteName);

                  		if (result.attributes.CollectSiteName){
	                  		siteData.push(result.attributes);
                  		}
                  });

                  siteData.sort(function(a, b){
					  var x = a.CollectSiteName.toLowerCase();
					  var y = b.CollectSiteName.toLowerCase();
					  if (x < y) {return -1;}
					  if (x > y) {return 1;}
					  return 0;
				  });

                  PopulatePager();
                  PopulateResults();

              } else
                  $("#SiteList").html("no sites found");
                  //$("#SitePager").hide();
          })
          .fail(function () {
              console.warn("Call to site list failed");
              $("#SiteList").html("no sites available");
          })
       );


    });

	function PopulatePager() {
		var lastPage = Math.trunc((siteData.length - 1) / pageSize) + 1;
		if (lastPage < 2) {
			$('#SitePager').hide();
		} else {
			$('#SitePager').show();
		}
		$('#SitePager li').remove();
		for (i = 1; i <= lastPage; i++) {
			$newPage = $('<li><a href="#" class="page" data-page="' + i + '">' + i + '</a></li>');
			$('#SitePager ul').append($newPage);
		}

		UpdatePager();

        $('#SitePager [data-page]').on('click', function () {
       		console.log('page ' + $(this).data('page'));
       		currentPage = $(this).data('page');

			UpdatePager()
       		PopulateResults();
        });

	}

	function UpdatePager() {
		var lastPage = Math.trunc((siteData.length - 1) / pageSize) + 1;

		$('#SitePager .page').removeClass('current');
		$('#SitePager .page[data-page=' + currentPage + ']').addClass('current');
		$('#SitePager .pager-prev').data('page', (currentPage > 1) ? currentPage - 1 : 1);
		$('#SitePager .pager-next').data('page', (currentPage < lastPage) ? currentPage + 1 : lastPage);
		$('#SitePager .pager-last').data('page', lastPage);
		
		var resultsShowTotal = (currentPage == lastPage) ? siteData.length - pageSize * (lastPage - 1) : pageSize;
		var resultsShowFirst = (currentPage - 1) * pageSize + 1;
		var resultsDisplay = "showing " + resultsShowFirst + " to " + (resultsShowFirst + resultsShowTotal - 1) + " of " + siteData.length;
		$('#SitePager .page-count').html(resultsDisplay);
	}

    function PopulateResults() {
	      currentCount = 0;
		  $('#SiteList > div').remove();
	      $.each(siteData, function (idx, result) {
	      		currentCount++;
	      		if (currentCount > (currentPage - 1) * pageSize && currentCount < (currentPage * pageSize + 1)) {
					$newSite = $("<div class='directory-item'></div>").text(result.CollectSiteName);
	          		$('#SiteList').append($newSite);
	      		}
	      });
    }