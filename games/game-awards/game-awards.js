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
      var otherWinners =[];
      var html, href;
      award.winners.forEach(function(winner) {
        if(!award.winner || winner._id !== award.winner._id) {
          href =( winner.user1.username ) ? ggUrls.user(winner.user1.username) : '';
          html ='<a href=' + href + '>' + msUser.getName(winner.user1) + '</a>';
          if( winner.user2.profile ) {
            href =( winner.user2.username ) ? ggUrls.user(winner.user2.username) : '';
            html += ' & <a href=' + href + '>' + msUser.getName(winner.user2) + '</a>';
          }
          otherWinners.push(html);
        }
      });
      var ret ={
        icon: '/svg/',
        user1: award.winner.user1,
        user2: ( award.winner.user2.profile ) ? award.winner.user2 : null,
        otherWinnersHtml: otherWinners.length ? otherWinners.join(', ') : null
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