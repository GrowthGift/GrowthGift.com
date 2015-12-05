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
      html: 'Button 1',
      click: function() {
        Router.go('location1')
      }
    }
  ]
};

*/

// Template.msNavSecondary.helpers({
//   curNav: function() {
//     return headerCurNav.get();
//   }
// });

Template.msNavSecondary.events({
  'click .ms-nav-secondary-btn': function(evt, template) {
    if(this.click !==undefined) {
      this.click();
    }
  }
});