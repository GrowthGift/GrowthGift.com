if(Meteor.isClient) {

  Template.gameUserTimeline.created =function() {
    Meteor.subscribe('user-game-timeline', Template.instance().data.userId);

    this.gamesVisible = new ReactiveVar({});
  };

  Template.gameUserTimeline.helpers({
    data: function() {
      var userId = this.userId;
      var userGames = userId ? UserGamesCollection.find({ userId: userId }).fetch()
       : null;
      var gameIds =[];
      userGames.forEach(function(ug) {
        gameIds.push(ug.gameId);
      });
      // Want past games only.
      var nowTimeFormat =msTimezone.curDateTime();
      var games = ( gameIds.length > 0 ) ? GamesCollection.find({ _id:
       { $in: gameIds }, end: { $lte: nowTimeFormat } }).fetch() : null;
      var gameRuleIds =[];
      // Get ALL buddy user info for any game
      var userIds =[ userId ];
      var gameUser, gameUserIndex, buddyId;
      var ugBuddyQuery ={
        $or: []
      };
      if(games) {
        games.forEach(function(game) {
          gameRuleIds.push(game.gameRuleId)

          // Get buddy user id, if exists.
          gameUserIndex =_.findIndex(game.users, 'userId', userId);
          gameUser = ( gameUserIndex > -1 ) ? game.users[gameUserIndex] : null;
          buddyId = gameUser && gameUser.buddyId || null;
          if( buddyId && userIds.indexOf( buddyId ) < 0 ) {
            userIds.push(buddyId);

            ugBuddyQuery.$or.push({
              userId: buddyId,
              gameId: game._id
            });
          }
        });
        var gameRules =GameRulesCollection.find({ _id: { $in: gameRuleIds } },
         { fields: { mainAction: 1, challenges: 1 } }).fetch();
      }

      // Get ALL buddy user info for any game
      var users =Meteor.users.find({ _id: { $in: userIds } },
       { fields: { profile:1, username:1 } }).fetch();

      var userGamesBuddy = ( ugBuddyQuery.$or.length > 0 ) ?
       UserGamesCollection.find(ugBuddyQuery).fetch() : null;

      if( !userGames || !games || !gameRules ) {
        return {
          _xNotFound: true,
          _xHref: ggUrls.myGames()
        };
      }

      var gamesVisible = Template.instance().gamesVisible.get();
      var ret1 =ggGame.getUserChallengesByWeek(users, userId,
       userGames, userGamesBuddy, games, gameRules, gamesVisible);

      return ret1;
    }
  });

  Template.gameUserTimeline.events({
    'click .game-user-timeline-title, click .game-user-timeline-more-info': function(evt, template) {
      var gameId =this.gameId;
      var gamesVisible = template.gamesVisible.get();
      gamesVisible[gameId] = !gamesVisible[gameId];
      template.gamesVisible.set(gamesVisible);
    }
  });
  
}