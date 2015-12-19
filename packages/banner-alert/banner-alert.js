nrAlert = {};


var nrBannerText = new ReactiveVar('');
var typeError = new ReactiveVar(true);

nrAlert.alert = function(text, params) {
  typeError.set(true);
  nrBannerText.set(text);
};

nrAlert.success = function(text, params) {
  typeError.set(false);
  nrBannerText.set(text);
}
nrAlert.clear = function(params) {
  nrBannerText.set('');
};

Template.bannerAlert.helpers({
  bannerText: function(){
    var text = nrBannerText.get();
    if (text === undefined || text ===''){
      return false;
    }
    return nrBannerText.get();
  },
  bannerTypeError: function(){
    return typeError.get();
  }
});

Template.bannerAlert.events({
  'click .nr-banner-close': function(){
    nrBannerText.set('');
  }
});

// Router.onBeforeAction(function() {
//   nrBannerText.set('');
//   this.next();
// });