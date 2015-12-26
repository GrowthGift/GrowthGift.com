if(Meteor.isClient) {

  Template.gameUserAwards.helpers({
    data: function() {
      if(!this.awards) {
        return {
          _xNotFound: true,
          _xHref: ggUrls.myGames()
        };
      }

      var ret ={
        awards: this.awards,
        gameMainAction: this.gameMainAction
      };

      return ret;
    }
  });

  Template.gameUserAward.helpers({
    data: function() {
      var award = this.award;
      var earned = award.earned;
      var awardType =this.awardType;
      var action =this.gameMainAction;
      var ret ={
        icon: '/svg/',
        earned: earned,
        classes: ( earned ) ? 'earned' : 'not-earned',
        earnedText: ( earned ) ? 'You and your buddy earned this!' : 'You did not earn this award this game.',
        scoreToWin: award.scoreToWin || 0,
        yourScore: award.selfUser ? award.selfUser.val : 0
      };
      if(awardType === 'biggestImpact') {
        ret.title ="Impact";
        ret.description ="Your team completed the most " + action + ".";
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
        ret.scoreToWin =100;
      }
      else if(awardType === 'perfectAttendance') {
        ret.title ="Reliable";
        ret.description ="You and your buddy are your word - you both did your " + action + " every day.";
        ret.icon +='handshake.svg';
        ret.scoreToWin =100;
      }
      return ret;
    }
  });

}