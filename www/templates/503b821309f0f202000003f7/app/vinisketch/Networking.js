// (c) 2012 David Thevenin, ViniSketch pour JoshFire

require.config({
    paths: {
      'vs' : 'vinisketch/kit/js/vs',
      'vs_util' : 'vinisketch/kit/js/vs_util',
      'vs_core' : 'vinisketch/kit/js/vs_core',
      'vs_data' : 'vinisketch/kit/js/vs_data',
      'vs_ui' : 'vinisketch/kit/js/vs_ui',
      'viadeo_user' : 'vinisketch/ViadeoUser',
      'ted_x_participant_list' : 'vinisketch/TedXParticipantList',
      'ted_x_participant' : 'vinisketch/TedXParticipant',
      'ted_x_participant_view' : 'vinisketch/TedXParticipantView',
      'viadeo_publish_panel' : 'vinisketch/ViadeoPublishPanel',
      'viadeo_information_panel' : 'vinisketch/ViadeoInformationPanel'
    }
});

define([
  'vs',
  'vs_core',
  'vs_ui',
  'viadeo_user',
  'ted_x_participant_list',
  'ted_x_participant',
  'viadeo_publish_panel',
  'viadeo_information_panel'
],
function (vs, core, ui, ViadeoUser, TedXParticipantList, TedXParticipant, ViadeoPublishPanel, ViadeoInformationPanel) {

  var Networking = core.createClass ({
  
    parent: ui.View,
    
    constructor : function (config) {
      this._iScroller = config.iScroller;
      config.iScroller = undefined;
      this._super (config);
    },
  
    initComponent : function (event) {
      this._super ();
      
      // hack
      this._holes.children = this.view;
      
      // data init
      this.mainUser = new ViadeoUser ().init ();

      // gui init
      this.addClassName ('networking');
      
      this.loader = new ui.View ({
        node: this.view.querySelector ('.loader')
      }).init ();
      this.add (this.loader);     
      
      /////////////////////////////////////////////////
      //     TedX Participant list Panel
      this.list = new TedXParticipantList ({
        id: 'list_items',
        iScroller: this._iScroller,
        loader: this.loader,
        node: this.view.querySelector ('.first')
      }).init ();
      
      this.list.bind ('add_viadeo_contact', this);
      this.list.bind ('invite_via_video', this);

      this.add (this.list);
      this.list.hide ();
        
      /////////////////////////////////////////////////
      //     Viadeo post message Panel
      this.viadeoPublishPanel = new ViadeoPublishPanel ().init ();
      this.viadeoPublishPanel.bind ('publish_canceled', this);
      this.viadeoPublishPanel.bind ('publish_message', this);

      this.add (this.viadeoPublishPanel);
      this.viadeoPublishPanel.hide ();  

      this.messageButton = new ui.Button ({
        id:"publish_button"
      }).init ();
      this.messageButton.bind ('select', this);
      this.messageButton.hide ();
      
      /////////////////////////////////////////////////
      //     Viadeo post message Panel
      this.informationPanel = new ViadeoInformationPanel ().init ();
      this.informationPanel.bind ('viadeo_connect', this);

      this.add (this.informationPanel);
      this.informationPanel.hide ();

      /////////////////////////////////////////////////
      var self = this;
      this.mainUser.sessionExist (function (v) {
        if (v) self.manageConnection ();
        else {
          self.informationPanel.show ();
          self.loader.hide ();
        }
      });
    },
    
    manageConnection : function () {
      var self = this;
      if (!this.isLogged ()) {
      
        this.loaderVisibility (true);
        this.login (function (error) {
          if (error) {
            if (navigator.notification)
            navigator.notification.alert(
              error, null, 'Erreur Viadeo', 'Ok'
            );
            self.loaderVisibility (false);
            self.informationPanel.show ();
            return;  
          }
          self.updateParticipants (function () {
            // console.log (self.mainUser);
            self.messageButton.show ();
            self.list.show ();
            setTimeout (function () {
              self.loaderVisibility (false);
            }, 300);
          });
        });
      }
    },
    
    notify : function (event) {
      var self = this;
      var return_clb = function (error) {
        if (error) {
          console.log (error);
          if (navigator.notification)
          navigator.notification.alert(
            error, null, 'Erreur Viadeo', 'Ok'
          );
        }
        self.loaderVisibility (false);
      }
      
      var data = event.data;
      var connectWith = function (buttonIndex) {
        if (buttonIndex === 2) return;
        self.loaderVisibility (true);
        self.mainUser.connectWith (data, return_clb);
      }
      var inviteHim = function (buttonIndex) {
        if (buttonIndex === 2) return;
        self.loaderVisibility (true);
        self.mainUser.inviteHim (data, return_clb);
      }
      
      if (event.type == 'viadeo_connect') {
        this.manageConnection ();
        this.informationPanel.hide ();
      }
      else if (event.type == 'add_viadeo_contact') {
        
//         if (navigator.notification) {
//           navigator.notification.confirm (
//             "Confirmer l'ajout à vos contacts.", connectWith, 'Warning', 'Confirmer,Annuler'
//           );
//         } else 

        connectWith ()
      }
      else if (event.type == 'invite_via_video') {
      
//         if (navigator.notification) {
//           navigator.notification.confirm (
//             "Confirmer votre invitation.", inviteHim, 'Warning', 'Confirmer,Annuler'
//           );
//         } else 

        inviteHim ()
      }
      else if (event.src == this.messageButton) {
        if (!this.viadeoPublishPanel.visible)
          this.viadeoPublishPanel.show ();
          this.viadeoPublishPanel.text = "Live from TEDx Paris : …";
      }
      else if (event.type == 'publish_canceled') {
        this.viadeoPublishPanel.hide ();  
      }
      else if (event.type == 'publish_message') {
        this.viadeoPublishPanel.hide ();
        this.loaderVisibility (true);
        this.mainUser.postDashboardMessage (event.data, return_clb);
      }
    },
    
    loaderVisibility : function (v) {
      if (v) this.loader.setStyle ('display', "block");
      else this.loader.setStyle ('display', "none")
    },
    
    isLogged : function () {
      if (!this.mainUser.link) return false;
      else return true;
    },
    
    login : function (clb) {
      this.mainUser.login (clb);
    },
    
    updateParticipants : function (clb) {
      if (!this.isLogged ()) {
        if (vs.util.isFunction (clb)) clb ();
        return;
      }
      var self = this;
      TedXParticipant.getAllParticipants (function (data) {
        if (!data) return;
        
        var contacts = self.mainUser.contacts;
        // cherche les personnes avec qui je suis connecte
        for (var i = 0; i < data.length; i++) {
          var info = data [i], id = info.viadeoId;
          if (!id) continue;
          for (var j = 0; j < contacts.length; j++) {
            var contact = contacts [j];
            if (contact.id == id) {
              info.connected = true;
              break;
            }
          }
        }

        self.list.model = data;
        if (vs.util.isFunction (clb)) clb ();
      });
    }  
  });
 
  return Networking;
});