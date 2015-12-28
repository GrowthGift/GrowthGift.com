if(Meteor.isClient) {

  Template.gameInviteBuddy.created =function() {
    Meteor.subscribe('game', Template.instance().data.gameSlug);
    this.reactiveData = new ReactiveVar({
      buddyTipVisible: false
    });
  };

  Template.gameInviteBuddy.helpers({
    data: function() {
      var gameSlug =this.gameSlug;
      var gameUser =this.gameUser;
      if(!gameSlug || !gameUser) {
        return {
          _xNotFound: true,
          _xHref: ggUrls.myGames()
        };
      }

      var shortRootUrl =Config.appInfo().shortRootUrl;
      var reactiveData =Template.instance().reactiveData.get();

      return {
        gameUser: gameUser,
        shareLinks: {
          buddy: shortRootUrl+ggUrls.game(gameSlug, { buddyRequestKey: gameUser.buddyRequestKey })
        },
        inputOpts: {
          buddyTipVisible: reactiveData.buddyTipVisible
        },
        hrefNext: ggUrls.gameInviteReach(this.gameSlug)
      };
    }
  });

  Template.gameInviteBuddy.events({
    'click .game-invite-buddy-input-share-link': function(evt, template) {
      ggDom.inputSelectAll('game-invite-buddy-input-share-link');
    },
    'click .game-invite-buddy-tip-btn': function(evt, template) {
      var reactiveData =template.reactiveData.get();
      reactiveData.buddyTipVisible =!reactiveData.buddyTipVisible;
      template.reactiveData.set(reactiveData);
    }
  });
}