if(Meteor.isClient) {
  AutoForm.hooks({
    resetPasswordForm: {
      onSubmit: function(insertDoc, updateDoc, currentDoc) {
        var self =this;
        //without this, the Meteor.call line submits the form..
        this.event.preventDefault();
        this.event.stopPropagation();

        Accounts.resetPassword(Router.current().params.query.token, insertDoc.password, function(err) {
          if(err) {
            alert("Oops there was an error: "+err);
          }
          else {
            Router.go('login');
          }
        });

        this.done();
        return false;
      }
    }
  });

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