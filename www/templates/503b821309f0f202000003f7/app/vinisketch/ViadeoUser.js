// (c) 2012 David Thevenin, ViniSketch pour JoshFire

define(['vs_util', 'vs_core'], function (util, core) {

  VD.init({
    apiKey: 'TEDxParisheifVu',
    status: true,
    cookie: true
  });

  var _manage_video_return = function (r, clb) {
    if (!r) clb ("Bad Request");
    else if (r.created  && util.isFunction (clb)) clb ();
    else if (r.error && util.isFunction (clb))
      clb (r.error.type + ', ' + r.error.message [0]);
    else if (!r.beans && util.isFunction (clb)) clb ("Bad Request")
    else {
      var bean = r.beans [0];
      if (bean.type == "Created" && util.isFunction (clb)) clb ();
      else if (util.isFunction (clb)) clb (bean.type + ', ' + bean.message [0]);
    }
  }

  var ViadeoUser = core.createClass ({
  
    parent: core.Model,
  
    properties : {
      firstname: core.Object.PROPERTY_OUT,
      lastname: core.Object.PROPERTY_OUT,
      picture: core.Object.PROPERTY_OUT,
      contacts: core.Object.PROPERTY_OUT,
      link: core.Object.PROPERTY_OUT
    },
  
    initComponent : function (event) {
      core.Model.prototype.initComponent.call (this);
      
      this._firstname = "";
      this._lastname = "";
      this._picture = "";
      this._contacts = [];
      this._link = "";
    },
  
    login : function (clb) {
      if (window.device && ViadeoConnect && !window.plugins.viadeoConnect) {
        ViadeoConnect.install ();
      }
      
      /* VD.getLoginStatus() check whether the user is logged or not and then executes our callback function. */
      var self = this;
      this._end_login = clb;
 
      if (window.plugins && window.plugins.viadeoConnect) {
        window.plugins.viadeoConnect.connect (function(err) {
          if (err) {
            clb (err);
            return;
          }
          self._calls ();
        });
      }
      else {
        VD.getLoginStatus (function(r) {
          if (!r.session) {
            VD.login(function(r) {
              if(r.session){
                self._calls ();
              }
              else clb ("Erreur de connexion");
            });
          } else {
            self._calls ();
          }
        });
      }
    },
    
    sessionExist : function (clb) {
      VD.getLoginStatus (function(r) {
        if (!r.session) {
          if (clb) clb (false);
        } else {
          if (clb) clb (true);
        }
      });
    },
    
    connectWith : function (participant /**TedXParcipant */, clb) {
    
      if (!participant._viadeo_id && !participant._email) {
        clb ("Bad Parameter");
        return;
      }

      var msg = this._firstname + ' ' + this._lastname + ' ' +
        ViadeoUser.CONNECT_MSG_STR

      VD.api('/me/contacts', "post", {
        auto_resolution : true,
        id: participant._viadeo_id?participant._viadeo_id:null,
        email: participant._viadeo_id?participant._email:null,
        firstname: participant._firstname,
        lastname: participant._lastname,
        message: msg}
      , function (r) { _manage_video_return (r, clb); });
    },
    
    inviteHim : function (participant /**TedXParcipant */, clb) {

      if (!participant._email) {
        clb ("Bad Parameter");
        return;
      }
      
      var msg = this._firstname + ' ' + this._lastname + ' ' +
        ViadeoUser.INVITE_MSG_STR

      VD.api('/me/contacts', "post", {
        auto_resolution : true,
        email: participant._email,
        firstname: participant._firstname,
        lastname: participant._lastname,
        message: msg}
      , function (r) {
        _manage_video_return (r, clb);
      });
    },

    postDashboardMessage : function (message, clb) {
    
      if (!util.isString (message) || !message) {
        clb ("Bad Parameter");
        return;
      }
      
      VD.api('/status', "post", {
        by_mobile : true,
        message: message
      }
      , function (r) { 
        _manage_video_return (r, clb);
      });
    },

    _calls : function () {
      var self = this;
      this._contacts = [];
      
      var request = 0;

      /* First call is "/me" to retrieve the basic info of the user */
      VD.api('/me', function (r) {
        self._firstname = r.first_name;
        self._lastname = r.last_name;
        self._picture = r.picture_large;
        self._link = r.link;
        
        request ++;
        if (request === 2 && util.isFunction (self._end_login)) {
          self._end_login.call (this);
          self._end_login = null;
        }
      });

      /* Second call is "/me/contacts" with the "user_detail" parameter set to partial to retrieve the picture of the user's contact */
      VD.api('/me/contacts', {user_detail : 'partial'}, function (r) {
        /* Filling the contacts container div */
        for (var i = 0; i < r.data.length; i++) {
          self._contacts.push (r.data[i]);
        }
        request ++;
        if (request === 2 && util.isFunction (self._end_login)) {
          self._end_login.call (this);
          self._end_login = null;
        }
      });
    }
  
  });

  ViadeoUser.CONNECT_MSG_STR =
    " participant à TEDxParis, désire être en contact avec vous."
  
  ViadeoUser.INVITE_MSG_STR =
    " participant à TEDxParis, vous invite à le rejoindre sur Viadeo."
 
  return ViadeoUser;
});