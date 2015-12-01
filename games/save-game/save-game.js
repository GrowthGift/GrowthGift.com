Meteor.methods({
  saveGame: function(doc, docId) {

    var onSuccess =function(error, result) {
      if(Meteor.isClient) {
        if(!error && result) {
          var templateInst =ggTemplate.getMainTemplate("Template.saveGame");
          var slug =((doc.$set && doc.$set.slug) || doc.slug ||
           templateInst.data.gameSlug);
          if(slug) {
            Router.go('/g/'+slug);
          }
        }
      }
    };

    ggGame.save(doc, docId, Meteor.userId(), onSuccess);

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

  function init(templateInst) {
    if(!templateInst.inited) {
      if(templateInst.data.gameSlug) {
        var game =GamesCollection.findOne({slug: templateInst.data.gameSlug});
        if(!game || !game._id || !ggMay.editGame(game, Meteor.userId()) ) {
          nrAlert.alert("No game you may edit with slug "+templateInst.data.gameSlug);
          Router.go('myGames');
        }
      }

      if(templateInst.data.gameRule) {
        var gameRule =ggGameRule.findBySlug(templateInst.data.gameRule);
        if(gameRule && gameRule._id) {
          ggDom.setInputVal(gameRule._id, 'save-game-input-game-rule-id');
        }
      }

      templateInst.inited =true;
    }
  }

  Template.saveGame.created =function() {
    this.inited =false;
  };

  Template.saveGame.rendered =function() {
    init(Template.instance());
  };

  Template.saveGame.helpers({
    game: function() {
      if(!this.gameSlug) {
        return {};
      }
      var game =GamesCollection.findOne({slug: this.gameSlug});
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
          start =start.add(7, 'days');
        }
        // start at 1pm so add 13 hours from midnight
        start.add(13, 'hours');
        start =start.format(ggConstants.dateTimeFormat);
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
            format: ggConstants.dateTimeDisplay
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
    },
    gameRuleSelectData: function() {
      var game =(this.gameSlug && GamesCollection.findOne({slug: this.gameSlug})) || null;
      var gameSelectHrefPart =(game && '?gameSelect='+game.slug) || '?gameSelect='+ggConstants.gameSelectNew;
      return {
        hrefLookup: '/game-rules'+gameSelectHrefPart,
        hrefCreate: '/save-game-rule'+gameSelectHrefPart
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