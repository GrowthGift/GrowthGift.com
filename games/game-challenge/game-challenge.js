GameChallengeNewSchema = new SimpleSchema({
  id: {
    type: String,
    optional: true    // required but set manually..
  },
  actionCount: {
    type: Number,
    min: 1
  },
  description: {
    type: String,
    optional: true
  },
  privacy: {
    type: String
  },
  media: {
    type: Object,
    optional: true
  },
  "media.userId": {
    type: String,
    optional: true
  },
  "media.type": {
    type: String,
    optional: true
  },
  "media.video": {
    type: String,
    optional: true
  },
  "media.image": {
    type: String,
    optional: true
  },
  "media.message": {
    type: String,
    optional: true
  },
  "media.privacy": {
    type: String,
    optional: true
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
  inspiration: {
    type: Object,
    optional: true
  },
  "inspiration.userId": {
    type: String,
    optional: true
  },
  "inspiration.type": {
    type: String,
    optional: true
  },
  "inspiration.video": {
    type: String,
    optional: true,
    custom: ggValidate.schemaHttpsUrl
  },
  "inspiration.image": {
    type: String,
    optional: true,
    custom: ggValidate.schemaHttpsImageExtension
  },
  "inspiration.quote": {
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
        if(game.slug) {
          var url = onLastChallenge ? ggUrls.gameUserSummary(game.slug) :
           ggUrls.game(game.slug);
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
    gameChallengeNewForm: {
      onSubmit: function(insertDoc, updateDoc, currentDoc) {
        var self =this;
        //without this, the Meteor.call line submits the form..
        this.event.preventDefault();
        this.event.stopPropagation();

        var templateInst =msTemplate.getMainTemplate("Template.gameChallenge");
        var gameSlug =templateInst.data.gameSlug;
        var game =GamesCollection.findOne({slug: gameSlug});

        // If have media, save to s3 and mutate to database schema format.
        // This is a CLIENT only call so must be done here.
        if(insertDoc.media) {
          ggGame.uploadMedia(insertDoc, function(err, challenge) {
            Meteor.call("saveGameChallengeNew", game, challenge);
          });
        }
        else {
          Meteor.call("saveGameChallengeNew", game, insertDoc);
        }

        this.done();
        return false;
      }
    }
  });

  Template.gameChallenge.created =function() {
    Meteor.subscribe('game', Template.instance().data.gameSlug);
    Template.instance().feedbackPrompt =null;
    this.reactiveData = new ReactiveVar({
      inspirationVideoVisible: false,
      inspirationImageVisible: false,
      inspirationQuoteVisible: false,
      inspirationContent: null,
      mediaVideoVisible: false,
      mediaImageVisible: false,
      mediaVideo: null,
      mediaImage: null,
      mediaImageActive: false,
      mediaVideoActive: false,
      mediaContent: null
    });
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
      // Get both self and buddy user games
      var gameUser =(game && userId ) ? ggGame.getGameUser(game, userId, {}) : null;
      var buddyUserId = ( gameUser && gameUser.buddyId ) ? gameUser.buddyId : null;
      var userIds =[userId];
      if(buddyUserId) {
        userIds.push(buddyUserId);
      }
      var userGames =(game && UserGamesCollection.find({ gameId:game._id,
       userId: { $in: userIds } }).fetch() ) || null;
      var gameRule =(game && GameRulesCollection.findOne({ _id:game.gameRuleId }) ) || null;
      if(!game || !userGames || !gameRule) {
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

      var userGame =userGames[_.findIndex(userGames, 'userId', userId)];
      var userGameBuddy = (buddyUserId) ?
       userGames[_.findIndex(userGames, 'userId', buddyUserId)] : null;
      var curChallenge =ggGame.getCurrentChallenge(game, gameRule, null);
      var gameCurrentChallenge =curChallenge.currentChallenge;
      var reactiveData =Template.instance().reactiveData.get();
      var onLastChallengeVal = ( curChallenge.possibleCompletions ===
       gameRule.challenges.length ) ? 1 : 0;

      var challenges =ggGame.getUserGameChallenges(game._id, userId);
      var templateInst =Template.instance();

      var ret ={
        challenges: challenges,
        gameLink: ggUrls.game(this.gameSlug),
        links: {
          gameUsers: ggUrls.gameUsers(this.gameSlug)
        },
        game: game,
        gameRule: {
          mainAction: gameRule.mainAction,
          _xDisplay: {
            mainAction: _.capitalize(gameRule.mainAction)
          }
        },
        userGame: userGame,
        userId: userId,
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
          inspiration: {
            // Do not show on last challenge since already have feedback
            // to fill out.
            visible: !onLastChallengeVal &&
             ggGame.promptForNewInspiration(game, userId, null),
            typeOpts: [
              { value: 'video', label: 'Video' },
              { value: 'image', label: 'Image' },
              { value: 'quote', label: 'Quote' }
            ],
            videoVisible: reactiveData.inspirationVideoVisible,
            imageVisible: reactiveData.inspirationImageVisible,
            quoteVisible: reactiveData.inspirationQuoteVisible,
            content: reactiveData.inspirationContent
          },
          media: {
            // Only show if have buddy
            visible: gameUser.buddyId ? true : false,
            typeOpts: [
              { value: 'video', label: 'Video' },
              { value: 'image', label: 'Image' }
            ],
            videoVisible: reactiveData.mediaVideoVisible,
            imageVisible: reactiveData.mediaImageVisible,
            content: reactiveData.mediaContent,
            image: reactiveData.mediaImage,
            video: reactiveData.mediaVideo,
            videoOpts: {
              // maxTime: 15,
              classes: {
                recordBtn: 'btn-link inline-block margin-t',
                stopBtn: 'btn-link inline-block margin-l margin-t'
              },
              onVideoRecorded: function(err, base64Data) {
                var reactiveData =templateInst.reactiveData.get();
                reactiveData.mediaContent =base64Data;
                reactiveData.mediaVideo =base64Data;
                reactiveData.mediaVideoActive =false;
                templateInst.reactiveData.set(reactiveData);
              }
            },
            privacyOpts: [
              { value: 'buddy', label: 'Just My Buddy' },
              { value: 'public', label: 'Anyone' }
            ],
          },
          onLastChallengeVal: onLastChallengeVal
        },
        hiEmail: 'hi@growthgift.com'    // TODO - pull from config
      };
      ret.hasChallenges =ret.challenges.length ? true : false;

      // temporary: filter out ios until apple approves app update.
      if(Meteor.isCordova && navigator.userAgent.match(/(iPad|iPhone|iPod)/g)) {
        ret.inputOpts.media.typeOpts =[
          // { value: 'video', label: 'Video' },
          { value: 'image', label: 'Image' }
        ];
      }

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
          ret.privileges.addChallengeMessage ='Challenge has not started yet.';
        }
        else if(curChallenge.gameEnded) {
          ret.privileges.addChallengeMessage ='Challenge has ended.';
        }
        else if(!curChallenge.nextChallenge) {
          ret.privileges.addChallengeMessage ='You have already added your last challenge completion for this challenge.';
        }
        else {
          ret.privileges.addChallengeMessage ='Next challenge starts '
           + msUser.toUserTime(Meteor.user(), curChallenge.nextChallenge.start, null, 'fromNow')
           + '.';
        }
      }

      var helperData ={
        gameMainAction: gameRule.mainAction,
        gameUser: gameUser,
        gameSlug: game.slug
      };
      // Set on template instance so it is accessible.
      Template.instance().data.helperData =helperData;

      return ret;
    }
  });

  Template.gameChallenge.events({
    'change .game-challenge-inspiration-type-input, blur .game-challenge-inspiration-type-input': function(evt, template) {
      var typeVal =evt.target.value;
      var reactiveData =template.reactiveData.get();
      reactiveData.inspirationVideoVisible = ( typeVal ==='video' ) ? true : false;
      reactiveData.inspirationImageVisible = ( typeVal ==='image' ) ? true : false;
      reactiveData.inspirationQuoteVisible = ( typeVal ==='quote' ) ? true : false;
      template.reactiveData.set(reactiveData);
    },
    'change .game-challenge-inspiration-video-input, blur .game-challenge-inspiration-video-input': function(evt, template) {
      var val =evt.target.value;
      var reactiveData =template.reactiveData.get();
      if(val.indexOf('youtube.com') < 0) {
        AutoForm.addStickyValidationError('gameChallengeNewForm', 'inspiration.video', 'videoYoutube', val);
        reactiveData.inspirationContent =null;
      }
      else {
        AutoForm.removeStickyValidationError('gameChallengeNewForm', 'inspiration.video');
        reactiveData.inspirationContent =ggValidate.youtubeEmbedUrl(val);
      }
      template.reactiveData.set(reactiveData);
    },
    'change .game-challenge-inspiration-image-input, blur .game-challenge-inspiration-image-input': function(evt, template) {
      var val =evt.target.value;
      var reactiveData =template.reactiveData.get();
      if(!ggValidate.httpsImageExtension(val)) {
        reactiveData.inspirationContent =val;
      }
      else {
        reactiveData.inspirationContent =null;
      }
      template.reactiveData.set(reactiveData);
    },
    'change .game-challenge-media-type-input, blur .game-challenge-media-type-input': function(evt, template) {
      var typeVal =evt.target.value;
      var reactiveData =template.reactiveData.get();
      reactiveData.mediaVideoVisible = ( typeVal ==='video' ) ? true : false;
      reactiveData.mediaImageVisible = ( typeVal ==='image' ) ? true : false;
      // Reset.
      reactiveData.mediaVideo =null;
      reactiveData.mediaImage =null;
      reactiveData.mediaContent =null;
      template.reactiveData.set(reactiveData);
    },
    'click .game-challenge-media-image-btn': function(evt, template) {
      var reactiveData =template.reactiveData.get();
      if(!reactiveData.mediaImageActive) {
        // Need to set orienation for Android:
        // https://github.com/meteor/mobile-packages/issues/21
        MeteorCamera.getPicture({ correctOrientation: true }, function(err, data) {
          var reactiveData =template.reactiveData.get();
          reactiveData.mediaContent =data;
          reactiveData.mediaImage =data;
          reactiveData.mediaImageActive =false;
          template.reactiveData.set(reactiveData);
        });
      }
    }
  });

  Template.gameChallengeCompleted.helpers({
    data: function() {
      this.challenge.xDisplay ={
        mediaImage: ( this.challenge.media && this.challenge.mediaType === 'image' )
         ? true : false,
        mediaVideo: ( this.challenge.media && this.challenge.mediaType === 'video' )
         ? true : false,
        atLeastOneMedia: ( this.challenge.media || this.challenge.mediaMessage )
         ? true : false
      };

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