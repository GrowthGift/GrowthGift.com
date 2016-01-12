Meteor.methods({
  saveGameBuddyRequest: function(game, userBuddy) {
    ggGame.saveBuddyRequest(game, Meteor.user(), userBuddy, function(err, result) {
      if(!err && Meteor.isClient) {
        if(game.slug) {
          Router.go(ggUrls.gameUsers(game.slug));
        }
      }
    });
  }
});

if(Meteor.isClient) {

  Template.gameBuddy.created =function() {
    Meteor.subscribe('game-buddy', Template.instance().data.gameSlug,
     Template.instance().data.username);
  };

  Template.gameBuddy.helpers({
    data: function() {
      var game =this.gameSlug ? GamesCollection.findOne({slug: this.gameSlug})
       : null;
      var userBuddy = this.username ? Meteor.users.findOne({ username: this.username },
       { fields: { username: 1, profile: 1} }) : null;
      var userId =Meteor.userId();
      if(!game || !userBuddy || !userId) {
        return {
          _xNotFound: true,
          _xHref: ggUrls.myGames()
        };
      }

      userBuddy.xDisplay ={
        img: msUser.getImage(userBuddy)
      };

      return {
        game: game,
        userBuddy: userBuddy,
        links: {
          gameUsers: ggUrls.gameUsers(game.slug)
        }
      };
    }
  });

  Template.gameBuddy.events({
    'click .game-buddy-request-btn': function(evt, template) {
      var game =GamesCollection.findOne({slug: this.gameSlug});
      var userBuddy = this.username ? Meteor.users.findOne({ username: this.username },
       { fields: { username: 1, profile: 1} }) : null;
      Meteor.call('saveGameBuddyRequest', game, userBuddy);
    }
  });

}