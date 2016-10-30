(function (countlyNotifier, $) {

  //Private Properties
  var _data = [];

  //Public Methods
  countlyNotifier.initialize = function () {
    return $.ajax({
      type:"GET",
      url:countlyCommon.API_URL + "/notifications/daily",
      data:{
        api_key: countlyGlobal['member'].api_key,
        app_id: countlyCommon.ACTIVE_APP_ID
      },
      success:function (response) {
        _data = response;
      }
    });
  };

  countlyNotifier.getData = function () {
    return _data;
  };
}(window.countlyNotifier = window.countlyNotifier || {}, jQuery));