if(Meteor.isServer) {
  Meteor.publish('current-game', function(gameSlug) {
    return GamesCollection.find({slug: gameSlug});
  });
  Meteor.publish('gameRule', function(gameSlug) {
    if(gameSlug) {
      var game =GamesCollection.findOne({slug: gameSlug});
      return GameRulesCollection.find({_id: game.gameRuleId});
    }
    else {
      this.ready();
      return false;
    }
  });
}

if(Meteor.isClient) {
  Template.game.helpers({
    game: function() {
      var game =(this.gameSlug && GamesCollection.findOne({slug: this.gameSlug}))
       || null;
      if(!game) {
        if(this.gameSlug) {
          nrAlert.alert("No game rule with slug "+this.gameSlug);
        }
        Router.go('myGames');
        return {};
      }
      var gameRule =GameRulesCollection.findOne({_id: game.gameRuleId});
      game.xHref ={
        gameRule: '/gr/'+gameRule.slug,
        gameRuleText: gameRule.slug
      };
      game.xDisplay ={
        start: moment(game.start, ggConstants.dateTimeFormat).format(ggConstants.dateTimeDisplay)
      };
      return game;
    },
    privileges: function() {
      if(!this.gameSlug) {
        return {};
      }
      var game =GamesCollection.findOne({slug: this.gameSlug});
      var edit =(game && ggMay.editGame(game, Meteor.userId())) ? true : false;
      return {
        edit: edit,
        editLink: (edit && '/save-game?'+game.slug),
        join: (game && ggMay.joinGame(game, Meteor.userId())) ? true : false
      };
    }
  });
}