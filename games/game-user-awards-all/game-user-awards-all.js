if(Meteor.isClient) {

  // NOTE: this depends on a Meteor.subscribe being run that returns user games and awards!

  Template.gameUserAwardsAll.helpers({
    data: function() {
      var userId =this.userId;
      var userGames = userId ? UserGamesCollection.find({ userId: userId,
       awards: { $exists: true } }).fetch() : null;
      var userAward =userId ? UserAwardsCollection.findOne({ userId: userId }) : null;
      if(!userId) {
        return {
          _xNotFound: true
        };
      }

      return {
        awards: ggGame.getUserAwardsAll(userGames, userAward, userId)
      };
    }
  });

  Template.gameUserAwardAll.helpers({
    data: function() {
      var awards = this.awards;
      var awardType =this.awardType;
      var ret ={
        icon: '/svg/',
        amountEarned: awards.length
      };
      if(awardType === 'biggestImpact') {
        ret.title ="Impact";
        ret.description ="Your team completed the most actions.";
        ret.icon +='superhero-take-off.svg';
      }
      else if(awardType === 'biggestReach' ) {
        ret.title ="Reach";
        ret.description ="Your team had the most team members";
        ret.icon +='group-male-female.svg';
      }
      else if(awardType === 'perfectPledge') {
        ret.title ="Marksman";
        ret.description ="You and your buddy completed 100+% of your pledge.";
        ret.icon +='target-bulls-eye.svg';
      }
      else if(awardType === 'perfectAttendance') {
        ret.title ="Reliable";
        ret.description ="You and your buddy are your word - you both did your action every day.";
        ret.icon +='handshake.svg';
      }
      return ret;
    }
  });

}