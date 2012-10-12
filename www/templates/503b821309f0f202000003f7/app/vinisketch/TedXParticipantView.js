// (c) 2012 David Thevenin, ViniSketch pour JoshFire

define (['vs', 'vs_core', 'vs_ui', 'vs_data'],
function (vs, core, ui, data) {

  var url = new data.URL ();
  url.parse (document.URL);

  if (window.deviceConfiguration.os === core.DeviceConfiguration.OS_ANDROID)
    default_image_src = "vinisketch/assets/pas_de_photo.jpeg";
  else
    default_image_src = url.protocol + "://" + url.authority + 
      url.directory + "/vinisketch/assets/pas_de_photo.jpeg";
  
  vs.util.free (url);

  var list_item_str = 
  "<li class='contact'>\
    <img class='fadein' src='" + default_image_src + "' />\
    <span class='name'>${firstname} ${lastname}</span>\
    <span class='position'>${position}</span>\
    <div class='fadein viadeo_button'>${video_action}</div>\
  </li>"
  
  /******************************************************
   *  TedXParcipant View Class
   *
   *****************************************************/
  var TedXParticipantView = core.createClass ({
  
    /** parent class */
    parent: ui.View,
    template: list_item_str,
    
    properties : {
      viadeoId: {
        set: function (v) {
          if (!v) {
            this.video_action = TedXParticipantView.INVITE_ON_STR;
            this._viadeo_id = null;
          }
          else {
            this.video_action = TedXParticipantView.CONNECT_WITH_STR;
            this._viadeo_id = v;
          }
        }
      },
      imgUrl: {
        set: function (v) {
          if (!v) {
            this._img_url = null;
            this._setDefaultImage ();
          }
          else {
            this._img_url = v;
            this._loadImage ();
          }
        }
      },
    },
  
    initComponent : function ()
    {
      this._super ();
      this.video_action = TedXParticipantView.INVITE_ON_STR;
      
      this._image = this.view.querySelector ('img');
      
      this.actionButton = new ui.Button ({
        node: this.view.querySelector (".viadeo_button")
      }).init ();
      this.actionButton.bind ('select', this);
      
      // par default on cache des items pur optimiser l'affichage
      if (window.deviceConfiguration.os === core.DeviceConfiguration.OS_ANDROID)         
        this.shouldBeVisible (false);
      else
        this.shouldBeVisible (true);
    },
    
    notify : function (event) {
      if (event.src === this.actionButton) {
        if (this._viadeo_id)
          this.propagate ('add_viadeo_contact', this.__model);
        else this.propagate ('invite_via_video', this.__model);
      }
    },
    
 /**********************************************************************

  *********************************************************************/
    _setDefaultImage : function () {
      this._image.src = default_image_src;
    },
  
    _loadImage : function () {
      var image = new Image (), self = this;
      
      // resize and position image to fit the square
      image.onload = function (e) {
        self._image.src = self._img_url;
        image.src = 
          'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';
        delete (image);
        setTimeout (function () {self._image.style.opacity = '1';}, 10);
      }
      image.src = this._img_url;
    },
  
    shouldBeVisible : function (v) {
      var self = this;
      if (v) {
        this._image.style.display = 'block'
        this.actionButton.show ();
        setTimeout (function () {
          self.actionButton.setStyle ('opacity', 1);
        }, 10);
       	setTimeout (function () {self._image.style.opacity = '1';}, 10);
      }
      else {
        this._image.style.display = 'none';
        this._image.style.opacity = '0';
        this.actionButton.hide ();
        this.actionButton.setStyle ('opacity', 0);
      }
    }
  });
  
  TedXParticipantView.INVITE_ON_STR = "Inviter par Viadeo";
  TedXParticipantView.CONNECT_WITH_STR = "Ajouter à mes contacts Viadeo"
  
  return TedXParticipantView;
});