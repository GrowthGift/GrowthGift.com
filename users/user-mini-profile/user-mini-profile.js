if(Meteor.isClient) {
  Template.userMiniProfile.created =function() {
    if(Template.instance().data && Template.instance().data.username) {
      Meteor.subscribe('user-username', Template.instance().data.username);
    }
  };

  Template.userMiniProfile.helpers({
    data: function() {
      if(!this.user && this.username) {
        this.user =Meteor.users.findOne({ username: this.username });
      }
      var user =this.user;
      if(!user) {
        return {
          _xNotFound: true,
          _xHref: '/home'
        };
      }

      user.xDisplay ={
        img: msUser.getImage(user),
        href: this.userHref ? this.userHref :
         ( user.username ) ? ggUrls.user(user.username) : ''
      };
      var displayType = this.displayType ? this.displayType : 'vertical';
      var ret ={
        template: ( displayType === 'horizontal' ) ?
         'userMiniProfileHorizontal' : 'userMiniProfileVertical',
        user: user,
        isSelf: ( Meteor.userId() && Meteor.userId() ===user._id ) ? true : false
      };
      return ret;
    }
  });

}