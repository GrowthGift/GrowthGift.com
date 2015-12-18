GameInviteSchema = new SimpleSchema({
  selfGoal: {
    type: Number,
    min: 1
  }
});

Meteor.methods({
  saveGameInvite: function(game, gameUserData) {
    ggGame.saveGameInvite(game, Meteor.userId(), gameUserData, function(err, result) {
      if(Meteor.isClient) {
        if(!err && result) {
          Router.go(ggUrls.game(game.slug));
        }
      }
    });
  }
});

if(Meteor.isClient) {
  AutoForm.hooks({
    gameInviteForm: {
      onSubmit: function(insertDoc, updateDoc, currentDoc) {
        var self =this;
        //without this, the Meteor.call line submits the form..
        this.event.preventDefault();
        this.event.stopPropagation();

        var templateInst =ggTemplate.getMainTemplate("Template.gameInvite");
        var game =GamesCollection.findOne({slug: templateInst.data.gameSlug});
        Meteor.call("saveGameInvite", game, updateDoc.$set);

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
      ggDom.setInputVal(reactiveData.selfGoal, 'game-invite-input-self-goal');
    }
  }

  Template.gameInvite.created =function() {
    Meteor.subscribe('game', Template.instance().data.gameSlug);
    this.reactiveData = new ReactiveVar({
      selfGoal: 0,
      selfGoalPerDay: 0,
      numDays: 0,
      buddyTipVisible: false
    });
    this.inited =false;
  };

  Template.gameInvite.helpers({
    data: function() {
      if(!this.gameSlug) {
        Router.go('myGames');
        return false;
      }
      var game =GamesCollection.findOne({slug: this.gameSlug});
      var gameRule =(game && GameRulesCollection.findOne({ _id:game.gameRuleId }) )
       || null;
      var gameUser =ggGame.getGameUser(game, Meteor.userId());
      var userGame =(game && ggGame.getUserGame(game._id, Meteor.userId()) ) || null;
      var user =Meteor.users.findOne({ _id: Meteor.userId() }, { fields: { username: 1} });
      if(!game || !gameRule || !gameRule.challenges || !gameUser || !userGame || !user) {
        return {
          _xNotFound: true,
          _xHref: ggUrls.myGames()
        };
      }

      var shortRootUrl =Config.appInfo().shortRootUrl;
      var gameLeft =ggGame.getGameTimeLeft(game, gameRule);
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
        game: game,
        gameRule: gameRule,
        gameUser: gameUser,
        userTotalActions: userTotalActions,
        gameState: ggGame.getGameState(game, gameRule),
        gameLink: ggUrls.game(this.gameSlug),
        shareLinks: {
          buddy: shortRootUrl+ggUrls.game(game.slug, { buddyRequestKey: gameUser.buddyRequestKey }),
          reach: shortRootUrl+ggUrls.game(game.slug, { username: user.username })
        },
        inputOpts: {
          selfGoalLabel: "",
          // selfGoalHelp: ( ( (gameLeft.amount) ===1) ? "There is 1 day"
          //  : ( "There are " + (gameLeft.amount) + " days" ) ) + " left. So (for example) 5 per day would be " + ( (gameLeft.amount) * 5 ) + " total.",
          // selfGoalHelp: "That's " + ( ( perDay >=0 ) ? perDay : 0 ) + " per day.",
          buddyTipVisible: reactiveData.buddyTipVisible
        },
        formData: {
          selfGoal: gameUser.selfGoal
        },
        selfGoal: reactiveData.selfGoal,
        selfGoalPerDay: reactiveData.selfGoalPerDay
      };

      var gameStarts =ret.gameState.starts;
      var gameEnds =ret.gameState.ends;
      ret.gameState.starts =ggUser.toUserTime(Meteor.user(), ret.gameState.starts, null, msTimezone.dateTimeDisplay);
      ret.gameState.ends =ggUser.toUserTime(Meteor.user(), ret.gameState.ends, null, msTimezone.dateTimeDisplay);

      ret.inputOpts.selfGoalLabel ="How many " + gameRule.mainAction + " will you pledge for "
       + ( userStartToday ? "today" : ggUser.toUserTime(Meteor.user(), gameStarts, null, "ddd MM/DD") )
       + ( ( numDays ==1 ) ? "" : ( " to " + ggUser.toUserTime(Meteor.user(), gameEnds, null, "ddd MM/DD") ) )
       + "?" +
       ( ( ret.userTotalActions ) ? (" You've already done " + ret.userTotalActions + "." ) : "" );

      return ret;
    }
  });

  Template.gameInvite.events({
    'click .game-invite-buddy-input-share-link': function(evt, template) {
      ggDom.inputSelectAll('game-invite-buddy-input-share-link');
    },
    'click .game-invite-reach-input-share-link': function(evt, template) {
      ggDom.inputSelectAll('game-invite-reach-input-share-link');
    },
    'keyup .game-invite-input-self-goal, blur .game-invite-input-self-goal': function(evt, template) {
      var selfGoal =AutoForm.getFieldValue('selfGoal', 'gameInviteForm');
      syncSelfGoals(template, selfGoal, null);
    },
    'keyup .game-invite-input-self-goal-per-day, blur .game-invite-input-self-goal-per-day': function(evt, template) {
      var selfGoalPerDay =ggDom.getInputVal('game-invite-input-self-goal-per-day');
      syncSelfGoals(template, null, selfGoalPerDay);
    },
    'click .game-invite-buddy-tip-btn': function(evt, template) {
      var reactiveData =template.reactiveData.get();
      reactiveData.buddyTipVisible =!reactiveData.buddyTipVisible;
      template.reactiveData.set(reactiveData);
    }
  });
}