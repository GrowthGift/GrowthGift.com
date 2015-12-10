if(Meteor.isClient) {
  Template.gameUsers.created =function() {
    Meteor.subscribe('game', Template.instance().data.gameSlug);
  };

  Template.gameUsers.helpers({
    data: function() {
      if(!this.gameSlug) {
        Router.go('myGames');
        return false;
      }
      var game =GamesCollection.findOne({slug: this.gameSlug});
      var gameRule =(game && GameRulesCollection.findOne({ _id:game.gameRuleId }) )
       || null;
      var userGames =(game && UserGamesCollection.find({ gameId:game._id }).fetch() ) || null;
      if(!game || !gameRule || !userGames) {
        return {
          _xNotFound: true,
          _xHref: ggUrls.myGames()
        };
      }

      var gameUsers =ggGame.getGameUsersInfo(userGames);
      var users =ggGame.getUserGamesChallenges(userGames, game, gameUsers);
      users.forEach(function(user) {
        if(user && user.info) {
          user.info.xDisplay ={
            href: user.info.username ? ggUrls.user(user.info.username) : '',
            classes: {
              row: ''
            }
          };
          if(user.info._id ===Meteor.userId()) {
            user.info.xDisplay.classes.row ='self';
          }
        }
      });
      return {
        game: game,
        gameRule: gameRule,
        gameLink: ggUrls.game(this.gameSlug),
        // Get game challenge completions possible
        gameChallenge: ggGame.getCurrentChallenge(game, gameRule),
        users: users,
        challengeTotals: ggGame.getChallengeTotals(game, userGames, gameRule, null)
      };
    }
  });
}