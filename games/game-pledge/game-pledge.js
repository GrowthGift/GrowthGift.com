GamePledgeSchema = new SimpleSchema({
  selfGoal: {
    type: Number,
    min: 1
  }
});

Meteor.methods({
  saveGamePledge: function(game, gameUserData) {
    ggGame.saveGameInvite(game, Meteor.userId(), gameUserData, function(err, result) {
      if(Meteor.isClient) {
        if(!err && result) {
          // Need to clear cache
          var cacheKey ='game_slug_'+game.slug+'_user_id_'+Meteor.userId();
          ggGame.clearCache(cacheKey);
          Router.go(ggUrls.gameInviteBuddy(game.slug));
        }
      }
    });
  }
});

if(Meteor.isClient) {
  AutoForm.hooks({
    gamePledgeForm: {
      onSubmit: function(insertDoc, updateDoc, currentDoc) {
        var self =this;
        //without this, the Meteor.call line submits the form..
        this.event.preventDefault();
        this.event.stopPropagation();

        var templateInst =msTemplate.getMainTemplate("Template.gamePledge");
        var game =GamesCollection.findOne({slug: templateInst.data.gameSlug});
        Meteor.call("saveGamePledge", game, updateDoc.$set);

        this.done();
        return false;
      }
    }
  });

  function init(templateInst, reactiveData, gameUserSelfGoal, numDays) {
    if(!templateInst.inited) {
      reactiveData.numDays =numDays;
      if(gameUserSelfGoal) {
        reactiveData.selfGoal =gameUserSelfGoal;
        reactiveData.selfGoalPerDay =Math.round( reactiveData.selfGoal / reactiveData.numDays );
      }
      templateInst.reactiveData.set(reactiveData);
      templateInst.inited =true;
    }
  }

  function syncSelfGoals(templateInst, selfGoal, selfGoalPerDay) {
    if(selfGoal && selfGoal >0) {
      var reactiveData =templateInst.reactiveData.get();
      reactiveData.selfGoal =selfGoal;
      reactiveData.selfGoalPerDay =Math.round( selfGoal / reactiveData.numDays );
      templateInst.reactiveData.set(reactiveData);
    }
    else if(selfGoalPerDay) {
      var reactiveData =templateInst.reactiveData.get();
      reactiveData.selfGoalPerDay =selfGoalPerDay;
      reactiveData.selfGoal =Math.round( selfGoalPerDay * reactiveData.numDays );
      templateInst.reactiveData.set(reactiveData);
      ggDom.setInputVal(reactiveData.selfGoal, 'game-pledge-input-self-goal');
    }
  }

  Template.gamePledge.created =function() {
    Meteor.subscribe('game', Template.instance().data.gameSlug);
    this.reactiveData = new ReactiveVar({
      selfGoal: 0,
      selfGoalPerDay: 0,
      numDays: 0
    });
    this.inited =false;
  };

  Template.gamePledge.helpers({
    data: function() {
      var game =this.game;
      var gameRule =this.gameRule;
      var gameUser =this.gameUser;
      var userGame =this.userGame;
      var user =this.user;
      if(!game || !gameRule || !gameRule.challenges || !gameUser || !userGame || !user) {
        return {
          _xNotFound: true,
          _xHref: ggUrls.myGames()
        };
      }

      var shortRootUrl =Config.appInfo().shortRootUrl;
      var gameLeft =ggGame.getGameTimeLeft(game, gameRule, null);
      var reactiveData =Template.instance().reactiveData.get();
      var userTotalActions =ggGame.getUserGameTotalActions(userGame);

      // Note this will NOT exactly match the per day amount on the game page
      // because we are taking into account how many have been done thus far
      // and how many days are left. So a pledge of 10 over 5 days will ALWAYS
      // show "2 per day" on the game page but if it is already day 4, it will
      // show "5 per day" here since there's only 2 days left to do it in.
      // Additionally, we do not know if they will be starting today or
      // tomorrow. So it's really just an estimate.
      // Add one to the days left to assume they start today. This should thus
      // very closely match the game page per day amount.
      var daysLeft =( gameLeft.amount > 0 ? ( gameLeft.amount +1 ) : 1 );
      var perDay =Math.round( ( reactiveData.selfGoal - userTotalActions ) /
       daysLeft);

      var numDays =( !userTotalActions ) ? daysLeft : gameRule.challenges.length;
      var userStartToday = ( numDays !== gameRule.challenges.length ) ? true : false;
      // have to initialize to the existing self goal, if set
      init(Template.instance(), reactiveData, gameUser.selfGoal, numDays);

      var ret ={
        gameRule: gameRule,
        inputOpts: {
          selfGoalLabel: "",
          // selfGoalHelp: ( ( (gameLeft.amount) ===1) ? "There is 1 day"
          //  : ( "There are " + (gameLeft.amount) + " days" ) ) + " left. So (for example) 5 per day would be " + ( (gameLeft.amount) * 5 ) + " total.",
          // selfGoalHelp: "That's " + ( ( perDay >=0 ) ? perDay : 0 ) + " per day."
        },
        formData: {
          selfGoal: gameUser.selfGoal
        },
        selfGoal: reactiveData.selfGoal,
        selfGoalPerDay: reactiveData.selfGoalPerDay
      };

      var gameState =ggGame.getGameState(game, gameRule);
      var gameStarts =gameState.starts;
      var gameEnds =gameState.ends;
      ret.inputOpts.selfGoalLabel ="How many " + gameRule.mainAction + " will you pledge for "
       + ( userStartToday ? "today" : msUser.toUserTime(Meteor.user(), gameStarts, null, "ddd MM/DD") )
       + ( ( numDays ==1 ) ? "" : ( " to " + msUser.toUserTime(Meteor.user(), gameEnds, null, "ddd MM/DD") ) )
       + "?" +
       ( ( userTotalActions ) ? (" You've already done " + userTotalActions + "." ) : "" );

      return ret;
    }
  });

  Template.gamePledge.events({
    'keyup .game-pledge-input-self-goal, blur .game-pledge-input-self-goal': function(evt, template) {
      var selfGoal =AutoForm.getFieldValue('selfGoal', 'gamePledgeForm');
      syncSelfGoals(template, selfGoal, null);
    },
    'keyup .game-pledge-input-self-goal-per-day, blur .game-pledge-input-self-goal-per-day': function(evt, template) {
      var selfGoalPerDay =ggDom.getInputVal('game-pledge-input-self-goal-per-day');
      syncSelfGoals(template, null, selfGoalPerDay);
    }
  });
}