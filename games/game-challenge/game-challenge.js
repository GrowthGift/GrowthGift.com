GameChallengeFeedbackSchema = new SimpleSchema({
  id: {
    type: String,
    optional: true    // required but set manually..
  },
  actionCount: {
    type: Number,
    min: 1
  },
  description: {
    type: String
  },
  privacy: {
    type: String
  },
  updatedAt: {
    type: String,
    optional: true,   // If can not auto set, need to make optional to pass validation..
    // autoValue: autoValCreatedAt    // Not working? And leading to validation error? Just set manually.
  },
  feedback: {
    type: Object,
    optional: true
  },
  "feedback.prompt": {
    type: String,
    optional: true
  },
  "feedback.answer": {
    type: String,
    optional: true
  },
  onLastChallenge: {
    type: Number,
    optional: false
  }
});

Meteor.methods({
  saveGameChallengeNew: function(game, challenge) {
    var onLastChallenge =challenge.onLastChallenge;
    ggGame.saveUserGameChallengeNew(game, Meteor.userId(), challenge, function(err, result) {
      // Need to clear cache
      var cacheKey ='game_slug_'+game.slug+'_user_id_'+Meteor.userId();
      ggGame.clearCache(cacheKey);
      if(!err && Meteor.isClient) {
        var templateInst =msTemplate.getMainTemplate("Template.gameChallenge");
        var gameSlug =templateInst.data.gameSlug;
        if(gameSlug) {
          var url = onLastChallenge ? ggUrls.gameUserSummary(gameSlug) :
           ggUrls.game(gameSlug);
          Router.go(url);
        }
      }
    });
  },
  saveGameChallenge: function(doc, docId) {
    // Need game id for saving awards.
    var gameId =doc.$set.gameId;
    delete doc.$set.gameId;
    // The $set modifier is odd for this.. it is passing the whole array and
    // overwriting rather than setting specific fields.. So have to fix
    // here manually.
    // TODO fix this..
    if(docId && doc.$set) {
      var modifier ={
        $set: {}
      };
      var field;
      if(doc.$set.challenges && doc.$set.challenges.length) {
        doc.$set.challenges.forEach(function(challenge, index) {
          if(challenge) {
            for(field in challenge) {
              modifier.$set["challenges."+index+"."+field] =challenge[field];
            }
            modifier.$set["challenges."+index+".updatedAt"] =msTimezone.curDateTime();
          }
        });
      }
      // overwrite with proper one
      doc =modifier;
    }
    ggGame.saveUserGameChallenge(doc, docId, Meteor.userId(), gameId, function(err, result) {
      // Need to clear cache
      var cacheKey ='game_slug_'+gameSlug+'_user_id_'+Meteor.userId();
      ggGame.clearCache(cacheKey);
      if(!err && Meteor.isClient) {
        var templateInst =msTemplate.getMainTemplate("Template.gameChallenge");
        var gameSlug =templateInst.data.gameSlug;
        if(gameSlug) {
          Router.go(ggUrls.game(gameSlug));
        }
      }
    });
  }
});

if(Meteor.isClient) {
  AutoForm.hooks({
    gameChallengeFeedbackForm: {
      onSubmit: function(insertDoc, updateDoc, currentDoc) {
        var self =this;
        //without this, the Meteor.call line submits the form..
        this.event.preventDefault();
        this.event.stopPropagation();

        var templateInst =msTemplate.getMainTemplate("Template.gameChallenge");
        var game =GamesCollection.findOne({slug: templateInst.data.gameSlug});
        Meteor.call("saveGameChallengeNew", game, insertDoc);

        this.done();
        return false;
      }
    }
  });

  Template.gameChallenge.created =function() {
    Meteor.subscribe('game', Template.instance().data.gameSlug);
    Template.instance().feedbackPrompt =null;
  };

  Template.gameChallenge.helpers({
    data: function() {
      if(!Meteor.user()) {
        Router.go('myGames');
        return false;
      }
      if(!this.gameSlug) {
        return {
          _xNotFound: true,
          _xHref: ggUrls.myGames()
        };
      }
      var userId =Meteor.userId();
      var game =GamesCollection.findOne({slug: this.gameSlug});
      var userGame =(game && UserGamesCollection.findOne({ gameId:game._id, userId:userId }) ) || null;
      var gameRule =(game && GameRulesCollection.findOne({ _id:game.gameRuleId }) ) || null;
      if(!game || !userGame || !gameRule) {
        return {
          _xNotFound: true,
          _xHref: ggUrls.myGames()
        };
      }
      if(!ggMay.viewUserGameChallenge(game, userId) ) {
        nrAlert.alert("You are not in this game. Join the game first");
        Router.go('/g/'+this.gameSlug);
        return false;
      }

      var gameUser =ggGame.getGameUser(game, userId, {});
      var curChallenge =ggGame.getCurrentChallenge(game, gameRule, null);
      var gameCurrentChallenge =curChallenge.currentChallenge;

      var ret ={
        challenges: ggGame.getUserGameChallenges(game._id, userId),
        gameLink: ggUrls.game(this.gameSlug),
        game: game,
        gameRule: {
          mainAction: gameRule.mainAction,
          _xDisplay: {
            mainAction: _.capitalize(gameRule.mainAction)
          }
        },
        userGame: userGame,
        privileges: {
          addChallenge: false,
          addChallengeMessage: 'You may not add a challenge completion at this time.'
        },
        inputOpts: {
          actionCountLabel: "Number of " + gameRule.mainAction + ":",
          feedback: {
            visible: ( curChallenge.possibleCompletions === gameRule.challenges.length ) ? true : false,
            prompt: "",
            help: ""
          },
          onLastChallengeVal: ( curChallenge.possibleCompletions === gameRule.challenges.length ) ? 1 : 0
        },
        hiEmail: 'hi@growthgift.com'    // TODO - pull from config
      };
      ret.hasChallenges =ret.challenges.length ? true : false;

      // Important to only set this ONCE since it returns a DIFFERENT prompt
      // each time and this template helper runs more than once! Without this,
      // the prompt displayed was often DIFFERENT than the prompt saved!
      if(ret.inputOpts.feedback.visible) {
        if(!Template.instance().feedbackPrompt) {
          var feedbackItem =ggFeedback.getRandomGamePrompt(gameUser.buddyId);
          ret.inputOpts.feedback.prompt =feedbackItem.q;
          ret.inputOpts.feedback.help =feedbackItem.help || "";
          // Placeholder is not being set without a timeout..
          setTimeout(function() {
            ggDom.setInputPlaceholder(ret.inputOpts.feedback.help, 'game-challenge-feedback-answer-input');
          }, 250);
          Template.instance().feedbackPrompt =ret.inputOpts.feedback.prompt;
        }
        else {
          ret.inputOpts.feedback.prompt =Template.instance().feedbackPrompt;
        }
      }

      ret.challenges =_.sortByOrder(ret.challenges.map(function(challenge, index) {
        return _.extend({}, challenge, {
          xDisplay: {
            updatedAt: msUser.toUserTime(Meteor.user(), challenge.updatedAt, null, 'fromNow')
          },
          // VERY IMPORTANT to preserve the database index for updates since we are sorting
          // TODO - should update by id instead so order does not matter
          _xIndex: index
        });
      }), ['updatedAt'], ['desc']);

      if(ret.hasChallenges) {
        // Check challenge edit privileges
        ret.challenges.forEach(function(challenge, index) {
          ret.challenges[index]._xPrivileges ={
            edit: ggMay.editUserGameChallenge(gameCurrentChallenge, challenge)
          };
          ret.challenges[index]._xFormData ={
            id: "GameChallengeEditForm"+(Math.random() + 1).toString(36).substring(7),
            fieldNames: {
              actionCount: "challenges."+challenge._xIndex+".actionCount",
              description: "challenges."+challenge._xIndex+".description",
              privacy: "challenges."+challenge._xIndex+".privacy"
            }
          };
        });
      }

      var userChallenge =ggGame.getCurrentUserChallenge(game._id, userId, userGame);
      if(ggMay.addUserGameChallenge(game, userId, curChallenge, userChallenge)) {
        ret.privileges.addChallenge =true;
      }
      // Output why not
      else {
        if(!curChallenge.gameStarted) {
          ret.privileges.addChallengeMessage ='Game has not started yet.';
        }
        else if(curChallenge.gameEnded) {
          ret.privileges.addChallengeMessage ='Game has ended.';
        }
        else if(!curChallenge.nextChallenge) {
          ret.privileges.addChallengeMessage ='You have already added your last challenge completion for this game.';
        }
        else {
          ret.privileges.addChallengeMessage ='Next challenge starts '
           + msUser.toUserTime(Meteor.user(), curChallenge.nextChallenge.start, null, 'fromNow')
           + '.';
        }
      }

      return ret;
    }
  });

  Template.gameChallengeCompleted.helpers({
    data: function() {
      // TODO - DRY this up; it's all copied from the main gameChallenge template.
      var game =(this.gameSlug && GamesCollection.findOne({slug: this.gameSlug}) ) || null;
      var userGame =(game && UserGamesCollection.findOne({ gameId:game._id, userId:Meteor.userId() }) ) || null;
      var gameRule =(game && GameRulesCollection.findOne({ _id:game.gameRuleId }) ) || null;
      return {
        gameId: game._id,
        userGame: userGame,
        gameRule: gameRule,
        inputOpts: {
          actionCountLabel: "Number of " + gameRule.mainAction + ":"
        }
      };
    }
  });
}