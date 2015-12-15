ggDom ={};

var _dom ={};

_dom.getEle =function(classname) {
  return document.getElementsByClassName(classname)[0];
};

ggDom.setInputVal =function(val, classname) {
  var ele =_dom.getEle(classname);
  if(ele) {
    ele.value =val;
  }
};

ggDom.inputSelectAll =function(classname) {
  var ele =_dom.getEle(classname);
  if(ele) {
    ele.setSelectionRange(0, ele.value.length);
  }
};

ggDom.scrollToEle =function(classname, adjustment) {
  var ele =_dom.getEle(classname);
  if(ele) {
    // ele.scrollIntoView();
    // http://stackoverflow.com/a/26230989
    var box =ele.getBoundingClientRect();
    var body = document.body;
    var docEl = document.documentElement;
    var scrollTop = window.pageYOffset || docEl.scrollTop || body.scrollTop;
    var clientTop = docEl.clientTop || body.clientTop || 0;
    var top  = box.top +  scrollTop - clientTop;
    window.scrollTo(0, ( top + adjustment) );
  }
};