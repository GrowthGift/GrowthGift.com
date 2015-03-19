if(Meteor.isClient) {

  var classes ={
    cont: '',
    contBody: ''
  };
  Session.set('layoutClasses', classes);

  //hardcoded - must match actual ids set elsewhere
  var otherHeightEleIds =[
    'header'
  ];
  Session.set('layoutContentMinHeight', 0);

  /**
  @param {Object} params
    @param {Array} otherHeightEleIds Other ids on page that we want to subtract height of
  */
  function getResizeHeight(params) {
    var ret ={contentMinHeight: 0};

    if(params.otherHeightEleIds ===undefined) {
      params.otherHeightEleIds =otherHeightEleIds;
    }

    var ii;
    var totHeight =window.innerHeight;
    var nonFooterHeight =0;
    for(var ii=0; ii<params.otherHeightEleIds.length; ii++) {
      var curId =params.otherHeightEleIds[ii];
      if(document.getElementById(curId)) {
        nonFooterHeight +=document.getElementById(curId).offsetHeight;
      }
    }
    ret.contentMinHeight =totHeight -nonFooterHeight;

    return ret;
  }

  Meteor.startup(function() {
    window.onresize =function(evt) {
      Session.set('layoutContentMinHeight', getResizeHeight({}).contentMinHeight);
    };
  });

  Template.layout.rendered =function() {
    //init on first load
    Session.set('layoutContentMinHeight', getResizeHeight({}).contentMinHeight);
  };

  Template.layout.helpers({
    classes: function() {
      return Session.get('layoutClasses');
    },
    minHeight: function() {
      return Session.get('layoutContentMinHeight');
    }
  });
}