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
}