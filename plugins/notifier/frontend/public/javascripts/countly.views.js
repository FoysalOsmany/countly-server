window.NotifierView = countlyView.extend({
  initialize:function () {
    this.filter = (store.get("countly_pluginsfilter")) ? store.get("countly_pluginsfilter") : "plugins-all";
  },
  beforeRender: function() {
    if(this.template)
      return $.when(countlyNotifier.initialize()).then(function (res) {alert(res.noSessionIn7Days)});
    else{
      var self = this;
      return $.when($.get(countlyGlobal["path"]+'/notifier/templates/daily-notifications.html', function(src){
        self.template = Handlebars.compile(src);
      }), countlyNotifier.initialize()).then(function () {});
    }
  },
  renderCommon:function (isRefresh) {
    var notificationData = countlyNotifier.getData();
    this.templateData = {
      "page-title":jQuery.i18n.map["notifier.title"]
    };

    Object.assign(this.templateData, notificationData);

    var self = this;
    if (!isRefresh) {
      $(this.el).html(this.template(this.templateData));
      $("#"+this.filter).addClass("selected").addClass("active");
      $.fn.dataTableExt.afnFiltering.push(function( oSettings, aData, iDataIndex ) {
        if(!$(oSettings.nTable).hasClass("plugins-filter"))
          return true;
        if(self.filter == "plugins-enabled") {
          return aData[4]
        }
        if(self.filter == "plugins-disabled") {
          return !aData[4]
        }
        return true;
      });

      this.dtable = $('#notification-table').dataTable($.extend({}, $.fn.dataTable.defaults, {
        "aaData": notificationData.users,
        "aoColumns": [
          { "mData": "userId", "sTitle": "UserID"},
          { "mData": "cc", "sTitle": "Country"},
          { "mData": "cty", "sTitle": "City"},
          { "mData": "sc", "sTitle": "Total sessions"},
          { "mData": "ls", "sTitle": "Last session"},
          { "mData": "condition", "sTitle": "Condition"}
        ]
      }));
      this.dtable.stickyTableHeaders();
      this.dtable.fnSort( [ [0,'asc'] ] );
    }
  },
  refresh:function (){
  },
  pushMsg:function (msg){
    alert(msg);
  },
  filterPlugins: function(filter){
    this.filter = filter;
    store.set("countly_pluginsfilter", filter);
    $("#"+this.filter).addClass("selected").addClass("active");
    this.dtable.fnDraw();
  }
});

//register views
app.notifierView = new NotifierView();

app.route("/notifier", 'notifier', function () {
  this.renderWhenReady(this.notifierView);
});

$( document ).ready(function() {
  var menu = '<a href="#/notifier" class="item notifications">'+
    '<div class="logo notifications ion-android-notifications"></div>'+
    '<div class="text" data-localize="notifier.title">Notifications</div>'+
    '</a>';

  $('.sidebar-menu').append(menu);
});