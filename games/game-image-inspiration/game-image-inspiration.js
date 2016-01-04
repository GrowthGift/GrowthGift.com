Meteor.methods({
  likeGameInspiration: function(gameId, inspirationId) {
    ggGame.likeGameInspiration(gameId, inspirationId, Meteor.userId(),
     function(err, result, inspiration) {
      if(!err && Meteor.isClient) {
        var templateInst =msTemplate.getMainTemplate("Template.gameImageInspiration");
        templateInst.inspiration.set(inspiration);
        // Need to clear cache
        var cacheKey ='game_slug_'+templateInst.data.game.slug+'_user_id_'+Meteor.userId();
        ggGame.clearCache(cacheKey);
      }
    });
  }
});

if(Meteor.isClient) {
  Template.gameImageInspiration.created =function() {
    this.inspiration = new ReactiveVar(false);
  };

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
        quote: null,
        hasInspiration: null,
        classes: {
          mayLike: ''
        }
      };
      var templateInst =Template.instance();
      var templateInspiration =templateInst.inspiration.get();
      var inspiration = templateInspiration || ggGame.getCurrentInspiration(game);
      if(inspiration) {
        if(!templateInspiration) {
          templateInst.inspiration.set(inspiration);
        }
        ret.classes.mayLike =( ggMay.likeGameInspiration(inspiration, game,
         Meteor.userId(), null) ) ? '' : 'disabled';
        ret.hasInspiration =true;
        ret[inspiration.type] =inspiration.content;
        if( inspiration.type === 'video' ) {
          // Convert Youtube video to embed format
          ret[inspiration.type] =ret[inspiration.type].replace('watch?v=', 'embed/');
        }
        ret.inspirationUser =Meteor.users.findOne({ _id: inspiration.userId });
        ret.inspirationNumLikes = inspiration.likes ? inspiration.likes.length : 0
      }
      else {
        // Default
        ret.image =ggGame.getImage(game);
      }

      return ret;
    }
  });

  Template.gameImageInspiration.events({
    'click .game-image-inspiration-like': function(evt, template) {
      Meteor.call('likeGameInspiration', template.data.game._id, template.inspiration.get()._id);
    }
  });
}