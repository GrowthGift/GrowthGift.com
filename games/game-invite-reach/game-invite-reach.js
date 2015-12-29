if(Meteor.isClient) {

  Template.gameInviteReach.helpers({
    data: function() {
      var gameSlug =this.gameSlug;
      var game =this.game;
      var gameMainAction =this.gameMainAction;
      var user =this.user;
      if(!gameSlug || !gameMainAction || !user || !this.game) {
        return {
          _xNotFound: true,
          _xHref: ggUrls.myGames()
        };
      }

      var appInfo =Config.appInfo();
      var shortRootUrl =appInfo.shortRootUrl;
      var shareLinks ={
        reach: shortRootUrl+ggUrls.game(gameSlug, { username: user.username })
      };
      var shareContent ={
        subject: 'Join My '+  gameMainAction + ' Team',
        body: "I'm doing " + gameMainAction + " for 5 minutes a day this week. It's a simple team habits game to make the biggest positive difference.\nClick below to join our team!",
        defaultShareText: 'Join our 5 minutes a day '+  gameMainAction + ' team'
      };
      var image =ggGame.getImage(game);
      image = ( image.indexOf('://') > -1 ) ? image : ( shortRootUrl + image );

      return {
        shareLinks: shareLinks,
        hrefNext: ggUrls.game(this.gameSlug),
        optsSocialShare: {
          email: true,
          facebook: true,
          linkedIn: true,
          pinterest: true,
          twitter: true,
          url: true,
          shareData: {
            url: shareLinks.reach,
            image: image,
            facebookAppId: appInfo.facebook.appId,
            subject: shareContent.subject,
            body: shareContent.body,
            description: shareContent.body,
            defaultShareText: shareContent.defaultShareText,
            redirectUrl: shareLinks.reach + '&fbRedirect=1'
          }
        },
        exampleMessage: shareContent.body + "\n" + shareLinks.reach
      };
    }
  });

  Template.gameInviteReach.events({
    'click .game-invite-reach-input-share-link': function(evt, template) {
      ggDom.inputSelectAll('game-invite-reach-input-share-link');
    }
  });
}