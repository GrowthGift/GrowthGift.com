if(Meteor.isClient) {
  Template.games.created =function() {
    Meteor.subscribe('games-start');
  };

  Template.games.helpers({
    data: function() {

      // Want to get all games that end >= 1 day from now.
      var dtFormat =msTimezone.dateTimeFormat;
      var nowTime =msTimezone.curDateTime('moment');
      var endTime =nowTime.clone().add(1, 'days').format(dtFormat);
      var games =GamesCollection.find({ end: { $gte : endTime } }).fetch();
      if(games) {
        var gameRuleIds =[];
        games.forEach(function(game) {
          gameRuleIds.push(game.gameRuleId)
        });
        var gameRules =GameRulesCollection.find({ _id: { $in: gameRuleIds } }).fetch();

        // Can just look up user id in game.users
        // if(Meteor.userId()) {
        //   // Get all user's game to see if in a game.
        //   var userGames =UserGamesCollection.find({ userId: Meteor.userId() }).fetch();
        // }
      }

      if(!games || !gameRules) {
        // Games do not exist (or have not loaded yet).
        return {
          _xNotFound: true,
          _xHref: ggUrls.myGames()
        };
      }

      var userId =Meteor.userId();
      var nowTimeFormat =msTimezone.curDateTime();
      var gameEnd, gameRule, userInGame;
      games =_.sortByOrder(games.map(function(game) {
        gameRule =gameRules[_.findIndex(gameRules, '_id', game.gameRuleId)];
        gameEnd =game.end;
        userInGame = ( userId && game.users &&
         ( _.findIndex(game.users, 'userId', userId) > -1 ) ) ? true : false;
        return _.extend({}, game, {
          xDisplay: {
            userInGame: userInGame,
            userMayJoin: (!userId || ggMay.joinGame(game, userId) ) ? true : false,
            usersText: ( game.users && game.users.length > 1 ) ? game.users.length + " players" : null,
            description: gameRule && _.trunc(gameRule.challenges[0].description, {length: 100}),
            classes: {
              userInGame: userInGame ? 'user-in-game' : ''
            },
            gameTime: (game.start > nowTimeFormat) ? ( "Starts " +
             msUser.toUserTime(Meteor.user(), game.start, null, 'fromNow') ) :
             ( "Ends " + msUser.toUserTime(Meteor.user(), gameEnd, null, 'fromNow') )
          }
        });
      }), ['start'], ['asc']);

      return {
        games: games
      };
    }
  });

}