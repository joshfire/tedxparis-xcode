// (c) 2012 David Thevenin, ViniSketch pour JoshFire

define (['vs', 'vs_core', 'vs_ui'],
function (vs, core, ui) {

  var view_str = 
  "<div class='viadeo_info_panel'>\
     <div class='content' x-hag-hole='children'> \
         <img src='images/viadeo_logo.png' /> \
         <div class='message'>\
            <p>Pour accéder à la liste des participants, veuillez vous connecter avec votre compte Viadeo.</p><br />\
            <p>En vous connectant vous pourrez&nbsp;:</p>\
            <ul>\
              <li>Entrer en relation avec un participant</li>\
              <li>Rajouter un participant à vos contacts</li>\
              <li>Poster des news</li>\
           </ul>\
         </div> <br/>\
     </div>\
  </div>"

  /******************************************************
   *  Viadeo Publish  View Class
   *
   *****************************************************/
  var ViadeoInformationPanel = core.createClass ({
  
    /** parent class */
    parent: ui.View,
    template: view_str,
 
    initComponent : function ()
    {
      this._super ();
      
      this.sendButton = new ui.Button ({
        id:"connect_button",
        text:"Se connecter"
      }).init ();
      this.sendButton.bind ('select', this);
      this.add (this.sendButton)
    },
    
    notify : function (event) {
      if (event.src === this.sendButton) {
        this.propagate ('viadeo_connect');
      }
    },

  });

  return ViadeoInformationPanel;
});