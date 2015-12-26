if(Meteor.isClient) {

  Template.gameUserSummary.created =function() {
    // Meteor.subscribe('game', Template.instance().data.gameSlug);
    // Meteor.subscribe('userAwards-userId');
    Meteor.subscribe('game-user-award', Template.instance().data.gameSlug);
  };

  Template.gameUserSummary.helpers({
    data: function() {
      if(!this.gameSlug || !Meteor.userId()) {
        Router.go('myGames');
        return false;
      }

      var game =(this.gameSlug && GamesCollection.findOne({slug: this.gameSlug}))
       || null;
      var gameRule =(game && GameRulesCollection.findOne({_id: game.gameRuleId}) )
       || null;
      var userGames =(game && UserGamesCollection.find({ gameId:game._id })
       .fetch() ) || null;
      var gameUsers =userGames ? ggGame.getGameUsersInfo(userGames) : null;
      var userId = Meteor.userId();
      var userAwards =UserAwardsCollection.findOne({ userId: userId });

      // Get user games for next week to see if user is in one already.
      // Get user games for next week to see if user is in one already.
      var dtFormat =msTimezone.dateTimeFormat;
      var nowTime =msTimezone.curDateTime('moment');
      var nextWeekTime =nowTime.clone().add(6, 'days').format(dtFormat);
      var nowTimeFormat =nowTime.format(dtFormat);
      var games =GamesCollection.find({ start: { $gte: nowTimeFormat,
       $lte: nextWeekTime }, "users.userId": userId }).fetch();
      var gameIds =[];
      games.forEach(function(game) {
        gameIds.push(game._id);
      });
      var userGamesSelf =UserGamesCollection.find({ userId: userId,
       gameId: { $in: gameIds } }).fetch();

      if(!game || !gameRule || !userGames || !userGames.length || !gameUsers
       || !gameUsers.length ) {
        return {
          _xNotFound: true,
          _xHref: ggUrls.myGames()
        };
      }

      var awards =ggGame.getUserAwards(userGames, game, gameUsers,
       gameRule, userAwards, userId, null);

      var ret ={
        game: game,
        gameUrl: ggUrls.game(game.slug),
        gamesSuggestUrl: ( !userGamesSelf || !userGamesSelf.length )
         ? ggUrls.gamesSuggest() : null
      };

      var templateHelperData ={
        awards: awards,
        gameMainAction: gameRule.mainAction,
        game: game
      };
      // Set on template instance so it is accessible.
      Template.instance().data.templateHelperData =templateHelperData;

      return ret;
    }
  });

}