window.NotifierView = countlyView.extend({
  beforeRender: function() {
    return $.when(countlyNotifier.initialize(), countlyTotalUsers.initialize("notifications")).then(function () {});
  },
  renderCommon:function (isRefresh) {
    var notifierData = countlyNotifier.getData();

    this.templateData = {
      "page-title":jQuery.i18n.map["notifier.title"],
      "logo-class":"notifications",
      "graph-type-double-pie":true,
      "pie-titles":{
        "left":jQuery.i18n.map["common.total-users"],
        "right":jQuery.i18n.map["common.new-users"]
      },
      "chart-helper":"notifier.chart"
    };

    if (!isRefresh) {
      $(this.el).html(this.template(this.templateData));
      if(typeof addDrill != "undefined"){
        $(".widget-header .left .title").after(addDrill("up.dnst"));
      }

      this.dtable = $('.d-table').dataTable($.extend({}, $.fn.dataTable.defaults, {
        "aaData": notifierData.chartData,
        "aoColumns": [
          { "mData": "notifier", sType:"session-duration", "sTitle": jQuery.i18n.map["notifier.table.notifier"] },
          { "mData": "t", sType:"formatted-num", "mRender":function(d) { return countlyCommon.formatNumber(d); }, "sTitle": jQuery.i18n.map["common.table.total-sessions"] },
          { "mData": "u", sType:"formatted-num", "mRender":function(d) { return countlyCommon.formatNumber(d); }, "sTitle": jQuery.i18n.map["common.table.total-users"] },
          { "mData": "n", sType:"formatted-num", "mRender":function(d) { return countlyCommon.formatNumber(d); }, "sTitle": jQuery.i18n.map["common.table.new-users"] }
        ]
      }));

      $(".d-table").stickyTableHeaders();
      countlyCommon.drawGraph(notifierData.chartDPTotal, "#dashboard-graph", "pie");
      countlyCommon.drawGraph(notifierData.chartDPNew, "#dashboard-graph2", "pie");
    }
  },
  refresh:function () {
    var self = this;
    $.when(this.beforeRender()).then(function () {
      if (app.activeView != self) {
        return false;
      }
      self.renderCommon(true);

      newPage = $("<div>" + self.template(self.templateData) + "</div>");

      $(self.el).find(".dashboard-summary").replaceWith(newPage.find(".dashboard-summary"));

      var notifierData = countlyNotifier.getData();

      countlyCommon.drawGraph(notifierData.chartDPTotal, "#dashboard-graph", "pie");
      countlyCommon.drawGraph(notifierData.chartDPNew, "#dashboard-graph2", "pie");
      CountlyHelpers.refreshTable(self.dtable, notifierData.chartData);
    });
  }
});

//register views
app.notifierView = new NotifierView();

app.route("/analytics/notifier", 'notifications', function () {
  this.renderWhenReady(this.notifierView);
});

$( document ).ready(function() {
  var menu = '<a href="#/analytics/notifier" class="item">'+
    '<div class="logo notifications"></div>'+
    '<div class="text" data-localize="sidebar.analytics.notifications">Notifications</div>'+
    '</a>';
  $('#mobile-type #analytics-submenu').append(menu);
  $('#web-type #analytics-submenu').append(menu);
});