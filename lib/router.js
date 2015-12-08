/**
@toc
*/

Router.configure({
  layoutTemplate: 'layout',
  loadingTemplate: 'loading',
  // global subscribes. Add here to avoid re-loading each page change
  waitOn: function () {
    return [
      Meteor.subscribe('notifications')
      // Meteor.subscribe('friends-userId')
    ]
  }
});

Router.route('/', {
  name: 'home',
  action: function() {
    this.redirect('/g/pushups');   // TEMPOARARY hardcoded current (promoted) game
  }
});

// about
Router.route('/about', {
  name: 'about',
});


//auth
Router.route('/login', {name: 'login'});
Router.route('/signup', {name: 'signup'});
Router.route('/reset-password', {
  name: 'resetPassword',
  waitOn: function () {
    return [
      Meteor.subscribe('reset-password-user', this.params.query.token)
    ]
  },
  data: function() {
    return {
      token: this.params.query.token
    }
  }
});
Router.route('/enroll-account', {
  name: 'enrollAccount',
  waitOn: function () {
    return [
      Meteor.subscribe('reset-password-user', this.params.query.token)
    ]
  },
  data: function() {
    return {
      token: this.params.query.token
    }
  },
  action: function() {
    this.render('resetPassword');
  }
});


//dev-test
Router.route('/dev-test-design', {name: 'devTestDesign'});
Router.route('/dev-test-test', {
  name: 'devTestTest',
  waitOn: function () {
    return [
      Meteor.subscribe('current-aftest', this.params.query.propertyId),
      Meteor.subscribe('aftests')
    ]
  },
  data: function() {
    return {
      docId: this.params.query.docId
    }
  }
});


//notifications
Router.route('/notifications', {
  name: 'notifications',
  data: function() {
    return {
      nav: this.params.query.nav
    }
  }
});


// games
Router.route('/my-games', {
  name: 'myGames',
  data: function() {
    return {
      view: this.params.query.view,
    }
  }
});

Router.route('/save-game', {
  name: 'saveGame',
  data: function() {
    return {
      gameSlug: this.params.query.slug,
      gameRule: this.params.query.gameRule
    }
  }
});

Router.route('/g/:gameSlug', {
  name: 'game',
  data: function() {
    return {
      gameSlug: this.params.gameSlug,
      buddy: this.params.query.buddy
    }
  }
});

Router.route('/gi/:gameSlug', {
  name: 'gameInvite',
  data: function() {
    return {
      gameSlug: this.params.gameSlug
    }
  }
});

Router.route('/gc/:gameSlug', {
  name: 'gameChallenge',
  data: function() {
    return {
      gameSlug: this.params.gameSlug
    }
  }
});

Router.route('/game-users/:gameSlug', {
  name: 'gameUsers',
  data: function() {
    return {
      gameSlug: this.params.gameSlug
    }
  }
});


// game rules
Router.route('/game-rules', {
  name: 'gameRules',
  data: function() {
    return {
      gameSelect: this.params.query.gameSelect
    }
  }
});

Router.route('/save-game-rule', {
  name: 'saveGameRule',
  // TODO - move this subscribe to template
  waitOn: function () {
    return [
      Meteor.subscribe('gameRule-gameRuleSlug', this.params.query.slug)
    ]
  },
  data: function() {
    return {
      gameRuleSlug: this.params.query.slug,
      gameSelect: this.params.query.gameSelect
    }
  }
});

Router.route('/gr/:gameRuleSlug', {
  name: 'gameRule',
  data: function() {
    return {
      gameRuleSlug: this.params.gameRuleSlug,
      gameSelect: this.params.query.gameSelect
    }
  }
});


// users
Router.route('/u/:username', {
  name: 'user',
  data: function() {
    return {
      username: this.params.username
    }
  }
});