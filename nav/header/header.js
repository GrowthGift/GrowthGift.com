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
          icon: 'fa fa-cube',
          html: 'My Games',
          click: function() {
            Router.go('myGames')
          }
        },
        {
          icon: 'fa fa-cubes',
          html: 'All Games',
          click: function() {
            Router.go('games')
          }
        },
        // {
        //   icon: 'fa fa-magic',
        //   html: 'My Gifts',
        //   click: function() {
        //     Router.go('my-gifts')
        //   }
        // },
        // {
        //   icon: 'fa fa-magic',
        //   html: 'All Gifts',
        //   click: function() {
        //     Router.go('gifts')
        //   }
        // },
        {
          icon: 'fa fa-user',
          html: 'Profile',
          id: 'menu',
          click: function() {
            Session.set('navMenuVisible', true);
          }
        }
      ],
      right: [
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
  navConfig.home.url ='home';
  navConfig.home.auth ={};

  navConfig.game =EJSON.clone(navDefault);
  navConfig.game.urlRegEx ="g\/[.]*";
  navConfig.game.auth ={};

  navConfig.gameRule =EJSON.clone(navDefault);
  navConfig.gameRule.urlRegEx ="gr\/[.]*";
  navConfig.gameRule.auth ={};

  navConfig.games =EJSON.clone(navDefault);
  navConfig.games.url ="games";
  navConfig.games.auth ={};

  navConfig.gameUsers =EJSON.clone(navDefault);
  navConfig.gameUsers.urlRegEx ="game-users\/[.]*";
  navConfig.gameUsers.auth ={};

  navConfig.user =EJSON.clone(navDefault);
  navConfig.user.urlRegEx ="u\/[.]*";
  navConfig.user.auth ={};

  navConfig.about =EJSON.clone(navDefault);
  navConfig.about.url ='about';
  navConfig.about.auth ={};
  navConfig.aboutPath =EJSON.clone(navDefault);
  navConfig.aboutPath.urlRegEx ="about\/[.]*";
  navConfig.aboutPath.auth ={};
  navConfig.faq =EJSON.clone(navDefault);
  navConfig.faq.url ='faq';
  navConfig.faq.auth ={};

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
      if( (navConfig[xx].urlRegEx && (new RegExp(navConfig[xx].urlRegEx)).test(curUrl)) || (navConfig[xx].url && '/'+navConfig[xx].url ===curUrl) ) {
        ret.curNav =navConfig[xx];
        found =true;
        break;
      }
    }
    if(!found) {
      ret.curNav =navDefault;
    }
    //remove logo if html is set
    if(ret.curNav.title.html) {
      delete ret.curNav.title.logo;
    }

    //add any alerts / notifications
    // var menuButtonSide ='right';
    var menuButtonSide ='left';
    var index1 =notoriiArray.findArrayIndex(ret.curNav.buttons[menuButtonSide], 'id', 'menu', {});
    if(index1 >-1) {
      var custom =false;
      if(Meteor.user()) {
        var notification =lmNotify.readNotifications(Meteor.userId(), {});
        if(notification !==undefined) {
          var notificationCount =notification.notificationCount;
          if(notificationCount >0) {
            ret.curNav.buttons[menuButtonSide][index1].alert =true;
            custom =true;
          }
        }
      }
      //reset
      if(!custom) {
        ret.curNav.buttons[menuButtonSide][index1].alert =false;
      }
    }

    // customize if logged in
    var index1 =notoriiArray.findArrayIndex(ret.curNav.buttons[menuButtonSide], 'id', 'menu', {});
    if(index1 >-1) {
      if(Meteor.user()) {
        ret.curNav.buttons[menuButtonSide][index1].icon ='fa fa-user';
        ret.curNav.buttons[menuButtonSide][index1].html =msUser.getName(Meteor.user());
      }
      else {
        ret.curNav.buttons[menuButtonSide][index1].icon ='fa fa-bars';
        ret.curNav.buttons[menuButtonSide][index1].html ='Menu';
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

    // Scroll to top of page
    window.scrollTo(0, 0);
  });

  Template.header.helpers({
    curNav: function() {
      Session.get('navUpdated'); // forces curNav to update when navUpdated changes
      return headerCurNav.get();
      Session.set('navUpdated', false);
    },
    deviceType: function(){
      if(Meteor.isCordova){
        var iOS = ( navigator.userAgent.match(/(iPad|iPhone|iPod)/g) ? true : false );
        if(iOS){
          return "header-iOS";
        }
        return "header-android";
      }
    }
  });

  Template.header.events({
    'click .header-btn': function(evt, template) {
      if(this.click !==undefined) {
        this.click();
      }
    },
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


