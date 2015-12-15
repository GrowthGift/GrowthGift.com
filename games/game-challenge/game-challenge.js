Meteor.methods({
  saveGameChallengeNew: function(game, challenge) {
    ggGame.saveUserGameChallengeNew(game, Meteor.userId(), challenge, function(err, result) { });
  },
  saveGameChallenge: function(doc, docId) {
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
            modifier.$set["challenges."+index+".updatedAt"] =ggConstants.curDateTime();
          }
        });
      }
      // overwrite with proper one
      doc =modifier;
    }
    ggGame.saveUserGameChallenge(doc, docId, function(err, result) {
      if(!err && Meteor.isClient) {
        var templateInst =ggTemplate.getMainTemplate("Template.gameChallenge");
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
    gameChallengeForm: {
      onSubmit: function(insertDoc, updateDoc, currentDoc) {
        var self =this;
        //without this, the Meteor.call line submits the form..
        this.event.preventDefault();
        this.event.stopPropagation();

        var templateInst =ggTemplate.getMainTemplate("Template.gameChallenge");
        var game =GamesCollection.findOne({slug: templateInst.data.gameSlug});
        Meteor.call("saveGameChallengeNew", game, insertDoc);

        this.done();
        return false;
      }
    }
  });

  Template.gameChallenge.created =function() {
    Meteor.subscribe('game', Template.instance().data.gameSlug);
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
          actionCountLabel: "Number of " + gameRule.mainAction + ":"
        }
      };
      ret.hasChallenges =ret.challenges.length ? true : false;

      var curChallenge =ggGame.getCurrentChallenge(game, gameRule, null);
      var gameCurrentChallenge =curChallenge.currentChallenge;
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
           + moment(curChallenge.nextChallenge.start, ggConstants.dateTimeFormat).fromNow()
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
        userGame: userGame,
        gameRule: gameRule,
        inputOpts: {
          actionCountLabel: "Number of " + gameRule.mainAction + ":"
        }
      };
    }
  });
}