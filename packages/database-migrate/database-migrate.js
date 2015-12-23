/**
Add scripts here for any database schema changes. Add each new migration
 as a new key in the BOTTOM OF the `migrations` array (in case order
 matters). This will be saved in the database so the `ggDatabaseMigrate.run`
 can be called and it will run ALL migrations that have not yet been
 updated on that environment.
*/

DatabaseMigrationsCollection =new Meteor.Collection("databaseMigrations");

_ggDatabaseMigrate ={};

ggDatabaseMigrate ={
  migrations: [
    {
      key: '2015-12-17T07:51:00-date-times-to-utc',
      fxn: function() { _ggDatabaseMigrate.dateTimesToUTC() }
    },
    {
      key: '2015-12-23T08:47:00-add-game-end',
      fxn: function() { _ggDatabaseMigrate.addGameEnd() }
    }
  ]
};

Meteor.methods({
  databaseMigrateRun: function() {
    ggDatabaseMigrate.run();
  }
});

ggDatabaseMigrate.run =function() {
  var doneMigrations =DatabaseMigrationsCollection.find({}).fetch();
  var toRun =[];
  ggDatabaseMigrate.migrations.forEach(function(migration, index) {
    if(_.findIndex(doneMigrations, 'key', migration.key) <0) {
      toRun.push(migration);
    }
  });

  // Run them. Order may matter / may need to do synchronously?
  var insertDoc ={};
  _ggDatabaseMigrate.unattachSchema();
  toRun.forEach(function(migration) {
    migration.fxn();

    // Update migrations collection to prevent running them again
    insertDoc ={
      key: migration.key,
      runAt: msTimezone.curDateTime()
    };
    console.info('migration run and inserted: ', insertDoc);
    DatabaseMigrationsCollection.insert(insertDoc);
  });
  _ggDatabaseMigrate.reattachSchema();
  console.info(toRun.length + ' total migration(s) run.');
};

/**
Schema may prevent changes, such as `createdAt` fields, which are locked /
 auto unset on update by autoValCreatedAt. So first we need to change the schema.
*/
_ggDatabaseMigrate.unattachSchema =function() {
  GameRuleOpenSchema = new SimpleSchema({
    users: {
      type: [Object],
      optional: true,
      blackbox: true
    },
    createdAt: {
      type: String,
      optional: true
    },
    updatedAt: {
      type: String,
      optional: true
    }
  });
  GameRulesCollection.attachSchema(GameRuleOpenSchema, {replace: true} );

  GameOpenSchema = new SimpleSchema({
    start: {
      type: String,
      optional: true
    },
    end: {
      type: String,
      optional: true
    },
    users: {
      type: [Object],
      optional: true,
      blackbox: true
    },
    createdAt: {
      type: String,
      optional: true
    },
    updatedAt: {
      type: String,
      optional: true
    }
  });
  GamesCollection.attachSchema(GameOpenSchema, {replace: true} );

  UserGameOpenSchema = new SimpleSchema({
    challenges: {
      type: [Object],
      optional: true,
      blackbox: true
    },
    createdAt: {
      type: String,
      optional: true
    }
  });
  UserGamesCollection.attachSchema(UserGameOpenSchema, {replace: true} );
};

_ggDatabaseMigrate.reattachSchema =function() {
  GameRulesCollection.attachSchema(GameRuleSchema, {replace: true});
  GamesCollection.attachSchema(GameSchema, {replace: true});
  UserGamesCollection.attachSchema(UserGameSchema, {replace: true});
};

/**
Go through ALL collections that stored a datetime and convert to UTC
SAFE TO RE-RUN? YES
*/
_ggDatabaseMigrate.dateTimesToUTC =function() {
  var modifier ={}, result;
  var nowTime =msTimezone.curDateTime();

  // Notifications should be fine; skip

  // Game Rules: users.updatedAt, createdAt, updatedAt
  var gameRules =GameRulesCollection.find({}, { fields: { users:1, createdAt:1, updatedAt:1 } }).fetch();
  gameRules.forEach(function(gameRule) {
    modifier ={
      $set: {
        createdAt: msTimezone.convertToUTC(gameRule.createdAt, {}),
        updatedAt: msTimezone.convertToUTC(gameRule.updatedAt, {})
      }
    };
    if(gameRule.users) {
      gameRule.users.forEach(function(user, index) {
        modifier.$set['users.'+index+'.updatedAt'] =( user.updatedAt ) ?
         msTimezone.convertToUTC(user.updatedAt, {}) : nowTime;
      });
    }
    console.info(gameRule, gameRule._id, modifier);
    GameRulesCollection.update( { _id: gameRule._id }, modifier);
  });

  // Games: start, users.updatedAt, createdAt, updatedAt
  var games =GamesCollection.find({}, { fields: { start:1, users:1, createdAt:1, updatedAt:1 } }).fetch();
  games.forEach(function(game) {
    modifier ={
      $set: {
        start: msTimezone.convertToUTC(game.start, {}),
        createdAt: msTimezone.convertToUTC(game.createdAt, {}),
        updatedAt: msTimezone.convertToUTC(game.updatedAt, {})
      }
    };
    if(game.users) {
      game.users.forEach(function(user, index) {
        modifier.$set['users.'+index+'.updatedAt'] =( user.updatedAt ) ?
         msTimezone.convertToUTC(user.updatedAt, {}) : nowTime;
      });
    }
    console.info(game, game._id, modifier);
    GamesCollection.update( { _id: game._id }, modifier);
  });

  // User Games: challenges.updatedAt, createdAt
  var userGames =UserGamesCollection.find({}, { fields: { challenges:1, createdAt:1 } }).fetch();
  userGames.forEach(function(userGame) {
    modifier ={
      $set: {
        createdAt: msTimezone.convertToUTC(userGame.createdAt, {})
      },
      $unset: {}
    };
    if(userGame.challenges) {
      var defaultUpdatedAt;
      userGame.challenges.forEach(function(challenge, index) {
        // use then unset createdAt, if exists
        if(challenge.createdAt) {
          defaultUpdatedAt =msTimezone.convertToUTC(challenge.createdAt, {});
          modifier.$unset['challenges.'+index+'.createdAt'] ='';
        }
        else {
          defaultUpdatedAt =nowTime;
        }

        modifier.$set['challenges.'+index+'.updatedAt'] =( challenge.updatedAt ) ?
         msTimezone.convertToUTC(challenge.updatedAt, {}) : defaultUpdatedAt;
      });
    }
    console.info(userGame, userGame._id, modifier);
    UserGamesCollection.update( { _id: userGame._id }, modifier);
  });

  // Friends and other collections not actually used yet: SKIP
};

/**
Add game.end to all games
SAFE TO RE-RUN? YES
*/
_ggDatabaseMigrate.addGameEnd =function() {
  var modifier ={}, result, gameRule, gameEnd;
  var games =GamesCollection.find({}, { fields: { start:1, end:1, gameRuleId:1 } }).fetch();
  games.forEach(function(game) {
    gameRule =GameRulesCollection.findOne({ _id: game.gameRuleId });
    gameEnd =ggGame.getGameEnd(game, gameRule);
    modifier ={
      $set: {
        end: msTimezone.convertToUTC(gameEnd, {})
      }
    };
    console.info(game, game._id, modifier);
    GamesCollection.update( { _id: game._id }, modifier);
  });
};