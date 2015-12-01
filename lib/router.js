/**
@toc
*/

Router.configure({
  layoutTemplate: 'layout',
  loadingTemplate: 'loading',
  waitOn: function () {
    return [
      Meteor.subscribe('user-notifications')
    ]
  }
});

Router.route('/', {
  name: 'home',
  action: function() {
    this.redirect('/g/game-2');   // TEMPOARARY hardcoded current (promoted) game
  }
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
  name: 'notifications'
});


// games
Router.route('/my-games', {
  name: 'myGames',
  waitOn: function () {
    return [
      Meteor.subscribe('userGames-userId'),
      Meteor.subscribe('games-userId'),
      Meteor.subscribe('gameRules-userId')
    ]
  },
  data: function() {
    return {
      view: this.params.query.view,
    }
  }
});

Router.route('/save-game', {
  name: 'saveGame',
  waitOn: function () {
    return [
      Meteor.subscribe('current-game', this.params.query.slug),
      Meteor.subscribe('gameRules')
    ]
  },
  data: function() {
    return {
      gameSlug: this.params.query.slug,
      gameRule: this.params.query.gameRule
    }
  }
});

Router.route('/g/:gameSlug', {
  name: 'game',
  waitOn: function () {
    return [
      Meteor.subscribe('current-game', this.params.gameSlug),
      Meteor.subscribe('gameRule', this.params.gameSlug),
      Meteor.subscribe('userGames', this.params.gameSlug)
    ]
  },
  data: function() {
    return {
      gameSlug: this.params.gameSlug
    }
  }
});

Router.route('/gc/:gameSlug', {
  name: 'gameChallenge',
  waitOn: function () {
    return [
      Meteor.subscribe('current-game', this.params.gameSlug),
      Meteor.subscribe('userGame', this.params.gameSlug),
      Meteor.subscribe('gameRule', this.params.gameSlug)
    ]
  },
  data: function() {
    return {
      gameSlug: this.params.gameSlug
    }
  }
});

Router.route('/game-users/:gameSlug', {
  name: 'gameUsers',
  waitOn: function () {
    return [
      Meteor.subscribe('current-game', this.params.gameSlug),
      Meteor.subscribe('userGames', this.params.gameSlug),
      Meteor.subscribe('gameRule', this.params.gameSlug),
      Meteor.subscribe('users-game-slug', this.params.gameSlug)
    ]
  },
  data: function() {
    return {
      gameSlug: this.params.gameSlug
    }
  }
});


// game rules
Router.route('/game-rules', {
  name: 'gameRules',
  waitOn: function () {
    return [
      Meteor.subscribe('gameRules')
    ]
  },
  data: function() {
    return {
      gameSelect: this.params.query.gameSelect
    }
  }
});

Router.route('/save-game-rule', {
  name: 'saveGameRule',
  waitOn: function () {
    return [
      Meteor.subscribe('current-game-rule', this.params.query.slug)
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
  waitOn: function () {
    return [
      Meteor.subscribe('current-game-rule', this.params.gameRuleSlug)
    ]
  },
  data: function() {
    return {
      gameRuleSlug: this.params.gameRuleSlug,
      gameSelect: this.params.query.gameSelect
    }
  }
});