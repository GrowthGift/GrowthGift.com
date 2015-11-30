Meteor.methods({
  saveGameChallenge: function(game, challenge) {
    ggGame.saveUserGameChallenge(game, Meteor.userId(), challenge);
  }
});

if(Meteor.isServer) {
  Meteor.publish('current-game', function(gameSlug) {
    return GamesCollection.find({slug: gameSlug});
  });
  Meteor.publish('userGame', function(gameSlug) {
    if(gameSlug && this.userId) {
      var game =GamesCollection.findOne({slug: gameSlug});
      return UserGamesCollection.find({ gameId:game._id, userId:this.userId });
    }
    else {
      this.ready();
      return false;
    }
  });
  Meteor.publish('current-game-rule-game-slug', function(gameSlug) {
    if(gameSlug) {
      var game =GamesCollection.findOne({slug: gameSlug});
      return GameRulesCollection.find({ _id:game.gameRuleId });
    }
    else {
      this.ready();
      return false;
    }
  });
}

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

  Template.gameChallenge.helpers({
    challenges: function() {
      if(!this.gameSlug) {
        nrAlert.alert("No game with slug "+this.gameSlug);
        Router.go('myGames');
        return {};
      }
      var game =GamesCollection.findOne({slug: this.gameSlug});
      if(!ggMay.viewUserGameChallenge(game, Meteor.userId()) ) {
        nrAlert.alert("You are not in this game. Join the game first");
        Router.go('/g/'+this.gameSlug);
        return {};
      }
      return ggGame.getUserGameChallenges(game._id, Meteor.userId());
    },
    privileges: function() {
      var ret ={
        addChallenge: false,
        addChallengeMessage: 'You may not add a challenge completion at this time.'
      };
      if(!this.gameSlug || !Meteor.userId()) {
        return ret;
      }
      var game =GamesCollection.findOne({slug: this.gameSlug});
      var userGame =UserGamesCollection.findOne({ gameId:game._id, userId:Meteor.userId() });
      var gameRule =GameRulesCollection.findOne({ _id:game.gameRuleId });
      if(ggMay.addUserGameChallenge(game, Meteor.userId(), userGame, gameRule)) {
        ret.addChallenge =true;
        return ret;
      }
      // Output why not
      else {
        var curChallenge =ggGame.getCurrentChallenge(game, gameRule);
        if(!curChallenge.gameStarted) {
          ret.addChallengeMessage ='Game has not started yet.';
        }
        else if(curChallenge.gameEnded || !curChallenge.nextChallengeStart) {
          ret.addChallengeMessage ='Game has ended.';
        }
        else {
          ret.addChallengeMessage ='Next challenge starts '
           + moment(curChallenge.nextChallengeStart, ggConstants.dateTimeFormat).fromNow()
           + '.';
        }
      }
      return ret;
    }
  });
}