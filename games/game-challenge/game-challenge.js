Meteor.methods({
  saveGameChallenge: function(game, challenge) {
    ggGame.saveUserGameChallenge(game, Meteor.userId(), challenge);
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
        Meteor.call("saveGameChallenge", game, insertDoc);

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
      var game =GamesCollection.findOne({slug: this.gameSlug});
      var userGame =(game && UserGamesCollection.findOne({ gameId:game._id, userId:Meteor.userId() }) ) || null;
      var gameRule =(game && GameRulesCollection.findOne({ _id:game.gameRuleId }) ) || null;
      if(!game || !userGame || !gameRule) {
        return {
          _xNotFound: true,
          _xHref: ggUrls.myGames()
        };
      }
      if(!ggMay.viewUserGameChallenge(game, Meteor.userId()) ) {
        nrAlert.alert("You are not in this game. Join the game first");
        Router.go('/g/'+this.gameSlug);
        return false;
      }

      var ret ={
        challenges: ggGame.getUserGameChallenges(game._id, Meteor.userId()),
        gameLink: ggUrls.game(this.gameSlug),
        game: game,
        gameRule: {
          mainAction: gameRule.mainAction
        },
        privileges: {
          addChallenge: false,
          addChallengeMessage: 'You may not add a challenge completion at this time.'
        },
        inputOpts: {
          actionCountLabel: "Number of " + gameRule.mainAction + ":"
        }
      };

      if(ggMay.addUserGameChallenge(game, Meteor.userId(), userGame, gameRule)) {
        ret.privileges.addChallenge =true;
      }
      // Output why not
      else {
        var curChallenge =ggGame.getCurrentChallenge(game, gameRule);
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
}