if (Meteor.isClient){
  Session.set('navMenuVisible', false);
  var menuItemLogin ={
    icon: "fa fa-sign-in",
    title: "Login",
    routeTo: "login"
  };
  var menuItemLogout ={
    icon: "fa fa-power-off",
    title: "Logout",
    // routeTo: "login"
    click: function() {
      console.info('logging out');
      ggGame.cacheClearAll();
      Meteor.logout(function(err) {
        if(err) {
          nrAlert.alert(err);
        }
        else {
          Router.go('home');
        }
      });
    }
  };
  var menuItemHome ={
    icon: "fa fa-home",
    title: "Home",
    // routeTo: "home"
    // TEMPOARARY hardcoded current (promoted) game
    // Home should work but was going to login page..
    routeTo: '/games'
  };
  var menuItemLanding ={
    icon: "fa fa-home",
    title: "Home",
    // routeTo: "home"
    // TEMPOARARY hardcoded current (promoted) game
    // Home should work but was going to login page..
    routeTo: '/games'
  };

  var menuItemAbout ={
    icon: "fa fa-info-circle",
    title: "About",
    routeTo: "about"
  };

  var menuItems = [
    menuItemHome,
    {
      icon: "fa fa-user",
      title: "Profile",
      routeTo: "userSelf"
    },
    {
      icon: "fa fa-bell",
      title: "Alerts",
      routeTo: "notifications"
    },
    menuItemAbout,
    // {
    //   icon: "fa fa-home",
    //   title: "Dev Test Test",
    //   routeTo: "devTestTest"
    // },
  ];

  Template.navMenu.helpers({
    menu: function() {

      var menuItemsLocal =EJSON.clone(menuItems);

      var index1;
      //add any alerts / notifications
      index1 =notoriiArray.findArrayIndex(menuItemsLocal, 'routeTo', 'notifications', {});
      if(index1 >-1) {
        var custom =false;
        if(Meteor.user()) {
          var notification =lmNotify.readNotifications(Meteor.userId(), {});
          if(notification !==undefined) {
            var notificationCount =notification.notificationCount;
            if(notificationCount >0) {
              menuItemsLocal[index1].title ="<span class='relative'><span class='nav-menu-alert'>"+notificationCount+"</span>Alerts</span>";
              custom =true;
            }
          }
        }
        //reset
        if(!custom) {
          menuItemsLocal[index1].title ="Alerts";
        }
      }
      
      return menuItemsLocal;
    },
    menuLoggedOut: function() {
      return [
        menuItemLanding,
        menuItemAbout,
        menuItemLogin
      ];
    },
    menuItemLogout: function() {
      return menuItemLogout;
    },
    contentVisibility: function(){
      if (Session.get('navMenuVisible')){
        return 'visible';
      }
      return 'hidden';
    },
    loggedIn: function(){
      if (Meteor.user()){
        return true;
      }
      return false;
    },
    userName: function() {
      var userName =false;
      var user =Meteor.user();
      if(user && user.profile && user.profile.name) {
        userName =user.profile.name;
      }
      return userName;
    },
    appVersion: function() {
      var appInfo =Config.appInfo({});
      return appInfo.name+' '+appInfo.version;
    }
  });
  Template.navMenu.events({
    'click .gray-overlay': function(evt, template) {
      Session.set('navMenuVisible', false);
    }
  });

  Template.navMenuItem.events({
    'click .nav-menu-item': function(evt, template) {
      Session.set('navMenuVisible', false);
      if(this.click !==undefined) {
        this.click();
      }
      else {
        Router.go(this.routeTo);
      }
    }
  });
  
}