if(Meteor.isClient) {
  Template.gamesSuggest.created =function() {
    Meteor.subscribe('games-suggest');
  };

  Template.gamesSuggest.helpers({
    data: function() {

      // Get games that start next week (not this week or 2+ weeks in future)
      // OR end more than 2 days from now (for current games).
      var dtFormat =msTimezone.dateTimeFormat;
      var nowTime =msTimezone.curDateTime('moment');
      var endTime =nowTime.clone().add(2, 'days').format(dtFormat);
      var nextWeekTime =nowTime.clone().add(5, 'days').format(dtFormat);

      // Should be able to limit fields returned BUT it causes an issue on
      // the main game page where only the userId and status fields for the user
      // are loaded and the subscription ready fires.. So just return all fields.
      var games =GamesCollection.find({ end: { $gte : endTime }, start:
       { $lte : nextWeekTime } }).fetch();
      if(games) {
        var gameRuleIds =[];
        games.forEach(function(game) {
          gameRuleIds.push(game.gameRuleId)
        });
        var gameRules =GameRulesCollection.find({ _id: { $in: gameRuleIds } }).fetch();
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

      // Slice top 3 games and then add in a "dummy one" for suggesting one.
      var maxGames =3;
      if(games.length > maxGames ) {
        games = games.slice(0, maxGames);
      }

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

  Template.gamesSuggestNew.helpers({
    data: function() {
      return {
        hiEmail: "mailto:hi@growthgift.com"   // TODO - pull from config
      };
    }
  });

}