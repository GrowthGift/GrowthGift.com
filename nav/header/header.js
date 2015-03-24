if(Meteor.isClient){  
  /**
  @todo
  - maybe switch to / use this package? https://atmospherejs.com/zimme/iron-router-auth
  */

  var navDefault ={
    classes: {
      cont: 'header-default'
    },
    layoutClasses: {
      cont: ''
    },
    title: {
      // html: 'LOGO',
      logo: true,
      click: function() {
        Router.go('home');
      }
    },
    useSubTitle: false,
    subTitle: {
      html: ''
    },
    buttons: {
      left: [
        {
          icon: 'fa fa-chevron-left',
          click: function() {
            history.back();
          }
        }
      ],
      right: [
        {
          icon: 'fa fa-bars',
          id: 'menu',
          click: function() {
            Session.set('navMenuVisible', true);
          }
        }
      ]
    },
    auth: {
      loggedIn: {}
    }

  };

  var navConfig ={};

  navConfig.devtestdesign =EJSON.clone(navDefault);
  navConfig.devtestdesign.url ='dev-test-design';
  navConfig.devtestdesign.auth ={};

  navConfig.devtesttest =EJSON.clone(navDefault);
  navConfig.devtesttest.url ='dev-test-test';
  navConfig.devtesttest.auth ={};

  navConfig.login =EJSON.clone(navDefault);
  navConfig.login.url ='login';
  navConfig.login.classes.cont ='header-login';
  navConfig.login.layoutClasses.cont ='layout-login';
  navConfig.login.layoutClasses.contBody ='layout-login';
  navConfig.login.auth ={};

  navConfig.signup =EJSON.clone(navDefault);
  navConfig.signup.url ='signup';
  navConfig.signup.classes.cont ='header-signup';
  navConfig.signup.layoutClasses.cont ='layout-signup';
  navConfig.signup.layoutClasses.contBody ='layout-signup';
  navConfig.signup.auth ={};
  
  navConfig.resetpassword =EJSON.clone(navDefault);
  navConfig.resetpassword.url ='reset-password';
  navConfig.resetpassword.classes.cont ='header-login';
  navConfig.resetpassword.layoutClasses.cont ='layout-login';
  navConfig.resetpassword.layoutClasses.contBody ='layout-login';
  navConfig.resetpassword.auth ={};

  navConfig.enrollAccount =EJSON.clone(navDefault);
  navConfig.enrollAccount.url ='enroll-account';
  navConfig.enrollAccount.classes.cont ='header-login';
  navConfig.enrollAccount.layoutClasses.cont ='layout-login';
  navConfig.enrollAccount.layoutClasses.contBody ='layout-login';
  navConfig.enrollAccount.auth ={};

  navConfig.notifications =EJSON.clone(navDefault);
  navConfig.notifications.url = 'notifications';
  navConfig.notifications.title.html ='Alerts';

  //allow access to root path / home page without being logged in - simply comment out this section to redirect to login page
  navConfig.home =EJSON.clone(navDefault);
  navConfig.home.url ='';
  navConfig.home.auth ={};

  Session.set('navUpdated', false);

  //set default
  //session variable will NOT work because it will remove the function(s)! - http://stackoverflow.com/questions/17302234/why-do-functions-in-object-properties-disappear-if-stored-in-a-session-meteor
  // Session.set('headerCurNav', navDefault);
  var headerCurNav =new ReactiveVar;
  headerCurNav.set(navDefault);

  function getCurNav(params) {
    var ret ={curNav: false};
    //get current url - https://github.com/EventedMind/iron-router/issues/289
    var curUrl =Iron.Location.get().pathname; //use pathname instead of path to remove the query string
    var xx, found =false;
    for(xx in navConfig) {
      if('/'+navConfig[xx].url ===curUrl) {
        ret.curNav =navConfig[xx];
        found =true;
        break;
      }
    }
    if(!found) {
      // console.log("using navDefault");   //TESTING
      ret.curNav =navDefault;
    }
    //remove logo if html is set
    if(ret.curNav.title.html) {
      delete ret.curNav.title.logo;
    }

    //add any alerts / notifications
    var index1 =nrArray.findArrayIndex(ret.curNav.buttons.right, 'id', 'menu', {});
    if(index1 >-1) {
      var custom =false;
      if(Meteor.user()) {
        var notification =lmNotify.readNotifications(Meteor.userId(), {});
        if(notification !==undefined) {
          var notificationCount =notification.notificationCount;
          if(notificationCount >0) {
            ret.curNav.buttons.right[index1].html ="<span class='relative'><span class='header-btn-alert'><i class='fa fa-bolt'></i></span><i class='fa fa-bars'></i></span>";
            ret.curNav.buttons.right[index1].icon =false;
            custom =true;
          }
        }
      }
      //reset
      if(!custom) {
        ret.curNav.buttons.right[index1].icon ="fa fa-bars";
        ret.curNav.buttons.right[index1].html =false;
      }
    }

    return ret;
  }

  Router.onBeforeAction(function() {
    var ret1 =getCurNav({});
    var retAuth =Auth.checkAuth({auth:ret1.curNav.auth});
    if(retAuth.valid) {
      this.next();
    }
    else {
      Router.go(retAuth.redirectPage);
    }
  });

  Router.onAfterAction(function() {
    var ret1 =getCurNav({});
    headerCurNav.set(ret1.curNav);
    
    //update layout
    Session.set('layoutClasses', ret1.curNav.layoutClasses);
  });

  Template.header.helpers({
    curNav: function() {
      Session.get('navUpdated'); // forces curNav to update when navUpdated changes
      return headerCurNav.get();
      Session.set('navUpdated', false);
    },
    deviceType: function(){
      if(Meteor.isCordova){
        // console.log("running in cordova mobile environment");
        var iOS = ( navigator.userAgent.match(/(iPad|iPhone|iPod)/g) ? true : false );
        if(iOS){
          // console.log("using iOS");
          return "header-iOS";
        }
        return "header-android";
      }
    }
  });

  Template.header.events({
    'click .header-left-btn': function(evt, template) {
      if(this.click !==undefined) {
        this.click();
      }
    },
    'click .header-right-btn': function(evt, template) {
      if(this.click !==undefined) {
        this.click();
      }
    },
    'click .header-title': function(evt, template) {
      var curNav =headerCurNav.get();
      if(curNav.title.click !==undefined) {
        curNav.title.click();
      }
    }
  });
}


