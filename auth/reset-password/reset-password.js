if(Meteor.isClient) {
  AutoForm.hooks({
    resetPasswordForm: {
      onSubmit: function(insertDoc, updateDoc, currentDoc) {
        var self =this;
        //without this, the Meteor.call line submits the form..
        this.event.preventDefault();
        this.event.stopPropagation();

        var token =Router.current().params.query.token;
        //look up the user now (before reset token is cleared) in case want to auto login the user after successful reset or do other processing after (re)set.
        var user =Meteor.users.findOne({"services.password.reset.token": token }, {fields: {profile:1, emails:1}});

        Accounts.resetPassword(token, insertDoc.password, function(err) {
          if(err) {
            alert("Oops there was an error: "+err);
          }
          else {
            //successful password (re)set - go to login (or could auto login the user here now)
            Router.go('login');
          }
        });

        this.done();
        return false;
      }
    }
  });

  Template.resetPassword.rendered =function() {
    if(Meteor.userId()) {
      Meteor.logout(function(err) {
        if(err) {
          alert(err);
        }
      });
    }
  };

  Template.resetPassword.helpers({
    passwordLabel: function() {
      if(!this.token) {
        alert("Invalid url - must have a token");
        Router.go('login');
      }
      
      var curUrl =Iron.Location.get().pathname;
      if(curUrl ==='/enroll-account') {
        return 'Password';
      }
      else {
        return 'New Password';
      }
    },
    btnTextResetPassword: function() {
      var curUrl =Iron.Location.get().pathname;
      if(curUrl ==='/enroll-account') {
        return 'Set Password';
      }
      else {
        return 'Reset Password';
      }
    }
  });
}

if(Meteor.isServer) {
  Meteor.publish('reset-password-user', function(token) {
    return Meteor.users.find({"services.password.reset.token": token }, {});
  });
}