/*
@toc
0. init collections
1. common
2. user
*/

SimpleSchema.debug =true;   //TESTING

//@toc 0.
//collections
// UsersCollection =new Meteor.Collection("users");   //use Meteor.users instead
NotificationsCollection =new Meteor.Collection("notifications");


var autoValCreatedAt =function() {
  if(this.isInsert) {
    return moment().format('YYYY-MM-DD HH:mm:ssZ');
  }
  else if(this.isUpsert) {
    return {$setOnInsert: moment().format('YYYY-MM-DD HH:mm:ssZ')};
  }
  else {
    this.unset();
  }
};


/**
Common
@toc 1.
*/


/**
User
@toc 2.
*/
UserProfileSchema =new SimpleSchema({
  name:{
    type: String,
    optional: true
  }
});

UserSignupSchema = new SimpleSchema({
  email: {
    type: String
  },
  password: {
    type: String
  },
  name: {
    type: String
  }
});

UserLoginSchema = new SimpleSchema({
  email: {
    type: String
  },
  password: {
    type: String
  }
});

UserResetPasswordSchema = new SimpleSchema({
  password: {
    type: String
  }
});