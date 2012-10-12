if (!this.JSON) {
    this.JSON = {}
}(function () {
    function f(n) {
        return n < 10 ? "0" + n : n
    }
    if (typeof Date.prototype.toJSON !== "function") {
        Date.prototype.toJSON = function (key) {
            return isFinite(this.valueOf()) ? this.getUTCFullYear() + "-" + f(this.getUTCMonth() + 1) + "-" + f(this.getUTCDate()) + "T" + f(this.getUTCHours()) + ":" + f(this.getUTCMinutes()) + ":" + f(this.getUTCSeconds()) + "Z" : null
        };
        String.prototype.toJSON = Number.prototype.toJSON = Boolean.prototype.toJSON = function (key) {
            return this.valueOf()
        }
    }
    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap, indent, meta = {
            "\b": "\\b",
            "\t": "\\t",
            "\n": "\\n",
            "\f": "\\f",
            "\r": "\\r",
            '"': '\\"',
            "\\": "\\\\"
        }, rep;

    function quote(string) {
        escapable.lastIndex = 0;
        return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
            var c = meta[a];
            return typeof c === "string" ? c : "\\u" + ("0000" + a.charCodeAt(0).toString(16)).slice(-4)
        }) + '"' : '"' + string + '"'
    }
    function str(key, holder) {
        var i, k, v, length, mind = gap,
            partial, value = holder[key];
        if (value && typeof value === "object" && typeof value.toJSON === "function") {
            value = value.toJSON(key)
        }
        if (typeof rep === "function") {
            value = rep.call(holder, key, value)
        }
        switch (typeof value) {
        case "string":
            return quote(value);
        case "number":
            return isFinite(value) ? String(value) : "null";
        case "boolean":
        case "null":
            return String(value);
        case "object":
            if (!value) {
                return "null"
            }
            gap += indent;
            partial = [];
            if (Object.prototype.toString.apply(value) === "[object Array]") {
                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || "null"
                }
                v = partial.length === 0 ? "[]" : gap ? "[\n" + gap + partial.join(",\n" + gap) + "\n" + mind + "]" : "[" + partial.join(",") + "]";
                gap = mind;
                return v
            }
            if (rep && typeof rep === "object") {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    k = rep[i];
                    if (typeof k === "string") {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ": " : ":") + v)
                        }
                    }
                }
            } else {
                for (k in value) {
                    if (Object.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ": " : ":") + v)
                        }
                    }
                }
            }
            v = partial.length === 0 ? "{}" : gap ? "{\n" + gap + partial.join(",\n" + gap) + "\n" + mind + "}" : "{" + partial.join(",") + "}";
            gap = mind;
            return v
        }
    }
    if (typeof JSON.stringify !== "function") {
        JSON.stringify = function (value, replacer, space) {
            var i;
            gap = "";
            indent = "";
            if (typeof space === "number") {
                for (i = 0; i < space; i += 1) {
                    indent += " "
                }
            } else {
                if (typeof space === "string") {
                    indent = space
                }
            }
            rep = replacer;
            if (replacer && typeof replacer !== "function" && (typeof replacer !== "object" || typeof replacer.length !== "number")) {
                throw new Error("JSON.stringify")
            }
            return str("", {
                "": value
            })
        }
    }
    if (typeof JSON.parse !== "function") {
        JSON.parse = function (text, reviver) {
            var j;

            function walk(holder, key) {
                var k, v, value = holder[key];
                if (value && typeof value === "object") {
                    for (k in value) {
                        if (Object.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v
                            } else {
                                delete value[k]
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value)
            }
            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return "\\u" + ("0000" + a.charCodeAt(0).toString(16)).slice(-4)
                })
            }
            if (/^[\],:{}\s]*$/.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, "@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, "]").replace(/(?:^|:|,)(?:\s*\[)+/g, ""))) {
                j = eval("(" + text + ")");
                return typeof reviver === "function" ? walk({
                    "": j
                }, "") : j
            }
            throw new SyntaxError("JSON.parse")
        }
    }
}());
if (!window.VD) {
    VD = {
        _apiKey: null,
        _session: null,
        _userStatus: "unknown",
        _logging: true,
        copy: function (e, d, b, a) {
            for (var c in d) {
                if (b || typeof e[c] === "undefined") {
                    e[c] = a ? a(d[c]) : d[c]
                }
            }
            return e
        },
        create: function (d, g) {
            var f = window.VD,
                a = d ? d.split(".") : [],
                j = a.length;
            for (var e = 0; e < j; e++) {
                var b = a[e];
                var h = f[b];
                if (!h) {
                    h = (g && e + 1 == j) ? g : {};
                    f[b] = h
                }
                f = h
            }
            return f
        },
        provide: function (c, b, a) {
            return VD.copy(typeof c == "string" ? VD.create(c) : c, b, a)
        },
        guid: function () {
            return "f" + (Math.random() * (1 << 30)).toString(16).replace(".", "")
        },
        log: function (a) {
            if (VD._logging) {
                if (window.Debug && window.Debug.writeln) {
                    window.Debug.writeln(a)
                } else {
                    if (window.console) {
                        window.console.log(a)
                    }
                }
            }
            if (VD.Event) {
                VD.Event.fire("vd.log", a)
            }
        },
        error: function (a) {
            if (window.console) {
                window.console.error(a)
            }
            if (VD.Event) {
                VD.Event.fire("vd.error", a)
            }
        },
        $: function (a) {
            return document.getElementById(a)
        }
    }
};
VD.provide("JSON", {
    stringify: function (a) {
        if (window.Prototype && Object.toJSON) {
            return Object.toJSON(a)
        } else {
            return JSON.stringify(a)
        }
    },
    parse: function (a) {
        return JSON.parse(a)
    },
    flatten: function (c) {
        var d = {};
        for (var a in c) {
            if (c.hasOwnProperty(a)) {
                var b = c[a];
                if (null === b || undefined === b) {
                    continue
                } else {
                    if (typeof b == "string") {
                        d[a] = b
                    } else {
                        d[a] = VD.JSON.stringify(b)
                    }
                }
            }
        }
        return d
    }
});
VD.provide("Array", {
    indexOf: function (a, d) {
        if (a.indexOf) {
            return a.indexOf(d)
        }
        var c = a.length;
        if (c) {
            for (var b = 0; b < c; b++) {
                if (a[b] === d) {
                    return b
                }
            }
        }
        return -1
    },
    merge: function (c, b) {
        for (var a = 0; a < b.length; a++) {
            if (VD.Array.indexOf(c, b[a]) < 0) {
                c.push(b[a])
            }
        }
        return c
    },
    filter: function (c, e) {
        var a = [];
        for (var d = 0; d < c.length; d++) {
            if (e(c[d])) {
                a.push(c[d])
            }
        }
        return a
    },
    keys: function (d, c) {
        var a = [];
        for (var b in d) {
            if (c || d.hasOwnProperty(b)) {
                a.push(b)
            }
        }
        return a
    },
    map: function (a, c) {
        var b = [];
        for (var d = 0; d < a.length; d++) {
            b.push(c(a[d]))
        }
        return b
    },
    forEach: function (f, d, e) {
        if (!f) {
            return
        }
        if (Object.prototype.toString.apply(f) === "[object Array]" || (!(f instanceof Function) && typeof f.length == "number")) {
            if (f.forEach) {
                f.forEach(d)
            } else {
                for (var c = 0, a = f.length; c < a; c++) {
                    d(f[c], c, f)
                }
            }
        } else {
            for (var b in f) {
                if (e || f.hasOwnProperty(b)) {
                    d(f[b], b, f)
                }
            }
        }
    }
});
VD.provide("Cookie", {
    _domain: null,
    _enabled: false,
    setEnabled: function (a) {
        VD.Cookie._enabled = a
    },
    getEnabled: function () {
        return VD.Cookie._enabled
    },
    load: function () {
        var a = document.cookie.match("\\bvds_" + VD._apiKey + '="([^;]*)\\b'),
            b;
        if (a) {
            b = VD.QS.decode(a[1]);
            b.expires = parseInt(b.expires, 10);
            VD.Cookie._domain = b.base_domain
        }
        return b
    },
    setRaw: function (c, a, b) {
        document.cookie = "vds_" + VD._apiKey + '="' + c + '"' + (c && a == 0 ? "" : "; expires=" + new Date(a * 1000).toGMTString()) + "; path=/" + (b ? "; domain=." + b : "");
        VD.Cookie._domain = b
    },
    set: function (a) {
        if (a) {
            if (isNaN(a.expires)) {
                a.expires = 11352960000
            }
            VD.Cookie.setRaw(VD.QS.encode(a), a.expires, a.base_domain)
        } else {
            VD.Cookie.clear()
        }
    },
    clear: function () {
        VD.Cookie.setRaw("", 0, VD.Cookie._domain)
    }
});
VD.provide("EventProvider", {
    subscribers: function () {
        if (!this._subscribersMap) {
            this._subscribersMap = {}
        }
        return this._subscribersMap
    },
    subscribe: function (b, a) {
        var c = this.subscribers();
        if (!c[b]) {
            c[b] = [a]
        } else {
            c[b].push(a)
        }
    },
    unsubscribe: function (b, a) {
        var c = this.subscribers()[b];
        VD.Array.forEach(c, function (e, d) {
            if (e == a) {
                c[d] = null
            }
        })
    },
    monitor: function (b, d) {
        if (!d()) {
            var a = this,
                c = function () {
                    if (d.apply(d, arguments)) {
                        a.unsubscribe(b, c)
                    }
                };
            this.subscribe(b, c)
        }
    },
    clear: function (a) {
        delete this.subscribers()[a]
    },
    fire: function () {
        var b = Array.prototype.slice.call(arguments),
            a = b.shift();
        VD.Array.forEach(this.subscribers()[a], function (c) {
            if (c) {
                c.apply(this, b)
            }
        })
    }
});
VD.provide("Event", VD.EventProvider);
VD.provide("", {
    init: function (a) {
        a = VD.copy(a || {}, {
            logging: true
        });
        VD._apiKey = a.apiKey;
        if (!a.logging && window.location.toString().indexOf("vd_debug=1") < 0) {
            VD._logging = false
        }
        if (VD._apiKey) {
            VD.Cookie.setEnabled(a.cookie);
            a.session = a.session || VD.Auth._receivedSession || VD.Cookie.load();
            VD.Auth.setSession(a.session, a.session ? "connected" : "unknown");
            if (a.status) {
                VD.getLoginStatus()
            }
        }
    }
});
window.setTimeout(function () {
    if (window.vdAsyncInit) {
        vdAsyncInit()
    }
}, 0);
VD.provide("QS", {
    encode: function (d, a, b) {
        a = a === undefined ? "&" : a;
        b = b === false ? function (e) {
            return e
        } : encodeURIComponent;
        var c = [];
        VD.Array.forEach(d, function (f, e) {
            if (f !== null && typeof f != "undefined") {
                c.push(b(e) + "=" + b(f))
            }
        });
        c.sort();
        return c.join(a)
    },
    decode: function (f) {
        var c = decodeURIComponent,
            e = {}, b = f.split("&"),
            a, d;
        for (a = 0; a < b.length; a++) {
            d = b[a].split("=", 2);
            if (d && d[0]) {
                e[c(d[0])] = d[1] ? c(d[1].replace(/\+/g, "%20")) : ""
            }
        }
        return e
    }
});
VD.provide("", {
    api: function () {
        VD.ApiServer.call.apply(VD.ApiServer, arguments)
    }
});
VD.provide("ApiServer", {
    METHODS: ["get", "post", "put", "delete"],
    endpoint: "https://api.viadeo.com/",
    _callbacks: {},
    call: function () {
        var b = Array.prototype.slice.call(arguments),
            e = b.shift(),
            d = b.shift(),
            g, f, a;
        while (d) {
            var c = typeof d;
            if (c === "string" && !g) {
                g = d.toLowerCase()
            } else {
                if (c === "function" && !a) {
                    a = d
                } else {
                    if (c === "object" && !f) {
                        f = d
                    } else {
                        VD.log("Invalid argument passed to VD.api(): " + d);
                        return
                    }
                }
            }
            d = b.shift()
        }
        g = g || "get";
        f = f || {};
        if (e[0] === "/") {
            e = e.substr(1)
        }
        if (VD.Array.indexOf(VD.ApiServer.METHODS, g) < 0) {
            VD.log("Invalid method passed to VD.api(): " + g);
            return
        }
        VD.ApiServer.oauthRequest(e, g, f, a)
    },
    oauthRequest: function (c, e, d, a) {
        if (VD.getSession) {
            var b = VD.getSession();
            if (b && b.access_token && !d.access_token) {
                d.access_token = b.access_token
            }
        }
        VD.ApiServer.jsonp(c, e, VD.JSON.flatten(d), a)
    },
    jsonp: function (e, h, f, a) {
        var d = VD.guid(),
            b = document.createElement("script");
        f.method = h;
        f.jsonp = "VD.ApiServer._callbacks." + d;
        var c = (VD.ApiServer.endpoint + e + (e.indexOf("?") > -1 ? "&" : "?") + VD.QS.encode(f));
        if (c.length > 2000) {
            throw new Error("JSONP only support a maximum of 2000 bytes of input.")
        }
        VD.ApiServer._callbacks[d] = function (g) {
            a && a(g);
            delete VD.ApiServer._callbacks[d];
            b.src = null;
            b.parentNode.removeChild(b)
        };
        b.src = c;
        document.getElementsByTagName("head")[0].appendChild(b)
    }
});
VD.provide("", {
    getLoginStatus: function (a) {
        if (a) {
            a({
                status: VD._userStatus,
                session: VD._session
            })
        }
    },
    getSession: function () {
        if (VD._session && "expires" in VD._session && new Date().getTime() > VD._session.expires * 1000) {
            VD.Auth.setSession(null, "notConnected")
        }
        return VD._session
    },
    login: function (g, a) {
        var f = typeof window.screenX != "undefined" ? window.screenX : window.screenLeft,
            d = typeof window.screenY != "undefined" ? window.screenY : window.screenTop,
            l = typeof window.outerWidth != "undefined" ? window.outerWidth : document.documentElement.clientWidth,
            j = typeof window.outerHeight != "undefined" ? window.outerHeight : (document.documentElement.clientHeight - 22),
            b = 780,
            k = 450,
            e = parseInt(f + ((l - b) / 2), 10),
            i = parseInt(d + ((j - k) / 2.5), 10),
            c = "width=" + b + ",height=" + k + ",left=" + e + ",top=" + i;
        a = VD.copy(a || {}, {
            client_id: VD._apiKey,
            response_type: "token",
            display: "popup",
            scope: "",
            redirect_uri: document.location.href,
            state: "vdauth_" + VD.guid()
        });
        if (a.display === "popup") {
            var h = window.open(VD.Auth.authorizeUrl + "?" + VD.QS.encode(a), "vdauth", c);
            if (g) {
                VD.Auth._active[a.state] = {
                    cb: g,
                    win: h
                };
                VD.Auth._popupMonitor()
            }
        } else {
            location.href = VD.Auth.authorizeUrl + "?" + VD.QS.encode(a)
        }
    },
    logout: function (a) {
        VD.Auth.setSession(null, "notConnected")
    }
});
VD.provide("Auth", {
    authorizeUrl: "https://secure.viadeo.com/oauth-provider/authorize2",
    _active: {},
    _receivedSession: null,
    readFragment: function () {
        var b = window.location.href.replace("?", "#"),
            a = b.substr(b.lastIndexOf("#") + 1);
        if (a.indexOf("access_token=") >= 0 || a.indexOf("error=") >= 0) {
            var c = VD.QS.decode(a);
            if (window.opener && window.opener.VD.Auth.setSession && window.name == "vdauth" && window.opener.name != "vdauth") {
                document.documentElement.style.display = "none";
                window.opener.VD.Auth.recvSession(c)
            } else {
                if (c && ("state" in c) && c.state.indexOf("vdauth_") == 0) {
                    if ("access_token" in c) {
                        VD.Auth._receivedSession = c
                    }
                    window.location.hash = b.substr(0, b.lastIndexOf("#"))
                }
            }
        }
    },
    recvSession: function (a) {
        if (!a) {
            VD.error("Received invalid session")
        }
        if ("error" in a) {
            VD.error("Received auth error `" + a.error + "': " + a.error_description)
        }
        if (!("state" in a)) {
            VD.error("Received a session with not `state' field");
            return
        }
        if (!(a.state in VD.Auth._active)) {
            VD.error("Received a session from an inactive window");
            return
        }
        VD.Auth._active[a.state].session = a
    },
    setSession: function (h, c) {
        var e = !VD._session && h,
            b = VD._session && !h,
            g = false,
            a = e || b || (VD._session && h && VD._session.access_token != h.access_token),
            f = c != VD._userStatus;
        if (h && "expires_in" in h) {
            h.expires = Math.round(new Date().getTime() / 1000) + parseInt(h.expires_in, 10);
            delete h.expires_in
        }
        var d = {
            session: h,
            status: c
        };
        VD._session = h;
        VD._userStatus = c;
        if (a && VD.Cookie && VD.Cookie.getEnabled()) {
            VD.Cookie.set(h)
        }
        if (f) {
            VD.Event.fire("auth.statusChange", d)
        }
        if (b || g) {
            VD.Event.fire("auth.logout", d)
        }
        if (e || g) {
            VD.Event.fire("auth.login", d)
        }
        if (a) {
            VD.Event.fire("auth.sessionChange", d)
        }
        return d
    },
    _popupMonitor: function () {
        for (var f in VD.Auth._active) {
            if ("win" in VD.Auth._active[f]) {
                try {
                    if (VD.Auth._active[f].win.closed) {
                        delete VD.Auth._active[f].win;
                        VD.Auth.recvSession({
                            error: "access_denied",
                            error_description: "Client closed the window",
                            state: f
                        })
                    }
                } catch (d) {}
            }
            if ("session" in VD.Auth._active[f]) {
                var a = VD.Auth._active[f];
                delete VD.Auth._active[f];
                var c = a.session;
                if ("access_token" in c) {
                    VD.Auth.setSession(c, "connected")
                } else {
                    VD.Auth.setSession(null, "notConnected")
                }
                if ("win" in a) {
                    a.win.close()
                }
                if ("cb" in a) {
                    a.cb({
                        status: VD._userStatus,
                        session: VD._session
                    })
                }
            }
        }
        var b = false;
        for (var f in VD.Auth._active) {
            b = true;
            break
        }
        if (b && !VD.Auth._popupInterval) {
            VD.Auth._popupInterval = window.setInterval(VD.Auth._popupMonitor, 100)
        } else {
            if (!b && VD.Auth._popupInterval) {
                window.clearInterval(VD.Auth._popupInterval);
                VD.Auth._popupInterval = null
            }
        }
    }
});
VD.Auth.readFragment();