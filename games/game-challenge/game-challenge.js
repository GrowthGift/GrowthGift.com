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
      if(!this.gameSlug || !Meteor.user()) {
        Router.go('myGames');
        return false;
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
        challenges: [],
        gameLink: '',
        game: {},
        privileges: {
          addChallenge: false,
          addChallengeMessage: 'You may not add a challenge completion at this time.'
        }
      };
      ret.challenges =ggGame.getUserGameChallenges(game._id, Meteor.userId());

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
        else if(!curChallenge.nextChallengeStart) {
          ret.privileges.addChallengeMessage ='You have already added your last challenge completion for this game.';
        }
        else {
          ret.privileges.addChallengeMessage ='Next challenge starts '
           + moment(curChallenge.nextChallengeStart, ggConstants.dateTimeFormat).fromNow()
           + '.';
        }
      }

      ret.gameLink ='/g/'+this.gameSlug;
      ret.game =game;

      return ret;
    }
  });
}