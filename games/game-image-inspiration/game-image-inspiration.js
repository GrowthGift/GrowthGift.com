if(Meteor.isClient) {

  Template.gameImageInspiration.helpers({
    data: function() {
      var game =this.game;
      if(!game) {
        return {
          _xNotFound: true,
          _xHref: ggUrls.myGames()
        };
      }

      var ret ={
        image: null,
        video: null,
        quote: null
      };
      var inspiration =ggGame.getMostRecentInspiration(game);
      if(inspiration) {
        ret[inspiration.type] =inspiration.content;
        if( inspiration.type === 'video' ) {
          // Convert Youtube video to embed format
          ret[inspiration.type] =ret[inspiration.type].replace('watch?v=', 'embed/');
        }
      }
      else {
        // Default
        ret.image =ggGame.getImage(game);
      }

      return ret;
    }
  });

  Template.gameImageInspiration.events({
  });
}