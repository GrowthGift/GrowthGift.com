if(Meteor.isClient) {

  Template.gameAwards.helpers({
    data: function() {
      if(!this.gameSlug) {
        Router.go('myGames');
        return false;
      }
      var game =GamesCollection.findOne({slug: this.gameSlug});
      var gameRule =(game && GameRulesCollection.findOne({ _id:game.gameRuleId }) )
       || null;
      var userGames =(game && UserGamesCollection.find({ gameId:game._id }).fetch() ) || null;
      var gameUsers =ggGame.getGameUsersInfo(userGames);
      // Have to wait until all users are loaded, which is when the game.users
      // array length matches the the userGames length.
      if(!game || !gameRule || !userGames || !userGames.length || !gameUsers
       || !gameUsers.length) {
        return {
          _xNotFound: true,
          _xHref: ggUrls.myGames()
        };
      }

      var userId =Meteor.userId();

      var ret ={
        game: game,
        awards: ggGame.getAwards(userGames, game, gameUsers, gameRule, userId, null),
        gameRule: gameRule,
        gameState: ggGame.getGameState(game, gameRule, null)
      };
      ret.atLeastOneAward = ( ret.awards.reachTeamsNumActions.winner ||
       ret.awards.teamSize.winner || ret.awards.pledgePercent.winner ||
       ret.awards.completionPercent.winner ) ? true : false;
      ret.title = ( ret.gameState.gameEnded ) ? "Players of the Game" : "Top Players";

      return ret;
    }
  });

  Template.gameAward.helpers({
    data: function() {
      var award = this.award;
      var ret ={
        icon: '/svg/',
        user1: award.winner.user1,
        user2: ( award.winner.user2.profile ) ? award.winner.user2 : null
      };
      if(award.winner.reachTeamsNumActions) {
        ret.title ="Impact";
        ret.value =award.winner.reachTeamsNumActions + " team " +
         this.gameRule.mainAction;
        ret.icon +='superhero-take-off.svg';
      }
      else if(award.winner.teamSize) {
        ret.title ="Reach";
        ret.value =award.winner.teamSize + " team members";
        ret.icon +='group-male-female.svg';
      }
      else if(award.winner.pledgePercent) {
        ret.title ="Marksman";
        ret.value =award.winner.pledgePercent + "% pledge completion";
        ret.icon +='target-bulls-eye.svg';
      }
      else if(award.winner.completionPercent) {
        ret.title ="Reliable";
        ret.value =award.winner.completionPercent + "% days complete";
        ret.icon +='handshake.svg';
      }
      return ret;
    }
  });

}