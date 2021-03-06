if(Meteor.isClient) {
  Template.signup.rendered = function(){
    if (Meteor.user()){
      // console.info("Already Logged In. Redirecting ...");
      Router.go('home');
    }
  }
  AutoForm.hooks({
    signupForm: {
      onSubmit: function(insertDoc, updateDoc, currentDoc) {
        var self =this;
        //without this, the Meteor.call line submits the form..
        this.event.preventDefault();
        this.event.stopPropagation();

        Meteor.call('msSlugAutogenValid', insertDoc.name, null, 'users', { slugField:'username'}, function(err, slug) {
          var signupOpts ={
            email: insertDoc.email.toLowerCase(),
            password: insertDoc.password,
            profile: {
              name: insertDoc.name,
              // Better to just get from browser dynamically than to save in
              // database permanently.
              // timezone: msTimezone.getBrowserTimezone()
            },
            username: slug
          };
          Accounts.createUser(signupOpts, function(err) {
            if(err) {
              nrAlert.alert(err);
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
        });

        this.done();
        return false;
      }
    }
  });
}