if(Meteor.isClient) {
  AutoForm.hooks({
    loginForm: {
      onSubmit: function(insertDoc, updateDoc, currentDoc) {
        var self =this;
        //without this, the Meteor.call line submits the form..
        this.event.preventDefault();
        this.event.stopPropagation();

        Meteor.loginWithPassword(insertDoc.email.toLowerCase(), insertDoc.password, function(err) {
          if(err) {
            alert(err);
          }
          else {
            self.resetForm();
            //see if want to auto do anything after signup / login
            var signInCallback =Session.get('signInCallback');
            if(signInCallback && signInCallback.url) {
              Router.go('/'+signInCallback.url);
            }
            else {
              Router.go('home');
            }
          }
        });

        this.done();
        return false;
      }
    }
  });
}