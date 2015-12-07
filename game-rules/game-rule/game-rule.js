if(Meteor.isClient) {
  Template.gameRule.created =function() {
    Meteor.subscribe('gameRule-gameRuleSlug', Template.instance().data.gameRuleSlug);
  };

  Template.gameRule.helpers({
    data: function() {
      if(!this.gameRuleSlug) {
        Router.go('myGames');
        return {};
      }
      var gameRule =GameRulesCollection.findOne({slug: this.gameRuleSlug});
      if(!gameRule) {
        return {
          _xNotFound: true,
          _xHref: ggUrls.myGames()
        };
      }
      var ret ={
        gameRule: gameRule,
        privileges: {
          edit: ggMay.editGameRule(gameRule, Meteor.userId()),
          editHref: ggUrls.saveGameRule(gameRule.slug)
        }
      };
      ret.gameRule.xDisplay ={
        type: _.capitalize(gameRule.type),
        mainAction: _.capitalize(gameRule.mainAction)
      };

      var hrefPart =(this.gameSelect && this.gameSelect !==ggConstants.gameSelectNew &&
       '?slug='+this.gameSelect+'&gameRule='+gameRule.slug) || '?gameRule='+gameRule.slug;
      ret.gameSelectData ={
        href: '/save-game'+hrefPart,
        text: (this.gameSelect && 'Use this game') || 'Create game from this'
      };

      return ret;
    }
  });
}