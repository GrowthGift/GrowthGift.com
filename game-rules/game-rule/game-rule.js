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
    },
    gameSelectData: function() {
      var gameRule =(this.gameRuleSlug &&
       GameRulesCollection.findOne({slug: this.gameRuleSlug}, { fields: { slug:1 } }))
       || null;
      var hrefPart =(this.gameSelect && this.gameSelect !==ggConstants.gameSelectNew &&
       '?slug='+this.gameSelect+'&gameRule='+gameRule.slug) || '?gameRule='+gameRule.slug;
      return {
        href: '/save-game'+hrefPart,
        text: (hrefPart && 'Use this game') || 'Create game from this'
      };
    }
  });

  Template.gameRule.events({
    
  });
}