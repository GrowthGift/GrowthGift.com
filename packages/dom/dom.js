ggDom ={};

ggDom.setInputVal =function(val, classname) {
  var ele =document.getElementsByClassName(classname)[0];
  if(ele) {
    ele.value =val;
  }
};