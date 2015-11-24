Meteor.methods({
  saveGame: function(doc, docId) {
    if(docId) {
      var modifier =doc;
      GamesCollection.update({_id:docId}, modifier);
    }
    else {
      GameSchema.clean(doc);

      GamesCollection.insert(doc, function(error, result) {
        if(Meteor.isClient) {
          if(!error && result) {
            // console.log('success');
          }
        }
      });
    }
  }
});

if(Meteor.isServer) {
  Meteor.publish('current-game', function(gameSlug) {
    return GamesCollection.find({slug: gameSlug});
  });
}

if(Meteor.isClient) {
  Template.saveGame.helpers({
    game: function() {
      if(this.gameSlug) {
        return GamesCollection.findOne({slug: this.gameSlug});
      }
      else {
        return {}
      }
    },
    afMethod: function() {
      if(this.gameSlug) {
        return 'method-update';
      }
      else {
        return 'method';
      }
    }
  });

  Template.saveGame.events({
    'click .save-game-cancel': function(evt, template) {
      history.back();
    }
  });
}