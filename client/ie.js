//Internet Explorer redirect (check for IE)
var internetExplorer ={};
internetExplorer.is = -1; // Return value assumes failure.
if (navigator.appName == 'Microsoft Internet Explorer') {
  internetExplorer.ua = navigator.userAgent;
  internetExplorer.re  = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
  if (internetExplorer.re.exec(internetExplorer.ua) != null)
  internetExplorer.ie = parseFloat( RegExp.$1 );
}
if(internetExplorer.ie >-1 && internetExplorer.ie <10) {    //IE less than 10 (only >=10 supports flexbox)
  internetExplorer.curLoc =window.location.toString();
  internetExplorer.index1 =internetExplorer.curLoc.indexOf('//');
  internetExplorer.indexSlash =internetExplorer.curLoc.indexOf('/', (internetExplorer.index1+2));
  internetExplorer.host =internetExplorer.curLoc.slice(0, (internetExplorer.indexSlash+1));
  window.location =internetExplorer.host+"ie.html";
}