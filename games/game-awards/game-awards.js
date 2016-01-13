if(Meteor.isClient) {

  Template.gameAwards.helpers({
    data: function() {
      if(!this.awards || !this.gameState) {
        return {
          _xNotFound: true,
          _xHref: ggUrls.myGames()
        };
      }

      var ret ={
        awards: this.awards,
        gameMainAction: this.gameMainAction,
        gameState: this.gameState
      };
      ret.atLeastOneAward = ( ret.awards.reachTeamsNumActions.winner ||
       ret.awards.teamSize.winner || ret.awards.pledgePercent.winner ||
       ret.awards.completionPercent.winner ) ? true : false;
      ret.title = ( ret.gameState.gameEnded ) ? "Players of the Challenge" : "Top Players";

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
          otherWinners.push(winner);
        }
      });
      var ret ={
        icon: '/svg/',
        user1: award.winner.user1,
        user2: ( award.winner.user2.profile ) ? award.winner.user2 : null,
        otherWinnersHtml: otherWinners.length ? ( "<a href='" +
         ggUrls.gameUsers(this.gameSlug) + "'>" + otherWinners.length +
         " other winner" + ( ( otherWinners.length ===1 ) ? "" : "s" ) + ".</a>" ) : null
      };
      if(award.winner.reachTeamsNumActions) {
        ret.title ="Impact";
        ret.value =award.winner.reachTeamsNumActions + " team " +
         this.gameMainAction;
        ret.icon +='superhero-take-off.svg';
      }
      else if(award.winner.teamSize) {
        ret.title ="Team";
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