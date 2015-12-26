if(Meteor.isClient) {

  Template.gameUserSummary.created =function() {
    // Meteor.subscribe('game', Template.instance().data.gameSlug);
    // Meteor.subscribe('userAwards-userId');
    Meteor.subscribe('game-user-award', Template.instance().data.gameSlug);
  };

  Template.gameUserSummary.helpers({
    data: function() {
      if(!this.gameSlug) {
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
        gameUrl: ggUrls.game(game.slug)
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