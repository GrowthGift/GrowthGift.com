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
      return {
        game: game,
        gameRule: gameRule,
        gameLink: ggUrls.game(this.gameSlug),
        shareLinks: {
          buddy: shortRootUrl+ggUrls.game(game.slug, { buddyRequestKey: gameUser.buddyRequestKey }),
          reach: shortRootUrl+ggUrls.game(game.slug)
        },
        inputOpts: {
          selfGoalLabel: "Your number of " + gameRule.mainAction + " pledge:"
        },
        formData: {
          selfGoal: gameUser.selfGoal
        }
      };
    }
  });

  Template.gameInvite.events({
    'click .game-invite-buddy-input-share-link': function(evt, template) {
      ggDom.inputSelectAll('game-invite-buddy-input-share-link');
    },
    'click .game-invite-reach-input-share-link': function(evt, template) {
      ggDom.inputSelectAll('game-invite-reach-input-share-link');
    }
  });
}