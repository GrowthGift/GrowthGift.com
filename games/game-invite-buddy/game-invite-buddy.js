if(Meteor.isClient) {

  Template.gameInviteBuddy.created =function() {
    this.reactiveData = new ReactiveVar({
      buddyTipVisible: false
    });
  };

  Template.gameInviteBuddy.helpers({
    data: function() {
      var gameSlug =this.gameSlug;
      var gameUser =this.gameUser;
      var gameMainAction =this.gameMainAction
      if(!gameSlug || !gameUser || !gameMainAction) {
        return {
          _xNotFound: true,
          _xHref: ggUrls.myGames()
        };
      }

      var appInfo =Config.appInfo();
      var shortRootUrl =appInfo.shortRootUrl;
      var reactiveData =Template.instance().reactiveData.get();
      var shareLinks ={
        buddy: shortRootUrl+ggUrls.game(gameSlug, { buddyRequestKey: gameUser.buddyRequestKey })
      }
      var shareContent ={
        subject: 'Be My '+  gameMainAction + ' Buddy',
        body: "I'm doing " + gameMainAction + " for 5 minutes a day this week. It's a simple partnered habits game and I chose you to be my one and only buddy!\nClick below to join me!"
      };

      return {
        gameUser: gameUser,
        shareLinks: shareLinks,
        inputOpts: {
          buddyTipVisible: reactiveData.buddyTipVisible
        },
        hrefNext: ggUrls.gameInviteReach(this.gameSlug),
        optsSocialShare: {
          email: true,
          facebookMessage: true,
          gmail: true,
          googlePlus: true,
          sms: true,
          url: true,
          shareData: {
            url: shareLinks.buddy,
            facebookAppId: appInfo.facebook.appId,
            subject: shareContent.subject,
            body: shareContent.body,
            redirectUrl: shareLinks.buddy + '&fbRedirect=1'
          }
        },
        exampleMessage: shareContent.body + "\n" + shareLinks.buddy
      };
    }
  });

  Template.gameInviteBuddy.events({
    'click .game-invite-buddy-input-example-message': function(evt, template) {
      ggDom.inputSelectAll('game-invite-buddy-input-example-message');
    },
    'click .game-invite-buddy-tip-btn': function(evt, template) {
      var reactiveData =template.reactiveData.get();
      reactiveData.buddyTipVisible =!reactiveData.buddyTipVisible;
      template.reactiveData.set(reactiveData);
    }
  });
}