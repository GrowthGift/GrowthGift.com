if(Meteor.isServer) {

  // Notifications
  Meteor.publish('notifications', function() {
    if(!this.userId) {
      this.ready();
      return false;
    }
    return NotificationsCollection.find({userId: this.userId});
  });

  // Users
  Meteor.publish('user-username', function(username) {
    if(username) {
      return Meteor.users.find({username: username}, { fields: { createdAt:1, profile:1, username:1 } });
    }
    this.ready();
    return false;
  });

  // bulked route calls
  // Note: this should get all data for the `game` call as well (for EACH game).
  // This should means we can prevent waiting for looking up a game more than
  // once IF it is a game the current user is in.
  Meteor.publish('my-games', function() {
    if(this.userId) {
      var ret =[];
      var userGames =UserGamesCollection.find({ userId:this.userId });
      var userGamesFetch =(userGames && userGames.fetch() );
      var gameIds =[];
      if(userGamesFetch) {
        // Actually want to get ALL users in ANY game this user is in as well.
        // We'll do a combined query later once we have all game ids.
        // ret.push(userGames);
        userGamesFetch.forEach(function(ug) {
          gameIds.push(ug.gameId);
        });

        var games =( (gameIds.length >0) && GamesCollection.find({ _id: { $in: gameIds } })) || null;
        var gamesFetch =(games && games.fetch());
        if(gamesFetch) {
          ret.push(games);
          var gameRuleIds =[];
          var gameIds =[];
          gamesFetch.forEach(function(game) {
            gameRuleIds.push(game.gameRuleId)
            gameIds.push(game._id);
          });
          ret.push(GameRulesCollection.find({ _id: { $in: gameRuleIds } }));

          // Now do a user games query to get BOTH all games for this user and
          // for any user in any game this user is in too.
          var ugQuery ={
            $or: [
              {
                userId: this.userId
              },
              {
                gameId: { $in: gameIds }
              }
            ]
          };
          var userGamesAll =UserGamesCollection.find(ugQuery);
          ret.push(userGamesAll);

          var userGamesAllFetch =(userGamesAll && userGamesAll.fetch()) || null;
          if(userGamesAllFetch) {
            var userIds =[];
            userGamesAllFetch.forEach(function(user) {
              userIds.push(user.userId);
            });
            ret.push(Meteor.users.find({ _id: { $in:userIds } }, { fields: { profile:1, username:1 } }));
          }
        }
      }
      return ret;
    }
    this.ready();
    return false;
  });

  Meteor.publish('games-start', function() {
    var ret =[];

    // Want to get all games still happening so need game end. We dynamically
    // calculate that from the game rule challenges but for now all games
    // are 5 days so we'll just subtract 5 days from now and then look up by
    // start date.
    // TODO - add game.end to database?
    var startTime =moment().subtract(5, 'days');
    startTime =msTimezone.curDateTime(null, startTime);

    // This should work and limit fields returned BUT it causes an issue on
    // the main game page where only the userId and status fields for the user
    // are loaded and the subscription ready fires.. So just return all fields.
    // var games =GamesCollection.find({ start: { $gte : startTime } }, { fields:
    //  { gameRuleId:1, slug:1, title:1, image:1, privacy:1, start:1, "users.userId":1, "users.status":1 } });
    var games =GamesCollection.find({ start: { $gte : startTime } });
    var gamesFetch =(games && games.fetch());
    if(gamesFetch) {
      ret.push(games);
      var gameRuleIds =[];
      gamesFetch.forEach(function(game) {
        gameRuleIds.push(game.gameRuleId)
      });
      ret.push(GameRulesCollection.find({ _id: { $in: gameRuleIds } }));

      if(this.userId) {
        // Get all user's game to see if in a game.
        var userGames =UserGamesCollection.find({ userId: this.userId}, { fields:
         { userId:1, gameId:1 } });
        ret.push(userGames);
      }
    }
    return ret;
  });

  Meteor.publish('game-user-award', function(gameSlug) {
    if(gameSlug) {
      var ret =[];

      if(this.userId) {
        ret.push( UserAwardsCollection.find({ userId:this.userId }) );
      }

      var game =GamesCollection.find({slug: gameSlug});
      var gameFetch =(game && game.fetch()[0]);
      if(gameFetch) {
        ret.push(game);
        ret.push( GameRulesCollection.find({_id: gameFetch.gameRuleId}) );

        var userGames =(gameFetch && UserGamesCollection.find({ gameId:gameFetch._id }));
        ret.push(userGames);

        var userGamesFetch =(userGames && userGames.fetch()) || null;
        if(userGamesFetch) {
          var userIds =[];
          userGamesFetch.forEach(function(user) {
            userIds.push(user.userId);
          });
          ret.push(Meteor.users.find({ _id: { $in:userIds } }, { fields: { profile:1, username:1 } }));
        }

        return ret;
      }
    }
    this.ready();
    return false;
  });


  Meteor.publish('game', function(gameSlug) {
    if(gameSlug) {
      var game =GamesCollection.find({slug: gameSlug});
      var gameFetch =(game && game.fetch()[0]);
      if(gameFetch) {
        var ret =[];
        ret.push(game);
        ret.push( GameRulesCollection.find({_id: gameFetch.gameRuleId}) );

        var userGames =(gameFetch && UserGamesCollection.find({ gameId:gameFetch._id }));
        ret.push(userGames);

        var userGamesFetch =(userGames && userGames.fetch()) || null;
        if(userGamesFetch) {
          var userIds =[];
          userGamesFetch.forEach(function(user) {
            userIds.push(user.userId);
          });
          ret.push(Meteor.users.find({ _id: { $in:userIds } }, { fields: { profile:1, username:1 } }));
        }
        return ret;
      }
    }
    this.ready();
    return false;
  });

  Meteor.publish('save-game', function(gameSlug) {
    var ret =[
      GameRulesCollection.find({}, {fields: {title:1, type:1, description:1, slug:1} })
    ];
    // Need all game rules but should already have them so do not look up again.
    if(gameSlug) {
      ret.push( GamesCollection.find({slug: gameSlug}) );
    }
    return ret;
  });

  
  // users
  // Meteor.publish('users-gameSlug', function(gameSlug) {
  //   var game =(gameSlug && GamesCollection.findOne({slug: gameSlug})) || null;
  //   var userGames =(game && UserGamesCollection.find({ gameId:game._id }).fetch())
  //    || null;
  //   if(game && userGames) {
  //     var userIds =[];
  //     userGames.forEach(function(user) {
  //       userIds.push(user.userId);
  //     });
  //     return Meteor.users.find({ _id: { $in:userIds } }, { fields: { profile:1, username:1 } });
  //   }
  //   else {
  //     this.ready();
  //     return false;
  //   }
  // });


  // Not using following currently / any more.
  // // friends
  // Meteor.publish('friends-username', function(username) {
  //   if(username) {
  //     var user =Meteor.users.findOne({username: username});
  //     if(user && user._id) {
  //       // Need to return both friends and users (for friend user names)
  //       var ret =[];
  //       var query ={
  //         // Get all users this user is following AND all users who are
  //         // following this user.
  //         $or: [
  //           { userId: user._id },
  //           {
  //             users: {
  //               $elemMatch: {
  //                 userId: user._id,
  //                 relation: 'following'
  //               }
  //             }
  //           }
  //         ]
  //       };
  //       var friends =FriendsCollection.find(query, { fields: { userId:1 } });
  //       ret.push(friends);
  //       var friendsFetch =friends.fetch();
  //       if(friendsFetch) {
  //         var userIds =[];
  //         friendsFetch.forEach(function(friend) {
  //           userIds.push(friend.userId);
  //         });
  //         ret.push(Meteor.users.find({ _id: { $in:userIds } }, { fields: { createdAt:1, profile:1, username:1 } }));
  //       }
  //       return ret;
  //     }
  //   }
  //   this.ready();
  //   return false;
  // });

  // Meteor.publish('friends-userId', function() {
  //   if(this.userId) {
  //     // Need to return both friends and users (for friend user names)
  //     var ret =[];
  //     var query ={
  //       // Get all users this user is following AND all users who are
  //       // following this user.
  //       $or: [
  //         { userId: this.userId },
  //         {
  //           users: {
  //             $elemMatch: {
  //               userId: this.userId,
  //               relation: 'following'
  //             }
  //           }
  //         }
  //       ]
  //     };
  //     // Need to return users here for the current user. Though ideally would
  //     // NOT return users for other users who are following this user. But
  //     // I think there currently is a Meteor limitation that multiple publish
  //     // returns have to be from separate collections, so can not do this.
  //     var friends =FriendsCollection.find(query, { fields: { userId:1, users:1 } });
  //     ret.push(friends);
  //     var friendsFetch =friends.fetch();
  //     if(friendsFetch) {
  //       var userIds =[];
  //       friendsFetch.forEach(function(friend) {
  //         userIds.push(friend.userId);
  //       });
  //       ret.push(Meteor.users.find({ _id: { $in:userIds } }, { fields: { createdAt:1, profile:1, username:1 } }));
  //     }
  //     return ret;
  //   }
  //   this.ready();
  //   return false;
  // });

  // user awards
  Meteor.publish('userAwards-userId', function() {
    if(this.userId) {
      return UserAwardsCollection.find({ userId:this.userId });
    }
    else {
      this.ready();
      return false;
    }
  });


  // user games
  // Meteor.publish('userGames-userId', function() {
  //   if(this.userId) {
  //     return UserGamesCollection.find({ userId:this.userId });
  //   }
  //   else {
  //     this.ready();
  //     return false;
  //   }
  // });

  // Meteor.publish('userGames-gameSlug', function(gameSlug) {
  //   if(gameSlug) {
  //     var game =GamesCollection.findOne({slug: gameSlug});
  //     if(!game) {
  //       this.ready();
  //       return false;
  //     }
  //     return UserGamesCollection.find({ gameId:game._id });
  //   }
  //   else {
  //     this.ready();
  //     return false;
  //   }
  // });

  // Just use call above to get all
  // Meteor.publish('userGame-gameSlug', function(gameSlug) {
  //   if(gameSlug && this.userId) {
  //     var game =GamesCollection.findOne({slug: gameSlug});
  //     return UserGamesCollection.find({ gameId:game._id, userId:this.userId });
  //   }
  //   else {
  //     this.ready();
  //     return false;
  //   }
  // });

  // game rules
  Meteor.publish('gameRules', function() {
    // return GameRulesCollection.find({}, {fields: {title:1, mainAction:1, type:1, description:1, slug:1} });
    // TODO - once stop auto-generating challenges, do NOT return challenge
    // here as it is a lot of extra data we should not need!
    return GameRulesCollection.find({}, {fields: {title:1, mainAction:1, type:1, description:1, slug:1, challenges:1} });
  });

  // Meteor.publish('gameRules-userId', function() {
  //   var userGames =(this.userId && UserGamesCollection.find({ userId:this.userId }) ) || null;
  //   var gameIds =[];
  //   if(userGames) {
  //     userGames.forEach(function(ug) {
  //       gameIds.push(ug.gameId);
  //     });
  //   }
  //   var games =( (gameIds.length >0) && GamesCollection.find({ _id: { $in: gameIds } })) || null;
  //   var gameRuleIds =[];
  //   if(games) {
  //     games.forEach(function(game) {
  //       gameRuleIds.push(game.gameRuleId)
  //     });
  //     return GameRulesCollection.find({ _id: { $in: gameRuleIds } });
  //   }
  //   else {
  //     this.ready();
  //     return false;
  //   }
  // });

  Meteor.publish('gameRule-gameRuleSlug', function(gameRuleSlug) {
    if(gameRuleSlug) {
      return GameRulesCollection.find({slug: gameRuleSlug});
    }
    this.ready();
    return false;
  });

  // Meteor.publish('gameRule-gameSlug', function(gameSlug) {
  //   if(gameSlug) {
  //     var game =GamesCollection.findOne({slug: gameSlug});
  //     if(!game) {
  //       this.ready();
  //       return false;
  //     }
  //     return GameRulesCollection.find({_id: game.gameRuleId});
  //   }
  //   else {
  //     this.ready();
  //     return false;
  //   }
  // });

  // games
  // Meteor.publish('games-userId', function() {
  //   var userGames =(this.userId && UserGamesCollection.find({ userId:this.userId }) ) || null;
  //   var gameIds =[];
  //   if(userGames) {
  //     userGames.forEach(function(ug) {
  //       gameIds.push(ug.gameId);
  //     });
  //     return GamesCollection.find({ _id: { $in: gameIds } });
  //   }
  //   else {
  //     this.ready();
  //     return false;
  //   }
  // });

  // Meteor.publish('game-gameSlug', function(gameSlug) {
  //   if(gameSlug) {
  //     return GamesCollection.find({slug: gameSlug});
  //   }
  //   this.ready();
  //   return false;
  // });

}