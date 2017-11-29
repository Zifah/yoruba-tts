$(window).resize(function () {
  $("#play-sound").dialog("option", "position", "center");
  $("#contact-us").dialog("option", "position", "center");
});

(function ($) {
  $.include = function (url) {
    $.ajax({
      url: url,
      async: false,
      success: function (result) {
        document.write(result)
      }
    });
  }
}(jQuery));

var showContactUs = function(){
  $("#contact-us").dialog("open");
  $('.ui-widget-content :link').blur();
  $('.ui-widget-content :button').blur();
};

var showFAQ = function(){
  $("#faq").dialog("open");
  $('.ui-widget-content :link').blur();
  $('.ui-widget-content :button').blur();
};

var shareDialog = function(quote){
  var theLink = $("#share-facebook").attr("link");
  var description = $("#share-facebook").attr("text");
  FB.ui(
    {
     method: 'share',
     href: theLink,
     quote: description,
   }, function(response){});
}

var myOnCanPlayThroughFunction = function () {
  $("#play-sound").dialog("open");
  $('.ui-widget-content :link').blur();
  $('.ui-widget-content :button').blur();
};

var getParameterByName = function (name, url) {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, " "));
};

var getRootUrl = function () {
  var origin = window.location.protocol + '//' + window.location.host;
  return origin;
}

var copyLinkToClipboard = function () {
  var $temp = $("<input>");
  $("#play-sound").append($temp);
  $temp.val($("#share-link").attr("link")).select();
  document.execCommand("copy");
  $temp.remove();
}

/* Execute Callbacks on DomReady */

$(function () {
  $('[data-toggle="tooltip"]').tooltip();

  /* On large devices only */
  if ($(window).width() > 769) {

    $('.navbar .dropdown').hover(function () {
      $(this).find('.dropdown-menu').first().stop(true, true).delay(250).slideDown();
    }, function () {
      $(this).find('.dropdown-menu').first().stop(true, true).delay(100).slideUp();
    });

    $('.navbar .dropdown > a').click(function () {
      location.href = this.href;
    });

    $('.share a.btn-social').on('click', function (ev) {
      ev.preventDefault();
      if (/(facebook|twitter)/.test(ev.currentTarget.href)) {
        var c = 575,
          d = 520,
          e = ($(window).width() - c) / 2,
          f = ($(window).height() - d) / 2,
          g = "status=1,width=" + c + ",height=" + d + ",top=" + f + ",left=" + e;
        window.open(ev.currentTarget.href, "Share Yorùbá Names", g);
      } else {
        window.open(ev.currentTarget.href);
      }
    });

  }


  var alert_error = function (error) {
    return '<div class="alert alert-danger alert-dismissible" role="alert">' +
      '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">×</span></button>'
      + error + '</div>';
  };

  var alert_success = function (message) {
    return '<div class="alert alert-success alert-dismissible" role="alert">' +
      '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">×</span></button>'
      + message + '</div>';
  };

  /* Submit Name Feedback */
  $('form[name="name_feedback"]').on('submit', function (e) {
    e.preventDefault();
    return $.ajax({
      url: e.currentTarget.action,
      method: e.currentTarget.method,
      contentType: 'application/json',
      data: JSON.stringify({ name: $('#nameToFeedback').val(), feedback: $('textarea[name="feedback"]').val() }),
      type: 'json',
      success: function (resp) {
        e.currentTarget.reset();
        $('.response').html(alert_success("Feedback posted successfully. Thanks.")).fadeIn();
        setTimeout(function () {
          $('#improveEntryModal').modal('close');
        }, 1000);
      },
      error: function (jqXHR) {
        $('.response').html(alert_error(jqXHR.responseJSON.message || jqXHR.responseText)).fadeIn();
      }
    });
  });

  $(function () {
    $('#keyboard').keypress(function (e) {
      var key = e.which;
      if (key == 13)  // the enter key code
      {
        $('#opener').click();
        return false;
      }
    });

    $("#play-sound").dialog({
      autoOpen: false,
      modal: true,
      resizable: false,
      height: "auto",
      width: "auto",
      open: function () {
        $('.ui-widget-overlay').bind('click', function () {
          $('#play-sound').dialog('close');
        })
      }
    });

    $("#contact-us").dialog({
      autoOpen: false,
      modal: true,
      resizable: false,
      height: "auto",
      width: "auto",
      open: function () {
        $('.ui-widget-overlay').bind('click', function () {
          $('#contact-us').dialog('close');
        })
      }
    });

    $("#faq").dialog({
      autoOpen: false,
      modal: true,
      resizable: false,
      height: "auto",
      width: "auto",
      open: function () {
        $('.ui-widget-overlay').bind('click', function () {
          $('#faq').dialog('close');
        })
      }
    });

    $("#opener").click(function () {
      var text = $("#keyboard").val();
      var maxLength = 30;
      var trimmedText = text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
      var url = 'https://gentle-falls-68008.herokuapp.com/api/v1/names/' + text
      $('#audio-box')
        .html("<audio controls autoplay oncanplay='myOnCanPlayThroughFunction()'> \
        <source src='"+ url + "' type='audio/mpeg'> \
        Your browser does not support the audio tag. \
        </audio>");
      $("#play-sound").dialog('option', 'title', trimmedText);
      var rootUrl = getRootUrl();
      var longUrl = rootUrl + "/?q=" + text;
      var urlShortener = "https://www.googleapis.com/urlshortener/v1/url?key=AIzaSyCgMULF-1PPlsXf-auh4K-x1rIFNp4zy_Y";

      $.blockUI();
      $.ajax({
        url: urlShortener,
        type: "POST",
        data: JSON.stringify({ longUrl: longUrl }),
        contentType: "application/json; charset=utf-8",
        dataType: "json"
      }).done(function (data, textStatus, jqXHR) {
        var shortUrl = data.id; // John
        var twitterText = "Hear the pronunciation of '" + trimmedText + "'";
        $("#share-facebook").attr("link", longUrl);
        $("#share-facebook").attr("text", twitterText);
        $("#share-twitter").attr("href", "https://twitter.com/intent/tweet?url=" + shortUrl + "&text="
          + twitterText + "&hashtags=TTSYoruba&via=TTSYoruba");
        $("#share-link").attr("link", shortUrl);
        $("meta[property='og:description']").attr("content", twitterText);
      }).fail(function () {
        alert("An error occurred");
      }).complete(function(){
        $.unblockUI();
      });
    });

    /* Automatically load word from shared link */
    var passedName = getParameterByName('q');
    if (passedName) {
      $("#keyboard").val(passedName);
      $("#opener").click();
    }
  });

  $(function () {

    /* Typeahead */

    var names = new Bloodhound({
      datumTokenizer: Bloodhound.tokenizers.whitespace,
      queryTokenizer: Bloodhound.tokenizers.whitespace,
      /* remote: {
        url: '/v1/search/autocomplete?q=%QUERY',
        wildcard: '%QUERY'
      } */
    });

    $('#search-tph .th').typeahead({
      hint: true,
      highlight: true,
      minLength: 1
    },
      {
        name: 'searchname',
        source: names
      }
    );

  });


  // puts latest searches, latest addition and most popular in local storage
  $(function () {

    var searches, additions, popular;

    searches = additions = popular = [];

    $("#recent_searches li.recent_entry").each(function () {
      if ($(this).text() !== "") {
        searches.push($(this).text());
      }
    });

    $("#recent_additions li.recent_entry").each(function () {
      if ($(this).text() !== "") {
        additions.push($(this).text());
      }
    });

    $("#recent_popular li.recent_entry").each(function () {
      if ($(this).text() !== "") {
        popular.push($(this).text());
      }
    });

    if (searches && searches.length !== 0) {
      localStorage.setItem("searches", JSON.stringify(searches));
    }

    if (additions && additions.length !== 0) {
      localStorage.setItem("additions", JSON.stringify(additions));
    }

    if (popular && popular.length !== 0) {
      localStorage.setItem("popular", JSON.stringify(popular));
    }

  });



  // used by side bar to show popular names
  $(function () {

    var $ul = $("ul#side_popular"),
      item = JSON.parse(localStorage.getItem("popular") || '[]');

    item.forEach(function (i) {
      $ul.append("<li><a href='/entries/" + i + "'>" + i + "</a></li>");
    });

  });



  // set style for current alphabet whose entry is being displayed
  $(function () {
    var alphabet = location.pathname.split("/").pop();

    if ($(".alphabets").length !== 0 && alphabet && alphabet.length === 1) {

      $("ul.alphabets li").filter(function () {
        return $(this).text() === alphabet;
      }).css({ "background-color": "#D3A463", "font-weight": "bold" });

    }

  });

  /* Submit Name callbacks */
  $(function () {

    // Add GeoLocation Tags Input
    $("select[multiple]").multipleSelect();

    $('#suggestedName').blur(function () {

      var name = $(this).val();

      $.ajax({
        url: '/v1/names/' + name.toLowerCase(),
        type: 'GET',
        contentType: "application/json",
      }).success(function (response) {
        disableSending();
      }).error(function () {
        enableSending();
      });

      var enableSending = function () {
        // update link in error message
        $("#view-entry").attr("href", "");
        // hide error message
        $("#error-msg").hide();
        // enable submit button
        $("#submit-name").prop("disabled", false);
      };

      var disableSending = function () {
        // update link in error message
        $("#view-entry").attr("href", "/entries/" + name);
        // show error message
        $("#error-msg").show();
        // disable submit button
        $("#submit-name").prop("disabled", true);
      }

    });

    $('form#suggest-form').on('submit', function (event) {
      event.preventDefault();

      var suggestedName = {
        name: $('form#suggest-form #miniKeyboard').val(),
        details: $('form#suggest-form #suggestedMeaning').val(),
        geoLocation: getGeoLocations(),
        email: $('form#suggest-form #suggestedEmail').val()
      };

      function getGeoLocations() {
        var geoLocations = [];
        var rawValue = $("form#suggest-form select[multiple]").val();
        for (geoEntry in rawValue) {
          var geoLocation = {};
          var splitEntry = rawValue[geoEntry].split(".");
          geoLocation.region = splitEntry[0];
          geoLocation.place = splitEntry[1];
          geoLocations.push(geoLocation);
        }
        return geoLocations;
      }

      $.ajax({
        url: '/v1/suggestions',
        type: 'POST',
        contentType: "application/json",
        data: JSON.stringify(suggestedName),
        dataType: 'json'
      }).done(function () {
        $('form#suggest-form').trigger("reset");
      }).success(function () {
        $('.response').html(alert_success("Name was submitted successfully. Thank you.")).fadeIn();
      }).fail(function (jqXHR) {
        $('.response').html(alert_error(jqXHR.responseJSON.message || jqXHR.responseText)).fadeIn();
      });

    });

  });
});