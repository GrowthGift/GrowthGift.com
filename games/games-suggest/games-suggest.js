if(Meteor.isClient) {
  Template.gamesSuggest.created =function() {
    Meteor.subscribe('games-suggest');
  };

  Template.gamesSuggest.helpers({
    data: function() {

      // Get games that start next week (not this week or 2+ weeks in future).
      var dtFormat =msTimezone.dateTimeFormat;
      var nowTime =msTimezone.curDateTime('moment');
      var endTime =nowTime.format(dtFormat);
      var nextWeekTime =nowTime.clone().add(5, 'days').format(dtFormat);
      var sundayTime =nowTime.clone().startOf('week');
      // Allow same day, but if past the day, set to next week.
      if(sundayTime.format('YYYY-MM-DD') < nowTime.format('YYYY-MM-DD')) {
        sundayTime =sundayTime.add(7, 'days');
      }
      sundayTime =sundayTime.format(dtFormat);

      // Should be able to limit fields returned BUT it causes an issue on
      // the main game page where only the userId and status fields for the user
      // are loaded and the subscription ready fires.. So just return all fields.
      var games =GamesCollection.find({ end: { $gte : endTime }, start:
       { $gte : sundayTime, $lte : nextWeekTime } }).fetch();
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