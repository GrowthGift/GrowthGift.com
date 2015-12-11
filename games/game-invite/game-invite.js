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

  Template.gameInvite.created =function() {
    Meteor.subscribe('game', Template.instance().data.gameSlug);
    this.reactiveData = new ReactiveVar({
      selfGoal: 0,
      buddyTipVisible: false
    });
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
      if(!game || !gameRule || !gameUser) {
        return {
          _xNotFound: true,
          _xHref: ggUrls.myGames()
        };
      }

      var shortRootUrl =Config.appInfo().shortRootUrl;
      var gameLeft =ggGame.getGameTimeLeft(game, gameRule);
      var reactiveData =Template.instance().reactiveData.get();

      return {
        game: game,
        gameRule: gameRule,
        gameUser: gameUser,
        gameEnded: (gameLeft.amount <0) ? true : false,
        gameLink: ggUrls.game(this.gameSlug),
        shareLinks: {
          buddy: shortRootUrl+ggUrls.game(game.slug, { buddyRequestKey: gameUser.buddyRequestKey }),
          reach: shortRootUrl+ggUrls.game(game.slug)
        },
        inputOpts: {
          selfGoalLabel: "How many " + gameRule.mainAction + " will you pledge?",
          // selfGoalHelp: ( ( (gameLeft.amount) ===1) ? "There is 1 day"
          //  : ( "There are " + (gameLeft.amount) + " days" ) ) + " left. So (for example) 5 per day would be " + ( (gameLeft.amount) * 5 ) + " total.",
          selfGoalHelp: "That is a goal of " + Math.ceil( ( (reactiveData.selfGoal
           || !gameUser.selfGoal) ? reactiveData.selfGoal : gameUser.selfGoal ) /
           ( gameLeft.amount > 0 ? gameLeft.amount : 1 ) ) + " per day.",
          buddyTipVisible: reactiveData.buddyTipVisible
        },
        formData: {
          selfGoal: gameUser.selfGoal
        },
        selfGoal: reactiveData.selfGoal
      };
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
      var reactiveData =template.reactiveData.get();
      reactiveData.selfGoal =( selfGoal ===undefined || selfGoal <=0 ) ?
       null : selfGoal;
      template.reactiveData.set(reactiveData);
    },
    'click .game-invite-buddy-tip-btn': function(evt, template) {
      var reactiveData =template.reactiveData.get();
      reactiveData.buddyTipVisible =!reactiveData.buddyTipVisible;
      template.reactiveData.set(reactiveData);
    }
  });
}