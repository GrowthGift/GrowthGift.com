/*
@toc
1. common
2. user
0. init collections
*/

SimpleSchema.debug =true;   //TESTING


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


GameTemplateSchema = new SimpleSchema({
  creator: {
    type: String
  },
  type: {
    type: String
  },
  title: {
    type: String
  },
  description: {
    type: String,
    optional: true
  },
  createdAt: {
    type: String,
    autoValue: autoValCreatedAt
  },
  updatedAt: {
    type: String,
    optional: true
  }
});

GameSchema = new SimpleSchema({
  gameTemplateId: {
    type: String
  },
  dailyTimeCommitment: {
    type: Number,
    optional: true
  },
  frequency: {
    type: Number
  },
  privacy: {
    type: String
  },
  start: {
    type: String
  },
  end: {
    type: String
  },
  users: {
    type: [Object],
    optional: true
  },
  "users.$.userId": {
    type: String
  },
  "users.$.status": {
    type: String
  },
  "users.$.role": {
    type: String,
    optional: true
  },
  groups: {
    type: [Object],
    optional: true
  },
  "groups.$.groupId": {
    type: String
  },
  "groups.$.status": {
    type: String
  },
  createdAt: {
    type: String,
    autoValue: autoValCreatedAt
  },
  updatedAt: {
    type: String,
    optional: true
  }
});

UserGameSchema = new SimpleSchema({
  gameId: {
    type: String
  },
  actions: {
    type: [Object],
    optional: true
  },
  "actions.$.status": {
    type: String
  },
  "actions.$.title": {
    type: String
  },
  "actions.$.text": {
    type: String,
    optional: true
  },
  "actions.$.privacy": {
    type: String
  },
  "actions.$.createdAt": {
    type: String,
    autoValue: autoValCreatedAt
  },
  createdAt: {
    type: String,
    autoValue: autoValCreatedAt
  }
});


//@toc 0.
//collections
// UsersCollection =new Meteor.Collection("users");   //use Meteor.users instead
NotificationsCollection =new Meteor.Collection("notifications");

GameTemplatesCollection =new Meteor.Collection("gameTemplates");
GamesCollection =new Meteor.Collection("games");
UserGamesCollection =new Meteor.Collection("userGames");
