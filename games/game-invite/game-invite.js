if(Meteor.isClient) {

  Template.gameInvite.created =function() {
    Meteor.subscribe('game', Template.instance().data.gameSlug);
  };

  Template.gameInvite.helpers({
    nav: function() {
      // Have to form before called, when still have template data in `this`
      var urls ={
        pledge: ggUrls.gamePledge(this.gameSlug),
        buddy: ggUrls.gameInviteBuddy(this.gameSlug),
        reach: ggUrls.gameInviteReach(this.gameSlug)
      };
      return {
        buttons: [
          {
            icon: 'fa fa-flag',
            html: 'Pledge',
            click: function() {
              Router.go(urls.pledge);
            }
          },
          {
            icon: 'fa fa-user-plus',
            html: 'Buddy',
            click: function() {
              Router.go(urls.buddy);
            }
          },
          {
            icon: 'fa fa-users',
            html: 'Reach',
            click: function() {
              Router.go(urls.reach);
            }
          },
        ]
      };
    },
    data: function() {
      this.nav =this.nav ? this.nav : 'pledge';
      var game =this.gameSlug ? GamesCollection.findOne({slug: this.gameSlug})
       : null;
      var gameRule =game ? GameRulesCollection.findOne({ _id:game.gameRuleId })
       : null;
      var userId =Meteor.userId();
      var gameUser =( game && userId ) ? ggGame.getGameUser(game, userId)
       : null;
      var userGame =( game && userId ) ? ggGame.getUserGame( game._id, userId )
       : null;
      var user =userId ? Meteor.users.findOne({ _id: userId },
       { fields: { username: 1} }) : null;
      if(!game || !gameRule || !gameRule.challenges || !gameUser || !userGame || !user) {
        return {
          _xNotFound: true,
          _xHref: ggUrls.myGames()
        };
      }

      var helperData ={
        game: game,
        gameRule: gameRule,
        gameUser: gameUser,
        userGame: userGame,
        user: user
      };
      // Set on template instance so it is accessible.
      Template.instance().data.helperData =helperData;

      return {
        nav: {
          pledge: ( this.nav === 'pledge' ) ? true : false,
          buddy: ( this.nav === 'buddy' ) ? true : false,
          reach: ( this.nav === 'reach' ) ? true : false
        },
        game: game,
        gameState: ggGame.getGameState(game, gameRule),
        gameLink: ggUrls.game(this.gameSlug)
      };
    }
  });

}