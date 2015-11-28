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

var autoValUpdatedAt =function() {
  return moment().format('YYYY-MM-DD HH:mm:ssZ');
};

// var slugRegEx =/^[a-zA-Z0-9-]*$/;
var slugRegEx =/^[a-z0-9-]*$/;

// In case of an existing document (on edit), we need the existing document id
// as well and there does not seem to be a way to get that here. So this will
// not work..
// However, this seems to be the ONLY way to get consistent error messages so
// we will lose this consistency from a UI standpoint but can still ensure
// proper validation on submit; we just won't have them on blur.
// var validateSlug =function(self, collectionKey, formNames) {
//   if(Meteor.isClient && self.isSet) {
//     Meteor.call('ggSlugValidate', self.value, collectionKey, function(err, exists) {
//       if(exists) {
//         formNames.forEach(function(curFormName) {
//           GameSchema.namedContext(curFormName).addInvalidKeys([{name: 'slug', type: 'slugExists'}]);
//         });
//       }
//     });
//   }
// };


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


GameRuleSchema = new SimpleSchema({
  slug: {
    type: String,
    regEx: slugRegEx
    // custom: function() {
    //   validateSlug(this, 'gameRules', ['saveGameRulesForm']);
    // }
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
  challenges: {
    type: [Object]
  },
  "challenges.$.id": {
    type: String
  },
  "challenges.$.title": {
    type: String
  },
  "challenges.$.description": {
    type: String
  },
  "challenges.$.dueFromStart": {
    type: String
  },
  users: {
    type: [Object],
    optional: true
  },
  "users.$.userId": {
    type: String
  },
  "users.$.role": {
    type: String,
    optional: true
  },
  createdAt: {
    type: String,
    autoValue: autoValCreatedAt
  },
  updatedAt: {
    type: String,
    autoValue: autoValUpdatedAt
  }
});

GameSchema = new SimpleSchema({
  gameRuleId: {
    type: String,
    optional: true    // TESTING
  },
  slug: {
    type: String,
    regEx: slugRegEx
    // custom: function() {
    //   validateSlug(this, 'games', ['saveGameForm']);
    // }
  },
  title: {
    type: String
  },
  privacy: {
    type: String
  },
  start: {
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
    autoValue: autoValUpdatedAt
  }
});

UserGameSchema = new SimpleSchema({
  gameId: {
    type: String
  },
  challenges: {
    type: [Object],
    optional: true
  },
  "challenges.$.title": {
    type: String
  },
  "challenges.$.text": {
    type: String,
    optional: true
  },
  "challenges.$.privacy": {
    type: String
  },
  "challenges.$.createdAt": {
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

GameRulesCollection =new Meteor.Collection("gameRules");
GamesCollection =new Meteor.Collection("games");
UserGamesCollection =new Meteor.Collection("userGames");

GameRulesCollection.attachSchema(GameRuleSchema);
GamesCollection.attachSchema(GameSchema);
UserGamesCollection.attachSchema(UserGameSchema);


// Custom validation
SimpleSchema.messages({
  slugExists: "[value] already exists",
  regEx: [
    // Setting just ONE regEx (or even regEx schemaKey) overrides ALL regEx
    // so need to redefine defaults here.. Should be able to extend defaults..
    {msg: "[label] failed regular expression validation"},
    {exp: SimpleSchema.RegEx.Email, msg: "[label] must be a valid e-mail address"},
    {exp: SimpleSchema.RegEx.WeakEmail, msg: "[label] must be a valid e-mail address"},
    {exp: SimpleSchema.RegEx.Domain, msg: "[label] must be a valid domain"},
    {exp: SimpleSchema.RegEx.WeakDomain, msg: "[label] must be a valid domain"},
    {exp: SimpleSchema.RegEx.IP, msg: "[label] must be a valid IPv4 or IPv6 address"},
    {exp: SimpleSchema.RegEx.IPv4, msg: "[label] must be a valid IPv4 address"},
    {exp: SimpleSchema.RegEx.IPv6, msg: "[label] must be a valid IPv6 address"},
    {exp: SimpleSchema.RegEx.Url, msg: "[label] must be a valid URL"},
    {exp: SimpleSchema.RegEx.Id, msg: "[label] must be a valid alphanumeric ID"},
    // Custom
    { exp: slugRegEx, msg: "[label] must be lowercase alphanumeric and hyphen characters only"}
  ]
});
