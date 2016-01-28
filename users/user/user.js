if(Meteor.isClient) {
  Template.user.created =function() {
    if(Template.instance().data && Template.instance().data.username) {
      Meteor.subscribe('user-username', Template.instance().data.username);
    }
  };

  Template.user.helpers({
    nav: function() {
      var username =this.username;
      return {
        buttons: [
          {
            icon: 'fa fa-trophy',
            html: 'Awards',
            click: function() {
              Router.go(ggUrls.userGameAwards(username));
            }
          },
          {
            icon: 'fa fa-ellipsis-v',
            html: 'Timeline',
            click: function() {
              Router.go(ggUrls.userGameTimeline(username));
            }
          },
          {
            icon: 'fa fa-user',
            html: 'Profile',
            click: function() {
              Router.go(ggUrls.userProfile(username));
            }
          }
        ]
      };
    },
    data: function() {
      if(!this.username) {
        if(Meteor.user() && Meteor.user().username) {
          // Use logged in user
          Router.go('/u/'+Meteor.user().username);
          return {};
        }
        else {
          Router.go('home');
          return {};
        }
      }
      var user =Meteor.users.findOne({ username: this.username });
      if(!user) {
        return {
          _xNotFound: true,
          _xHref: '/home'
        };
      }

      var nav = this.nav ? this.nav : 'game-awards';
      var ret ={
        template: ( nav === 'game-awards' ) ? 'userGameAwards' :
        ( nav === 'game-timeline' ) ? 'userGameTimeline' :
        'userProfile',
        user: user
      };

      return ret;
    }
  });
}