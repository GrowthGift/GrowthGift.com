if(Meteor.isClient) {
  Template.gameUsers.helpers({
    data: function() {
      var ret ={};
      var game =(this.gameSlug && GamesCollection.findOne({slug: this.gameSlug}))
       || null;
      if(!game) {
        if(this.gameSlug) {
          nrAlert.alert("No game rule with slug "+this.gameSlug);
        }
        Router.go('myGames');
        return ret;
      }

      ret.game =game;
      ret.gameLink =ggUrls.game(this.gameSlug);

      // Get game challenge completions possible
      var gameRule =GameRulesCollection.findOne({ _id:game.gameRuleId });
      ret.gameChallenge =ggGame.getCurrentChallenge(game, gameRule);

      var userGames =UserGamesCollection.find({ gameId:game._id }).fetch();
      ret.users =ggGame.getUserGamesChallenges(game._id, userGames);

      return ret;
    }
  });
}