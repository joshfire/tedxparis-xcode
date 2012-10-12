// (c) 2012 David Thevenin, ViniSketch pour JoshFire

define (['vs', 'vs_core', 'joshlib!vendor/underscore'],
function (vs, core, _) {


var Base64 = {
 
  // private property
  _keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
 
  // public method for encoding
  encode : function (input) {
    var output = "";
    var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
    var i = 0;
 
    input = Base64._utf8_encode(input);
 
    while (i < input.length) {
 
      chr1 = input.charCodeAt(i++);
      chr2 = input.charCodeAt(i++);
      chr3 = input.charCodeAt(i++);
 
      enc1 = chr1 >> 2;
      enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
      enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
      enc4 = chr3 & 63;
 
      if (isNaN(chr2)) {
        enc3 = enc4 = 64;
      } else if (isNaN(chr3)) {
        enc4 = 64;
      }
 
      output = output +
      this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
      this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);
 
    }
 
    return output;
  },
 
  // public method for decoding
  decode : function (input) {
    var output = "";
    var chr1, chr2, chr3;
    var enc1, enc2, enc3, enc4;
    var i = 0;
 
    input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
 
    while (i < input.length) {
 
      enc1 = this._keyStr.indexOf(input.charAt(i++));
      enc2 = this._keyStr.indexOf(input.charAt(i++));
      enc3 = this._keyStr.indexOf(input.charAt(i++));
      enc4 = this._keyStr.indexOf(input.charAt(i++));
 
      chr1 = (enc1 << 2) | (enc2 >> 4);
      chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
      chr3 = ((enc3 & 3) << 6) | enc4;
 
      output = output + String.fromCharCode(chr1);
 
      if (enc3 != 64) {
        output = output + String.fromCharCode(chr2);
      }
      if (enc4 != 64) {
        output = output + String.fromCharCode(chr3);
      }
 
    }
 
    output = Base64._utf8_decode(output);
 
    return output;
 
  },
 
  // private method for UTF-8 encoding
  _utf8_encode : function (string) {
    string = string.replace(/\r\n/g,"\n");
    var utftext = "";
 
    for (var n = 0; n < string.length; n++) {
 
      var c = string.charCodeAt(n);
 
      if (c < 128) {
        utftext += String.fromCharCode(c);
      }
      else if((c > 127) && (c < 2048)) {
        utftext += String.fromCharCode((c >> 6) | 192);
        utftext += String.fromCharCode((c & 63) | 128);
      }
      else {
        utftext += String.fromCharCode((c >> 12) | 224);
        utftext += String.fromCharCode(((c >> 6) & 63) | 128);
        utftext += String.fromCharCode((c & 63) | 128);
      }
 
    }
 
    return utftext;
  },
 
  // private method for UTF-8 decoding
  _utf8_decode : function (utftext) {
    var string = "";
    var i = 0;
    var c = c1 = c2 = 0;
 
    while ( i < utftext.length ) {
 
      c = utftext.charCodeAt(i);
 
      if (c < 128) {
        string += String.fromCharCode(c);
        i++;
      }
      else if((c > 191) && (c < 224)) {
        c2 = utftext.charCodeAt(i+1);
        string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
        i += 2;
      }
      else {
        c2 = utftext.charCodeAt(i+1);
        c3 = utftext.charCodeAt(i+2);
        string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
        i += 3;
      }
 
    }
 
    return string;
  }
 
}


var rot13 = function(s ){
  return s.replace(/[a-zA-Z]/g, function(c){
      return String.fromCharCode((c <= "Z" ? 90 : 122) >= (c = c.charCodeAt(0) + 13) ? c : c - 26);
  });
};

  /******************************************************
   *  TedXParcipant Class
   *
   *****************************************************/
  var TedXParcipant = core.createClass ({
  
    parent: core.Model,
  
    properties : {
      firstname: core.Object.PROPERTY_IN_OUT,
      lastname: core.Object.PROPERTY_IN_OUT,
      company: core.Object.PROPERTY_IN_OUT,
      position: core.Object.PROPERTY_IN_OUT,
      viadeoId: core.Object.PROPERTY_IN_OUT,
      imgUrl: core.Object.PROPERTY_IN_OUT,
      connected: core.Object.PROPERTY_IN_OUT,
      email: core.Object.PROPERTY_IN_OUT,
    }
  });
  
  /******************************************************
   *
   *
   *****************************************************/
  TedXParcipant.getAllParticipants = function (clb) {

    $.ajaxJSONP({
      url: 'http://tedxparis-backend.herokuapp.com/participants?callback=?',
      success: function (event){
        var result = {};
        var data = event.data;
        
        // Tri les participants par odre de nom / prénom croissant
        data = data.sort (function (a,b) {
          var x = a[1].toLowerCase(), y = b[1].toLowerCase();  
          var xx = a[2].toLowerCase(), yy = b[2].toLowerCase();  
          return x < y ? -1 : x > y ? 1 :
            xx < yy ? -1 : xx > yy ? 1 : 0; 
        });
        
        // data is a js object, such as Object or Array
        var title = "", items;
        
        for (i = 0; i < data.length; i++) {
          var info = data [i];
          
          // creation du titre de liste
          var firstLetter = info[1][0].toUpperCase();
          if (firstLetter !== title) {
            title = firstLetter;
            items = [];
            result [title] = items;
         }
          
         var pos = info [4];
         if (pos.length && info [3]) pos +=", ";
         pos += info[3];

          items.push (new TedXParcipant ({
            id: info [0],
            firstname: vs.util.capitalize (info [1]),
            lastname: vs.util.capitalize (info [2]),
            company: info [3],
            position: pos,
            viadeoId: (info [5])?info [5]:"",
            imgUrl: (info [6])?info [6]:"",
            email: Base64.decode(rot13(info [7])),
            connected: false
          }).init ());
        }
        if (clb) clb (result);
      },
      error: function(){
        // data is a js object, such as Object or Array
        if (clb) clb (null)
      }
    })

  }

  return TedXParcipant;
});