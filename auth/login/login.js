if(Meteor.isClient) {
  Template.login.rendered = function(){
    if (Meteor.user()){
      console.log("Already Logged In. Redirecting ...");
      Router.go('home');
    }
  }
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

  Template.login.events({
    'click .login-forgot-password-btn': function(evt, template) {
      var email =document.getElementById('loginForm').elements['email'].value;    //hardcoded
      if(email && email.length >1) {
        Accounts.forgotPassword({email:email});
        alert('Check your email at '+email+' to reset your password');
      }
      else {
        alert('Please enter a valid email');
      }
    }
  });
}