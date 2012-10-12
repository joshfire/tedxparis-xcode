// (c) 2012 David Thevenin, ViniSketch pour JoshFire

define (['vs', 'vs_core', 'vs_ui'],
function (vs, core, ui) {

  var view_str = 
  "<div class='viadeo_publish_view'>\
     <div class='content' x-hag-hole='children'> \
         <div class='message'>Publier une news</div>\
     </div>\
  </div>"

  /******************************************************
   *  Viadeo Publish  View Class
   *
   *****************************************************/
  var ViadeoPublishPanel = core.createClass ({
  
    /** parent class */
    parent: ui.View,
    template: view_str,
    
    properties : {
      "text" : {
        set : function (v) { 
          this.textArea.value = v;
          this.udpatePostStatus ();
        }
      }
    },
  
    initComponent : function ()
    {
      this._super ();
      
      this.textArea = new vs.ui.TextArea ({id : 'publish_text_area'}).init ();
      this.textArea.bind ('continuous_change', this, this.udpatePostStatus);
      this.add (this.textArea)
      
      this.sendButton = new ui.Button ({
        id:"publish_send",
        text:"Partager"
      }).init ();
      this.sendButton.bind ('select', this);
      this.add (this.sendButton)
      
      this.textFeedback = new ui.TextLabel ({
        id:"publish_text_feedback",
        text:"..."
      }).init ();
      this.add (this.textFeedback)
      
      this.cancelButton = new ui.Button ({
        id:"publish_cancelButton",
        text:"Annuler"
      }).init ();
      this.cancelButton.bind ('select', this);
      this.add (this.cancelButton)
    },
    
    udpatePostStatus : function () {
      var l = this.textArea.value.length;
      this.textFeedback.text = 140 - l;
      if (l < 10 || l > 140) this.sendButton.enable = false;
      else this.sendButton.enable = true;
    },
    
    notify : function (event) {
      if (event.src === this.cancelButton) {
        this.propagate ('publish_canceled');
      }
      else if (event.src === this.sendButton) {
        this.propagate ('publish_message', this.textArea.value);
      }
    },
    
    show : function () {
      this._super ();
      this.textArea.setFocus ();
    }
  });

  return ViadeoPublishPanel;
});