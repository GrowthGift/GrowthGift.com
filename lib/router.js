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
  // action: function() {
  //   this.redirect('/todoseed');
  // }
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