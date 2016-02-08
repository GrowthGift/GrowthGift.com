Meteor.methods({
  saveGame: function(doc, docId) {

    var onSuccess =function(error, result) {
      if(Meteor.isClient) {
        if(!error && result) {
          var templateInst =msTemplate.getMainTemplate("Template.saveGame");
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
        nrAlert.alert("Only challenge creators may delete challenges.");
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
    this.gameImage = new ReactiveVar(null);
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

      var templateInst = Template.instance();
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
        // We WANT a local (browser) time since that is what the date time
        // picker uses. TODO - if user's timezone does NOT match the browser
        // / moment timezone, would still need to convert this..?
        // var nowTime =msTimezone.curDateTime('moment');
        var nowTime =moment();
        start =nowTime.clone().startOf('week');
        start =start.add(1, 'days');    // Start on Monday
        // Allow same day, but if past the day, set to next week.
        // if(start.format('YYYY-MM-DD') <nowTime.format('YYYY-MM-DD')) {
        //   start =start.add(7, 'days');
        // }
        // As with above, do NOT convert time; just keep local.
        start =start.format(msTimezone.dateTimeFormat);
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
            format: msTimezone.dateTimeDisplay
          }
        },
        gameRuleIdOpts: ggGameRule.allSelectOpts(),
        imageVal: templateInst.gameImage.get(),
        optsImagePicker: {
          classes: {
            btns: 'btn-group',
            btn: 'btn-group-btn',
            saveBtn: 'btn btn-primary margin-tb'
          },
          JcropOpts: {
            aspectRatio: 2,
            minSize: [ 200, 100 ]
          },
          resizeMax: {
            width: 600,
            height: 300
          },
          onImageSaved: function(err, base64Data) {
            // Delete old one, if it exists
            var existingImage = templateInst.gameImage.get() ||
             game.image;
            ggS3.deleteFile(existingImage);

            S3.upload({
              files: [ base64Data ],
              encoding: 'base64'
            }, function(err, result) {
              if(err) {
                templateInst.gameImage.set(null);
              }
              else {
                templateInst.gameImage.set(result.secure_url);
              }
            });
          }
        }
      };

      return ret;
    },
    afMethod: function() {
      return (this.gameSlug && 'method-update') || 'method';
    }
  });

  Template.saveGame.events({
    'blur .save-game-input-title': function(evt, template) {
      msSlug.setToAutogen(AutoForm.getFieldValue('title', 'saveGameForm'),
       AutoForm.getFieldValue('slug', 'saveGameForm'), 'save-game-input-slug');
    },
    'blur .save-game-input-slug': function(evt, template) {
      var slug =AutoForm.getFieldValue('slug', 'saveGameForm');
      var existingGame =(template.data.gameSlug &&
       GamesCollection.findOne({slug: template.data.gameSlug}) ) || null;
      Meteor.call('msSlugValidate', slug, 'games', existingGame, null, function(err, exists) {
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