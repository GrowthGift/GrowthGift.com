if(Meteor.isClient) {
  Template.signup.rendered = function(){
    if (Meteor.user()){
      console.log("Already Logged In. Redirecting ...");
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

        var signupOpts ={
          email: insertDoc.email.toLowerCase(),
          password: insertDoc.password,
          profile: {
            name: insertDoc.name
          }
        };
        Accounts.createUser(signupOpts, function(err) {
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