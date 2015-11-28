if(Meteor.isServer) {
  Meteor.publish('current-game-rule', function(gameRuleSlug) {
    return GameRulesCollection.find({slug: gameRuleSlug});
  });
}

if(Meteor.isClient) {
  Template.gameRule.helpers({
    gameRule: function() {
      if(!this.gameRuleSlug) {
        Router.go('myGames');
        return {};
      }
      var gameRule =GameRulesCollection.findOne({slug: this.gameRuleSlug});
      if(!gameRule) {
        nrAlert.alert("No game rule with slug "+this.gameRuleSlug);
        Router.go('myGames');
        return {};
      }
      gameRule.xDisplay ={
        type: _.capitalize(gameRule.type)
      };
      return gameRule;
    }
  });

  Template.gameRule.events({
    
  });
}