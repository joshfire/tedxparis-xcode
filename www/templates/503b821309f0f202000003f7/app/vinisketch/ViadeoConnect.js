// (c) 2012 David Thevenin, ViniSketch pour JoshFire

function ViadeoConnect () {
	if (window.plugins.childBrowser == null) {
		ChildBrowser.install();
	}
}

ViadeoConnect.prototype.connect = function (clb, params) {
  VD.getLoginStatus(function(r) {
    if (!r.session) {
      window.plugins.viadeoConnect.login (clb, {
        redirect_uri: "http://www.facebook.com/connect/login_success.html"
      });
    }
    else {
      if (clb) clb();
    }
  });
}

ViadeoConnect.prototype.login = function (clb, params) {

  params = VD.copy(params || {}, {
      client_id: VD._apiKey,
      response_type: "token",
      display: "popup",
      scope: "",
      redirect_uri: document.location.href,
      state: "vdauth_" + VD.guid()
  });
  
  this.onConnect = clb;
	this.redirect_uri = params.redirect_uri;
	
	var authorize_url  = VD.Auth.authorizeUrl + "?" + VD.QS.encode (params);

	window.plugins.childBrowser.showWebPage (authorize_url);
	var self = this;
	window.plugins.childBrowser.onLocationChange = function (loc) {
	  self.onLocationChange (loc);
	};
	window.plugins.childBrowser.onClose = function () {
    VD.getLoginStatus(function(r) {
      if (!r.session) if (clb) clb ("Erreur de connexion");
    });
	};
}

ViadeoConnect.prototype.onLocationChange = function (newLoc) {

  // Parse URL parameters
  function decode (url) {
    var result = {}, piece = url.split ("&"),i, key_value;
    
    for (i = 0; i < piece.length; i++) {
      key_value = piece[i].split ("=", 2);
      if (key_value && key_value[0]) {
      result [decodeURIComponent (key_value[0])] =
        key_value [1] ? decodeURIComponent (
          key_value [1].replace(/\+/g, "%20")) : ""
      }
    }
    return result
  }
  
  // retrieve auth parameters and close the child window. 
	if (newLoc.indexOf (this.redirect_uri) == 0)
	{
		var result = unescape(newLoc).split("?")[1];
		result = unescape(result);
		
		var params = decode (result);
    if ("access_token" in params) {
      VD.Auth.setSession (params, "connected")
    }
    else {
      VD.Auth.setSession (null, "notConnected")
    }
	
		window.plugins.childBrowser.close ();
    if (this.onConnect) this.onConnect ();
	}
}

ViadeoConnect.install = function ()
{
	if(!window.plugins)
	{
		window.plugins = {};	
	}
	window.plugins.viadeoConnect = new ViadeoConnect();
	return window.plugins.viadeoConnect;
}