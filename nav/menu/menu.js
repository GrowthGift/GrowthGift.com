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
      console.log('logging out');   //TESTING
      Meteor.logout(function(err) {
        if(err) {
          alert(err);
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
    routeTo: "home"
  };
  var menuItemLanding ={
    icon: "fa fa-home",
    title: "Home",
    routeTo: "home"
  };
  var menuItems = [
    menuItemHome,
    {
      icon: "fa fa-bell",
      title: "Alerts",
      routeTo: "notifications"
    },
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
      index1 =nrArray.findArrayIndex(menuItemsLocal, 'routeTo', 'notifications', {});
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
      
      return menuItemsLocal;
    },
    menuLoggedOut: function() {
      return [
        menuItemLanding,
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