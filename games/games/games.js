if(Meteor.isClient) {
  Template.games.created =function() {
    Meteor.subscribe('games-start');
  };

  Template.games.helpers({
    data: function() {

      // Want to get all games still happening so need game end. We dynamically
      // calculate that from the game rule challenges but for now all games
      // are 5 days so we'll just subtract 5 days from now and then look up by
      // start date.
      // TODO - add game.end to database?
      var startTime =moment().subtract(5, 'days');
      startTime =msTimezone.curDateTime(null, startTime);

      var games =GamesCollection.find({ start: { $gte : startTime } }).fetch();
      if(games) {
        var gameRuleIds =[];
        games.forEach(function(game) {
          gameRuleIds.push(game.gameRuleId)
        });
        var gameRules =GameRulesCollection.find({ _id: { $in: gameRuleIds } }).fetch();

        if(Meteor.userId()) {
          // Get all user's game to see if in a game.
          var userGames =UserGamesCollection.find({ userId: Meteor.userId() }).fetch();
        }
      }

      if(!games || !gameRules) {
        // Games do not exist (or have not loaded yet).
        return {
          _xNotFound: true,
          _xHref: ggUrls.myGames()
        };
      }

      var nowTimeFormat =msTimezone.curDateTime();
      var gameEnd, gameRule;
      games =_.sortByOrder(games.map(function(game) {
        gameRule =gameRules[_.findIndex(gameRules, '_id', game.gameRuleId)];
        gameEnd =ggGame.getGameEnd(game, gameRule);
        return _.extend({}, game, {
          xDisplay: {
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