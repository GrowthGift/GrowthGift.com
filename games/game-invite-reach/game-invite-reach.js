if(Meteor.isClient) {

  Template.gameInviteReach.helpers({
    data: function() {
      var user =this.user;
      if(!this.gameSlug || !user) {
        return {
          _xNotFound: true,
          _xHref: ggUrls.myGames()
        };
      }

      var gameSlug =this.gameSlug;
      var shortRootUrl =Config.appInfo().shortRootUrl;
      return {
        shareLinks: {
          reach: shortRootUrl+ggUrls.game(gameSlug, { username: user.username })
        },
        hrefNext: ggUrls.game(this.gameSlug)
      };
    }
  });

  Template.gameInviteReach.events({
    'click .game-invite-reach-input-share-link': function(evt, template) {
      ggDom.inputSelectAll('game-invite-reach-input-share-link');
    }
  });
}