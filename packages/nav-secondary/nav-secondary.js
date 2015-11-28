/**
@usage
@param {Object} nav
  @param {Object} [classes]
    @param {String} [cont]
  @param {Object[]} buttons
    @param {String} icon
    @param {String} html
    @param {Function} click

@example
var nav ={
  buttons: [
    {
      icon: 'fa fa-cube',
      html: 'My Games',
      click: function() {
        Router.go('myGames')
      }
    }
  ]
};

*/

// Template.ggNavSecondary.helpers({
//   curNav: function() {
//     return headerCurNav.get();
//   }
// });

Template.ggNavSecondary.events({
  'click .gg-nav-secondary-btn': function(evt, template) {
    if(this.click !==undefined) {
      this.click();
    }
  }
});