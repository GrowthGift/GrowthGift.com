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