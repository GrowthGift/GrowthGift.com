if(Meteor.isClient) {
  Template.gamesSuggest.created =function() {
    // For now just show all games (no actual recommendations)
    Meteor.subscribe('games-start');
  };

  Template.gamesSuggest.helpers({
    data: function() {

      // Want to get all games still happening.
      var endTime =msTimezone.curDateTime();

      var games =GamesCollection.find({ end: { $gte : endTime } }).fetch();
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

      // Slice top 3 games and then add in a "dummy one" for suggesting one.
      var maxGames =3;
      if(games.length > maxGames ) {
        games = games.slice(0, maxGames);
      }

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
        games: games,
        hiEmail: "mailto:hi@growthgift.com"   // TODO - pull from config
      };
    }
  });

}