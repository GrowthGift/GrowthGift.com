Meteor.methods({
  saveGame: function(doc, docId) {

    var onSuccess =function(error, result) {
      if(Meteor.isClient) {
        if(!error && result) {
          if(slug) {
            Router.go('/save-game?slug='+slug);
          }
        }
      }
    };

    var valid =true;
    if(docId) {
      var game =GamesCollection.findOne({_id: docId});
      valid =ggMay.editGame(game, Meteor.userId());
    }
    var slug =(doc.$set && doc.$set.slug) || doc.slug;
    if(slug) {
      var existingDoc =(docId && ({_id: docId})) || null;
      var slugExists =ggSlug.exists(slug, 'games', existingDoc);
      if(slugExists) {
        valid =false;
      }
    }

    if(!valid) {
      if(Meteor.isClient) {
        nrAlert.alert("Only game admins may edit games.");
      }
    }
    else {
      if(docId) {
        var modifier =doc;
        GamesCollection.update({_id:docId}, modifier, onSuccess);
      }
      else {
        GameSchema.clean(doc);
        if(Meteor.user()) {
          doc.users =[
            {
              userId: Meteor.userId(),
              role: 'creator',
              status: 'joined'
            }
          ];
        }
        GamesCollection.insert(doc, onSuccess);
      }
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
      if(!this.gameSlug) {
        return {};
      }
      var game =GamesCollection.findOne({slug: this.gameSlug});
      
      if(!game || !game._id || !ggMay.editGame(game, Meteor.userId()) ) {
        Router.go('saveGame');
      }
      return game;
    },
    afMethod: function() {
      return (this.gameSlug && 'method-update') || 'method';
    },
    inputOpts: function() {
      var game ={};
      if(this.gameSlug) {
        game =GamesCollection.findOne({slug: this.gameSlug});
      }
      var edit =(game._id && true) || false;
      var disabled =(edit && true) || false;
      // Form start date
      var start =(edit && game.start) || null;
      if(!edit) {
        var now =moment();
        start =moment().startOf('week');
        if(start <now) {
          start =start.add('days', 7);
        }
        // start at 1pm so add 13 hours from midnight
        start.add('hours', 13);
        start =start.format('YYYY-MM-DD HH:mm:ssZ');
      }

      var opts ={
        slugDisabled: disabled,
        privacyDisabled: disabled,
        privacyOpts: [
          { value: 'private', label: 'Private' },
          { value: 'public', label: 'Public' }
        ],
        startDisabled: disabled,
        startReadonly: !disabled,
        start: start,
        optsDatetimepicker: {
          pikaday: {
            format: 'ddd MMM DD, YYYY h:mma'
          }
        }
      };

      return opts;
    }
  });

  Template.saveGame.events({
    'click .save-game-cancel': function(evt, template) {
      history.back();
    },
    'blur .save-game-input-title': function(evt, template) {
      ggSlug.setToAutogen(AutoForm.getFieldValue('title', 'saveGameForm'),
       AutoForm.getFieldValue('slug', 'saveGameForm'), 'save-game-input-slug');
    },
    'blur .save-game-input-slug': function(evt, template) {
      var slug =AutoForm.getFieldValue('slug', 'saveGameForm');
      var existingGame =(template.data.gameSlug &&
       GamesCollection.findOne({slug: template.data.gameSlug}) ) || null;
      Meteor.call('ggSlugValidate', slug, 'games', existingGame, function(err, exists) {
        if(exists) {
          AutoForm.addStickyValidationError('saveGameForm', 'slug', 'slugExists', slug);
        }
        else {
          AutoForm.removeStickyValidationError('saveGameForm', 'slug');
        }
      });
    }
  });
}