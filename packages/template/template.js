ggTemplate ={};

ggTemplate.getMainTemplate =function(templateName) {
  var view =Blaze.currentView;
  if(view.name !==templateName) {
    //get parent template instance if not on correct one - http://stackoverflow.com/questions/27949407/how-to-get-the-parent-template-instance-of-the-current-template
    while (view && view.name !==templateName) {
      view = view.parentView;
    }
  }
  return view.templateInstance();
};