if(Meteor.isClient) {

  Template.gamePreview.helpers({
    data: function() {
      var game =this.game;
      game.xDisplay.img = ggGame.getImage(game);
      game.xDisplay.gameLink = ggUrls.game(game.slug);
      return {
        game: game
      };
    }
  });

}