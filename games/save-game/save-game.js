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

if(Meteor.isClient) {
  function init(templateInst) {
    var initTimeout =250;
    var maxAttempts =(5000 / initTimeout);
    if(!templateInst.inited) {

      if(templateInst.data.gameRule) {
        var gameRule =ggGameRule.findBySlug(templateInst.data.gameRule);
        if(gameRule && gameRule._id) {
          ggDom.setInputVal(gameRule._id, 'save-game-input-game-rule-id');
          templateInst.inited =true;
        }
        // Not loaded yet..
        else if(templateInst.initAttempts < maxAttempts) {
          // TODO - figure out better way to detect gameRule is loaded
          setTimeout(function() {
            init(templateInst);
          }, initTimeout);
          templateInst.initAttempts++;
        }
      }
      else {
        templateInst.inited =true;
      }

    }
  }

  Template.saveGame.created =function() {
    Meteor.subscribe('save-game', Template.instance().data.gameSlug);
    this.inited =false;
    this.initAttempts =0;
  };

  Template.saveGame.rendered =function() {
    init(Template.instance());
  };

  Template.saveGame.helpers({
    data: function() {
      if(!Meteor.user()) {
        Router.go('myGames');
        return false;
      }
      var game =(this.gameSlug && GamesCollection.findOne({slug: this.gameSlug}) ) || null;
      if(this.gameSlug && (!game || !game._id) ) {
        return {
          _xNotFound: true,
          _xHref: ggUrls.myGames()
        };
      }
      if(game && !ggMay.editGame(game, Meteor.userId()) ) {
        nrAlert.alert("No game you may edit with slug "+this.gameSlug);
        Router.go('myGames');
      }

      var ret ={
        game: game,
        privileges: {
          delete: (game && ggMay.deleteGame(game, Meteor.userId()) ) ? true : false
        }
      };

      var gameSelectHrefPart =(game && '?gameSelect='+game.slug) ||
       '?gameSelect='+ggConstants.gameSelectNew;
      ret.gameRuleSelectData ={
        hrefLookup: '/game-rules'+gameSelectHrefPart,
        hrefCreate: '/save-game-rule'+gameSelectHrefPart
      };

      // input opts
      var edit =(game && game._id) ? true : false;
      var disabled =edit ? true : false;
      // Form start date
      var start =(edit && game.start) ? game.start : null;
      if(!edit) {
        var now =moment();
        // start =moment().startOf('week');
        // // Allow same day, but if past the day, set to next week.
        // if(start.format('YYYY-MM-DD') <now.format('YYYY-MM-DD')) {
        //   start =start.add(7, 'days');
        //   // start =start.add(4, 'days'); // TESTING
        // }
        // // start at 5pm so add 17 hours from midnight
        // start.add(17, 'hours');
        start =now.clone();    // TODO - temporary for Apple app review and testing
        start =start.format(ggConstants.dateTimeFormat);
      }

      ret.inputOpts ={
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

      return ret;
    },
    afMethod: function() {
      return (this.gameSlug && 'method-update') || 'method';
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
      Meteor.call('ggSlugValidate', slug, 'games', existingGame, null, function(err, exists) {
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