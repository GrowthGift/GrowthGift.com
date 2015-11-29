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

  },
  deleteGame: function(docId) {
    var game =GamesCollection.findOne({_id: docId});
    if(!ggMay.deleteGame(game, Meteor.userId()) ) {
      if(Meteor.isClient) {
        nrAlert.alert("Only game creators may delete games.");
      }
    }
    else {
      GamesCollection.remove({_id: docId}, function(error, result) {
        if(Meteor.isClient) {
          Router.go('myGames');
        }
      });
    }
  }
});

if(Meteor.isServer) {
  Meteor.publish('current-game', function(gameSlug) {
    return GamesCollection.find({slug: gameSlug});
  });
  Meteor.publish('gameRules', function() {
    return GameRulesCollection.find({}, {fields: {title:1, type:1, description:1, slug:1} });
  });
}

if(Meteor.isClient) {

  Template.saveGame.created =function() {
    this.inited =false;
  };

  Template.saveGame.helpers({
    game: function() {
      if(!this.gameSlug) {
        return {};
      }
      var game =GamesCollection.findOne({slug: this.gameSlug});
      if(!Template.instance().inited) {
        if(!game || !game._id || !ggMay.editGame(game, Meteor.userId()) ) {
          nrAlert.alert("No game with slug "+this.gameSlug);
          Router.go('myGames');
        }
        Template.instance().inited =true;
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
      var edit =(game && game._id && true) || false;
      var disabled =(edit && true) || false;
      // Form start date
      var start =(edit && game.start) || null;
      if(!edit) {
        var now =moment();
        start =moment().startOf('week');
        // Allow same day, but if past the day, set to next week.
        if(start.format('YYYY-MM-DD') <now.format('YYYY-MM-DD')) {
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
        },
        gameRuleIdOpts: ggGameRule.allSelectOpts()
      };

      return opts;
    },
    privileges: function() {
      if(!this.gameSlug) {
        return {};
      }
      var game =GamesCollection.findOne({slug: this.gameSlug});
      return {
        delete: (game && ggMay.deleteGame(game, Meteor.userId())) ? true : false
      };
    }
  });

  Template.saveGame.events({
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
    },
    'click .save-game-delete': function(evt, template) {
      var game =GamesCollection.findOne({slug: this.gameSlug});
      Meteor.call("deleteGame", game._id);
    }
  });
}