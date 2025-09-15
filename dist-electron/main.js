import M from "fs";
import wt from "constants";
import vt from "stream";
import gt from "util";
import bt from "assert";
import p from "path";
import { app as Ru, ipcMain as Y, shell as Pt, BrowserWindow as $t } from "electron";
import { fileURLToPath as kt } from "url";
var Xu = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {};
function Ot(u) {
  return u && u.__esModule && Object.prototype.hasOwnProperty.call(u, "default") ? u.default : u;
}
var uu = {}, J = {};
J.fromCallback = function(u) {
  return Object.defineProperty(function(...e) {
    if (typeof e[e.length - 1] == "function") u.apply(this, e);
    else
      return new Promise((t, n) => {
        e.push((r, i) => r != null ? n(r) : t(i)), u.apply(this, e);
      });
  }, "name", { value: u.name });
};
J.fromPromise = function(u) {
  return Object.defineProperty(function(...e) {
    const t = e[e.length - 1];
    if (typeof t != "function") return u.apply(this, e);
    e.pop(), u.apply(this, e).then((n) => t(null, n), t);
  }, "name", { value: u.name });
};
var au = wt, xt = process.cwd, ju = null, _t = process.env.GRACEFUL_FS_PLATFORM || process.platform;
process.cwd = function() {
  return ju || (ju = xt.call(process)), ju;
};
try {
  process.cwd();
} catch {
}
if (typeof process.chdir == "function") {
  var Ae = process.chdir;
  process.chdir = function(u) {
    ju = null, Ae.call(process, u);
  }, Object.setPrototypeOf && Object.setPrototypeOf(process.chdir, Ae);
}
var It = Nt;
function Nt(u) {
  au.hasOwnProperty("O_SYMLINK") && process.version.match(/^v0\.6\.[0-2]|^v0\.5\./) && e(u), u.lutimes || t(u), u.chown = i(u.chown), u.fchown = i(u.fchown), u.lchown = i(u.lchown), u.chmod = n(u.chmod), u.fchmod = n(u.fchmod), u.lchmod = n(u.lchmod), u.chownSync = o(u.chownSync), u.fchownSync = o(u.fchownSync), u.lchownSync = o(u.lchownSync), u.chmodSync = r(u.chmodSync), u.fchmodSync = r(u.fchmodSync), u.lchmodSync = r(u.lchmodSync), u.stat = a(u.stat), u.fstat = a(u.fstat), u.lstat = a(u.lstat), u.statSync = F(u.statSync), u.fstatSync = F(u.fstatSync), u.lstatSync = F(u.lstatSync), u.chmod && !u.lchmod && (u.lchmod = function(c, l, A) {
    A && process.nextTick(A);
  }, u.lchmodSync = function() {
  }), u.chown && !u.lchown && (u.lchown = function(c, l, A, C) {
    C && process.nextTick(C);
  }, u.lchownSync = function() {
  }), _t === "win32" && (u.rename = typeof u.rename != "function" ? u.rename : function(c) {
    function l(A, C, y) {
      var f = Date.now(), E = 0;
      c(A, C, function s(w) {
        if (w && (w.code === "EACCES" || w.code === "EPERM" || w.code === "EBUSY") && Date.now() - f < 6e4) {
          setTimeout(function() {
            u.stat(C, function(v, P) {
              v && v.code === "ENOENT" ? c(A, C, s) : y(w);
            });
          }, E), E < 100 && (E += 10);
          return;
        }
        y && y(w);
      });
    }
    return Object.setPrototypeOf && Object.setPrototypeOf(l, c), l;
  }(u.rename)), u.read = typeof u.read != "function" ? u.read : function(c) {
    function l(A, C, y, f, E, s) {
      var w;
      if (s && typeof s == "function") {
        var v = 0;
        w = function(P, R, ru) {
          if (P && P.code === "EAGAIN" && v < 10)
            return v++, c.call(u, A, C, y, f, E, w);
          s.apply(this, arguments);
        };
      }
      return c.call(u, A, C, y, f, E, w);
    }
    return Object.setPrototypeOf && Object.setPrototypeOf(l, c), l;
  }(u.read), u.readSync = typeof u.readSync != "function" ? u.readSync : /* @__PURE__ */ function(c) {
    return function(l, A, C, y, f) {
      for (var E = 0; ; )
        try {
          return c.call(u, l, A, C, y, f);
        } catch (s) {
          if (s.code === "EAGAIN" && E < 10) {
            E++;
            continue;
          }
          throw s;
        }
    };
  }(u.readSync);
  function e(c) {
    c.lchmod = function(l, A, C) {
      c.open(
        l,
        au.O_WRONLY | au.O_SYMLINK,
        A,
        function(y, f) {
          if (y) {
            C && C(y);
            return;
          }
          c.fchmod(f, A, function(E) {
            c.close(f, function(s) {
              C && C(E || s);
            });
          });
        }
      );
    }, c.lchmodSync = function(l, A) {
      var C = c.openSync(l, au.O_WRONLY | au.O_SYMLINK, A), y = !0, f;
      try {
        f = c.fchmodSync(C, A), y = !1;
      } finally {
        if (y)
          try {
            c.closeSync(C);
          } catch {
          }
        else
          c.closeSync(C);
      }
      return f;
    };
  }
  function t(c) {
    au.hasOwnProperty("O_SYMLINK") && c.futimes ? (c.lutimes = function(l, A, C, y) {
      c.open(l, au.O_SYMLINK, function(f, E) {
        if (f) {
          y && y(f);
          return;
        }
        c.futimes(E, A, C, function(s) {
          c.close(E, function(w) {
            y && y(s || w);
          });
        });
      });
    }, c.lutimesSync = function(l, A, C) {
      var y = c.openSync(l, au.O_SYMLINK), f, E = !0;
      try {
        f = c.futimesSync(y, A, C), E = !1;
      } finally {
        if (E)
          try {
            c.closeSync(y);
          } catch {
          }
        else
          c.closeSync(y);
      }
      return f;
    }) : c.futimes && (c.lutimes = function(l, A, C, y) {
      y && process.nextTick(y);
    }, c.lutimesSync = function() {
    });
  }
  function n(c) {
    return c && function(l, A, C) {
      return c.call(u, l, A, function(y) {
        h(y) && (y = null), C && C.apply(this, arguments);
      });
    };
  }
  function r(c) {
    return c && function(l, A) {
      try {
        return c.call(u, l, A);
      } catch (C) {
        if (!h(C)) throw C;
      }
    };
  }
  function i(c) {
    return c && function(l, A, C, y) {
      return c.call(u, l, A, C, function(f) {
        h(f) && (f = null), y && y.apply(this, arguments);
      });
    };
  }
  function o(c) {
    return c && function(l, A, C) {
      try {
        return c.call(u, l, A, C);
      } catch (y) {
        if (!h(y)) throw y;
      }
    };
  }
  function a(c) {
    return c && function(l, A, C) {
      typeof A == "function" && (C = A, A = null);
      function y(f, E) {
        E && (E.uid < 0 && (E.uid += 4294967296), E.gid < 0 && (E.gid += 4294967296)), C && C.apply(this, arguments);
      }
      return A ? c.call(u, l, A, y) : c.call(u, l, y);
    };
  }
  function F(c) {
    return c && function(l, A) {
      var C = A ? c.call(u, l, A) : c.call(u, l);
      return C && (C.uid < 0 && (C.uid += 4294967296), C.gid < 0 && (C.gid += 4294967296)), C;
    };
  }
  function h(c) {
    if (!c || c.code === "ENOSYS")
      return !0;
    var l = !process.getuid || process.getuid() !== 0;
    return !!(l && (c.code === "EINVAL" || c.code === "EPERM"));
  }
}
var ye = vt.Stream, jt = Tt;
function Tt(u) {
  return {
    ReadStream: e,
    WriteStream: t
  };
  function e(n, r) {
    if (!(this instanceof e)) return new e(n, r);
    ye.call(this);
    var i = this;
    this.path = n, this.fd = null, this.readable = !0, this.paused = !1, this.flags = "r", this.mode = 438, this.bufferSize = 64 * 1024, r = r || {};
    for (var o = Object.keys(r), a = 0, F = o.length; a < F; a++) {
      var h = o[a];
      this[h] = r[h];
    }
    if (this.encoding && this.setEncoding(this.encoding), this.start !== void 0) {
      if (typeof this.start != "number")
        throw TypeError("start must be a Number");
      if (this.end === void 0)
        this.end = 1 / 0;
      else if (typeof this.end != "number")
        throw TypeError("end must be a Number");
      if (this.start > this.end)
        throw new Error("start must be <= end");
      this.pos = this.start;
    }
    if (this.fd !== null) {
      process.nextTick(function() {
        i._read();
      });
      return;
    }
    u.open(this.path, this.flags, this.mode, function(c, l) {
      if (c) {
        i.emit("error", c), i.readable = !1;
        return;
      }
      i.fd = l, i.emit("open", l), i._read();
    });
  }
  function t(n, r) {
    if (!(this instanceof t)) return new t(n, r);
    ye.call(this), this.path = n, this.fd = null, this.writable = !0, this.flags = "w", this.encoding = "binary", this.mode = 438, this.bytesWritten = 0, r = r || {};
    for (var i = Object.keys(r), o = 0, a = i.length; o < a; o++) {
      var F = i[o];
      this[F] = r[F];
    }
    if (this.start !== void 0) {
      if (typeof this.start != "number")
        throw TypeError("start must be a Number");
      if (this.start < 0)
        throw new Error("start must be >= zero");
      this.pos = this.start;
    }
    this.busy = !1, this._queue = [], this.fd === null && (this._open = u.open, this._queue.push([this._open, this.path, this.flags, this.mode, void 0]), this.flush());
  }
}
var Lt = Rt, Mt = Object.getPrototypeOf || function(u) {
  return u.__proto__;
};
function Rt(u) {
  if (u === null || typeof u != "object")
    return u;
  if (u instanceof Object)
    var e = { __proto__: Mt(u) };
  else
    var e = /* @__PURE__ */ Object.create(null);
  return Object.getOwnPropertyNames(u).forEach(function(t) {
    Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(u, t));
  }), e;
}
var N = M, Jt = It, Wt = jt, qt = Lt, xu = gt, z, Tu;
typeof Symbol == "function" && typeof Symbol.for == "function" ? (z = Symbol.for("graceful-fs.queue"), Tu = Symbol.for("graceful-fs.previous")) : (z = "___graceful-fs.queue", Tu = "___graceful-fs.previous");
function Ut() {
}
function _e(u, e) {
  Object.defineProperty(u, z, {
    get: function() {
      return e;
    }
  });
}
var Eu = Ut;
xu.debuglog ? Eu = xu.debuglog("gfs4") : /\bgfs4\b/i.test(process.env.NODE_DEBUG || "") && (Eu = function() {
  var u = xu.format.apply(xu, arguments);
  u = "GFS4: " + u.split(/\n/).join(`
GFS4: `), console.error(u);
});
if (!N[z]) {
  var Vt = Xu[z] || [];
  _e(N, Vt), N.close = function(u) {
    function e(t, n) {
      return u.call(N, t, function(r) {
        r || me(), typeof n == "function" && n.apply(this, arguments);
      });
    }
    return Object.defineProperty(e, Tu, {
      value: u
    }), e;
  }(N.close), N.closeSync = function(u) {
    function e(t) {
      u.apply(N, arguments), me();
    }
    return Object.defineProperty(e, Tu, {
      value: u
    }), e;
  }(N.closeSync), /\bgfs4\b/i.test(process.env.NODE_DEBUG || "") && process.on("exit", function() {
    Eu(N[z]), bt.equal(N[z].length, 0);
  });
}
Xu[z] || _e(Xu, N[z]);
var pu = re(qt(N));
process.env.TEST_GRACEFUL_FS_GLOBAL_PATCH && !N.__patched && (pu = re(N), N.__patched = !0);
function re(u) {
  Jt(u), u.gracefulify = re, u.createReadStream = R, u.createWriteStream = ru;
  var e = u.readFile;
  u.readFile = t;
  function t(m, b, g) {
    return typeof b == "function" && (g = b, b = null), V(m, b, g);
    function V(H, W, I, j) {
      return e(H, W, function($) {
        $ && ($.code === "EMFILE" || $.code === "ENFILE") ? yu([V, [H, W, I], $, j || Date.now(), Date.now()]) : typeof I == "function" && I.apply(this, arguments);
      });
    }
  }
  var n = u.writeFile;
  u.writeFile = r;
  function r(m, b, g, V) {
    return typeof g == "function" && (V = g, g = null), H(m, b, g, V);
    function H(W, I, j, $, G) {
      return n(W, I, j, function(_) {
        _ && (_.code === "EMFILE" || _.code === "ENFILE") ? yu([H, [W, I, j, $], _, G || Date.now(), Date.now()]) : typeof $ == "function" && $.apply(this, arguments);
      });
    }
  }
  var i = u.appendFile;
  i && (u.appendFile = o);
  function o(m, b, g, V) {
    return typeof g == "function" && (V = g, g = null), H(m, b, g, V);
    function H(W, I, j, $, G) {
      return i(W, I, j, function(_) {
        _ && (_.code === "EMFILE" || _.code === "ENFILE") ? yu([H, [W, I, j, $], _, G || Date.now(), Date.now()]) : typeof $ == "function" && $.apply(this, arguments);
      });
    }
  }
  var a = u.copyFile;
  a && (u.copyFile = F);
  function F(m, b, g, V) {
    return typeof g == "function" && (V = g, g = 0), H(m, b, g, V);
    function H(W, I, j, $, G) {
      return a(W, I, j, function(_) {
        _ && (_.code === "EMFILE" || _.code === "ENFILE") ? yu([H, [W, I, j, $], _, G || Date.now(), Date.now()]) : typeof $ == "function" && $.apply(this, arguments);
      });
    }
  }
  var h = u.readdir;
  u.readdir = l;
  var c = /^v[0-5]\./;
  function l(m, b, g) {
    typeof b == "function" && (g = b, b = null);
    var V = c.test(process.version) ? function(I, j, $, G) {
      return h(I, H(
        I,
        j,
        $,
        G
      ));
    } : function(I, j, $, G) {
      return h(I, j, H(
        I,
        j,
        $,
        G
      ));
    };
    return V(m, b, g);
    function H(W, I, j, $) {
      return function(G, _) {
        G && (G.code === "EMFILE" || G.code === "ENFILE") ? yu([
          V,
          [W, I, j],
          G,
          $ || Date.now(),
          Date.now()
        ]) : (_ && _.sort && _.sort(), typeof j == "function" && j.call(this, G, _));
      };
    }
  }
  if (process.version.substr(0, 4) === "v0.8") {
    var A = Wt(u);
    s = A.ReadStream, v = A.WriteStream;
  }
  var C = u.ReadStream;
  C && (s.prototype = Object.create(C.prototype), s.prototype.open = w);
  var y = u.WriteStream;
  y && (v.prototype = Object.create(y.prototype), v.prototype.open = P), Object.defineProperty(u, "ReadStream", {
    get: function() {
      return s;
    },
    set: function(m) {
      s = m;
    },
    enumerable: !0,
    configurable: !0
  }), Object.defineProperty(u, "WriteStream", {
    get: function() {
      return v;
    },
    set: function(m) {
      v = m;
    },
    enumerable: !0,
    configurable: !0
  });
  var f = s;
  Object.defineProperty(u, "FileReadStream", {
    get: function() {
      return f;
    },
    set: function(m) {
      f = m;
    },
    enumerable: !0,
    configurable: !0
  });
  var E = v;
  Object.defineProperty(u, "FileWriteStream", {
    get: function() {
      return E;
    },
    set: function(m) {
      E = m;
    },
    enumerable: !0,
    configurable: !0
  });
  function s(m, b) {
    return this instanceof s ? (C.apply(this, arguments), this) : s.apply(Object.create(s.prototype), arguments);
  }
  function w() {
    var m = this;
    Vu(m.path, m.flags, m.mode, function(b, g) {
      b ? (m.autoClose && m.destroy(), m.emit("error", b)) : (m.fd = g, m.emit("open", g), m.read());
    });
  }
  function v(m, b) {
    return this instanceof v ? (y.apply(this, arguments), this) : v.apply(Object.create(v.prototype), arguments);
  }
  function P() {
    var m = this;
    Vu(m.path, m.flags, m.mode, function(b, g) {
      b ? (m.destroy(), m.emit("error", b)) : (m.fd = g, m.emit("open", g));
    });
  }
  function R(m, b) {
    return new u.ReadStream(m, b);
  }
  function ru(m, b) {
    return new u.WriteStream(m, b);
  }
  var St = u.open;
  u.open = Vu;
  function Vu(m, b, g, V) {
    return typeof g == "function" && (V = g, g = null), H(m, b, g, V);
    function H(W, I, j, $, G) {
      return St(W, I, j, function(_, bi) {
        _ && (_.code === "EMFILE" || _.code === "ENFILE") ? yu([H, [W, I, j, $], _, G || Date.now(), Date.now()]) : typeof $ == "function" && $.apply(this, arguments);
      });
    }
  }
  return u;
}
function yu(u) {
  Eu("ENQUEUE", u[0].name, u[1]), N[z].push(u), ie();
}
var _u;
function me() {
  for (var u = Date.now(), e = 0; e < N[z].length; ++e)
    N[z][e].length > 2 && (N[z][e][3] = u, N[z][e][4] = u);
  ie();
}
function ie() {
  if (clearTimeout(_u), _u = void 0, N[z].length !== 0) {
    var u = N[z].shift(), e = u[0], t = u[1], n = u[2], r = u[3], i = u[4];
    if (r === void 0)
      Eu("RETRY", e.name, t), e.apply(null, t);
    else if (Date.now() - r >= 6e4) {
      Eu("TIMEOUT", e.name, t);
      var o = t.pop();
      typeof o == "function" && o.call(null, n);
    } else {
      var a = Date.now() - i, F = Math.max(i - r, 1), h = Math.min(F * 1.2, 100);
      a >= h ? (Eu("RETRY", e.name, t), e.apply(null, t.concat([r]))) : N[z].push(u);
    }
    _u === void 0 && (_u = setTimeout(ie, 0));
  }
}
(function(u) {
  const e = J.fromCallback, t = pu, n = [
    "access",
    "appendFile",
    "chmod",
    "chown",
    "close",
    "copyFile",
    "cp",
    "fchmod",
    "fchown",
    "fdatasync",
    "fstat",
    "fsync",
    "ftruncate",
    "futimes",
    "glob",
    "lchmod",
    "lchown",
    "lutimes",
    "link",
    "lstat",
    "mkdir",
    "mkdtemp",
    "open",
    "opendir",
    "readdir",
    "readFile",
    "readlink",
    "realpath",
    "rename",
    "rm",
    "rmdir",
    "stat",
    "statfs",
    "symlink",
    "truncate",
    "unlink",
    "utimes",
    "writeFile"
  ].filter((r) => typeof t[r] == "function");
  Object.assign(u, t), n.forEach((r) => {
    u[r] = e(t[r]);
  }), u.exists = function(r, i) {
    return typeof i == "function" ? t.exists(r, i) : new Promise((o) => t.exists(r, o));
  }, u.read = function(r, i, o, a, F, h) {
    return typeof h == "function" ? t.read(r, i, o, a, F, h) : new Promise((c, l) => {
      t.read(r, i, o, a, F, (A, C, y) => {
        if (A) return l(A);
        c({ bytesRead: C, buffer: y });
      });
    });
  }, u.write = function(r, i, ...o) {
    return typeof o[o.length - 1] == "function" ? t.write(r, i, ...o) : new Promise((a, F) => {
      t.write(r, i, ...o, (h, c, l) => {
        if (h) return F(h);
        a({ bytesWritten: c, buffer: l });
      });
    });
  }, u.readv = function(r, i, ...o) {
    return typeof o[o.length - 1] == "function" ? t.readv(r, i, ...o) : new Promise((a, F) => {
      t.readv(r, i, ...o, (h, c, l) => {
        if (h) return F(h);
        a({ bytesRead: c, buffers: l });
      });
    });
  }, u.writev = function(r, i, ...o) {
    return typeof o[o.length - 1] == "function" ? t.writev(r, i, ...o) : new Promise((a, F) => {
      t.writev(r, i, ...o, (h, c, l) => {
        if (h) return F(h);
        a({ bytesWritten: c, buffers: l });
      });
    });
  }, typeof t.realpath.native == "function" ? u.realpath.native = e(t.realpath.native) : process.emitWarning(
    "fs.realpath.native is not a function. Is fs being monkey-patched?",
    "Warning",
    "fs-extra-WARN0003"
  );
})(uu);
var oe = {}, Ie = {};
const Ht = p;
Ie.checkPath = function(e) {
  if (process.platform === "win32" && /[<>:"|?*]/.test(e.replace(Ht.parse(e).root, ""))) {
    const n = new Error(`Path contains invalid characters: ${e}`);
    throw n.code = "EINVAL", n;
  }
};
const Ne = uu, { checkPath: je } = Ie, Te = (u) => {
  const e = { mode: 511 };
  return typeof u == "number" ? u : { ...e, ...u }.mode;
};
oe.makeDir = async (u, e) => (je(u), Ne.mkdir(u, {
  mode: Te(e),
  recursive: !0
}));
oe.makeDirSync = (u, e) => (je(u), Ne.mkdirSync(u, {
  mode: Te(e),
  recursive: !0
}));
const Gt = J.fromPromise, { makeDir: zt, makeDirSync: Hu } = oe, Gu = Gt(zt);
var nu = {
  mkdirs: Gu,
  mkdirsSync: Hu,
  // alias
  mkdirp: Gu,
  mkdirpSync: Hu,
  ensureDir: Gu,
  ensureDirSync: Hu
};
const Yt = J.fromPromise, Le = uu;
function Kt(u) {
  return Le.access(u).then(() => !0).catch(() => !1);
}
var Au = {
  pathExists: Yt(Kt),
  pathExistsSync: Le.existsSync
};
const mu = uu, Qt = J.fromPromise;
async function Xt(u, e, t) {
  const n = await mu.open(u, "r+");
  let r = null;
  try {
    await mu.futimes(n, e, t);
  } finally {
    try {
      await mu.close(n);
    } catch (i) {
      r = i;
    }
  }
  if (r)
    throw r;
}
function Zt(u, e, t) {
  const n = mu.openSync(u, "r+");
  return mu.futimesSync(n, e, t), mu.closeSync(n);
}
var Me = {
  utimesMillis: Qt(Xt),
  utimesMillisSync: Zt
};
const du = uu, U = p, de = J.fromPromise;
function un(u, e, t) {
  const n = t.dereference ? (r) => du.stat(r, { bigint: !0 }) : (r) => du.lstat(r, { bigint: !0 });
  return Promise.all([
    n(u),
    n(e).catch((r) => {
      if (r.code === "ENOENT") return null;
      throw r;
    })
  ]).then(([r, i]) => ({ srcStat: r, destStat: i }));
}
function en(u, e, t) {
  let n;
  const r = t.dereference ? (o) => du.statSync(o, { bigint: !0 }) : (o) => du.lstatSync(o, { bigint: !0 }), i = r(u);
  try {
    n = r(e);
  } catch (o) {
    if (o.code === "ENOENT") return { srcStat: i, destStat: null };
    throw o;
  }
  return { srcStat: i, destStat: n };
}
async function tn(u, e, t, n) {
  const { srcStat: r, destStat: i } = await un(u, e, n);
  if (i) {
    if (Ou(r, i)) {
      const o = U.basename(u), a = U.basename(e);
      if (t === "move" && o !== a && o.toLowerCase() === a.toLowerCase())
        return { srcStat: r, destStat: i, isChangingCase: !0 };
      throw new Error("Source and destination must not be the same.");
    }
    if (r.isDirectory() && !i.isDirectory())
      throw new Error(`Cannot overwrite non-directory '${e}' with directory '${u}'.`);
    if (!r.isDirectory() && i.isDirectory())
      throw new Error(`Cannot overwrite directory '${e}' with non-directory '${u}'.`);
  }
  if (r.isDirectory() && De(u, e))
    throw new Error(Ju(u, e, t));
  return { srcStat: r, destStat: i };
}
function nn(u, e, t, n) {
  const { srcStat: r, destStat: i } = en(u, e, n);
  if (i) {
    if (Ou(r, i)) {
      const o = U.basename(u), a = U.basename(e);
      if (t === "move" && o !== a && o.toLowerCase() === a.toLowerCase())
        return { srcStat: r, destStat: i, isChangingCase: !0 };
      throw new Error("Source and destination must not be the same.");
    }
    if (r.isDirectory() && !i.isDirectory())
      throw new Error(`Cannot overwrite non-directory '${e}' with directory '${u}'.`);
    if (!r.isDirectory() && i.isDirectory())
      throw new Error(`Cannot overwrite directory '${e}' with non-directory '${u}'.`);
  }
  if (r.isDirectory() && De(u, e))
    throw new Error(Ju(u, e, t));
  return { srcStat: r, destStat: i };
}
async function Re(u, e, t, n) {
  const r = U.resolve(U.dirname(u)), i = U.resolve(U.dirname(t));
  if (i === r || i === U.parse(i).root) return;
  let o;
  try {
    o = await du.stat(i, { bigint: !0 });
  } catch (a) {
    if (a.code === "ENOENT") return;
    throw a;
  }
  if (Ou(e, o))
    throw new Error(Ju(u, t, n));
  return Re(u, e, i, n);
}
function Je(u, e, t, n) {
  const r = U.resolve(U.dirname(u)), i = U.resolve(U.dirname(t));
  if (i === r || i === U.parse(i).root) return;
  let o;
  try {
    o = du.statSync(i, { bigint: !0 });
  } catch (a) {
    if (a.code === "ENOENT") return;
    throw a;
  }
  if (Ou(e, o))
    throw new Error(Ju(u, t, n));
  return Je(u, e, i, n);
}
function Ou(u, e) {
  return e.ino !== void 0 && e.dev !== void 0 && e.ino === u.ino && e.dev === u.dev;
}
function De(u, e) {
  const t = U.resolve(u).split(U.sep).filter((r) => r), n = U.resolve(e).split(U.sep).filter((r) => r);
  return t.every((r, i) => n[i] === r);
}
function Ju(u, e, t) {
  return `Cannot ${t} '${u}' to a subdirectory of itself, '${e}'.`;
}
var Bu = {
  // checkPaths
  checkPaths: de(tn),
  checkPathsSync: nn,
  // checkParent
  checkParentPaths: de(Re),
  checkParentPathsSync: Je,
  // Misc
  isSrcSubdir: De,
  areIdentical: Ou
};
const K = uu, gu = p, { mkdirs: rn } = nu, { pathExists: on } = Au, { utimesMillis: Dn } = Me, bu = Bu;
async function cn(u, e, t = {}) {
  typeof t == "function" && (t = { filter: t }), t.clobber = "clobber" in t ? !!t.clobber : !0, t.overwrite = "overwrite" in t ? !!t.overwrite : t.clobber, t.preserveTimestamps && process.arch === "ia32" && process.emitWarning(
    `Using the preserveTimestamps option in 32-bit node is not recommended;

	see https://github.com/jprichardson/node-fs-extra/issues/269`,
    "Warning",
    "fs-extra-WARN0001"
  );
  const { srcStat: n, destStat: r } = await bu.checkPaths(u, e, "copy", t);
  if (await bu.checkParentPaths(u, n, e, "copy"), !await We(u, e, t)) return;
  const o = gu.dirname(e);
  await on(o) || await rn(o), await qe(r, u, e, t);
}
async function We(u, e, t) {
  return t.filter ? t.filter(u, e) : !0;
}
async function qe(u, e, t, n) {
  const i = await (n.dereference ? K.stat : K.lstat)(e);
  if (i.isDirectory()) return ln(i, u, e, t, n);
  if (i.isFile() || i.isCharacterDevice() || i.isBlockDevice()) return an(i, u, e, t, n);
  if (i.isSymbolicLink()) return Fn(u, e, t, n);
  throw i.isSocket() ? new Error(`Cannot copy a socket file: ${e}`) : i.isFIFO() ? new Error(`Cannot copy a FIFO pipe: ${e}`) : new Error(`Unknown file: ${e}`);
}
async function an(u, e, t, n, r) {
  if (!e) return he(u, t, n, r);
  if (r.overwrite)
    return await K.unlink(n), he(u, t, n, r);
  if (r.errorOnExist)
    throw new Error(`'${n}' already exists`);
}
async function he(u, e, t, n) {
  if (await K.copyFile(e, t), n.preserveTimestamps) {
    sn(u.mode) && await fn(t, u.mode);
    const r = await K.stat(e);
    await Dn(t, r.atime, r.mtime);
  }
  return K.chmod(t, u.mode);
}
function sn(u) {
  return (u & 128) === 0;
}
function fn(u, e) {
  return K.chmod(u, e | 128);
}
async function ln(u, e, t, n, r) {
  e || await K.mkdir(n);
  const i = [];
  for await (const o of await K.opendir(t)) {
    const a = gu.join(t, o.name), F = gu.join(n, o.name);
    i.push(
      We(a, F, r).then((h) => {
        if (h)
          return bu.checkPaths(a, F, "copy", r).then(({ destStat: c }) => qe(c, a, F, r));
      })
    );
  }
  await Promise.all(i), e || await K.chmod(n, u.mode);
}
async function Fn(u, e, t, n) {
  let r = await K.readlink(e);
  if (n.dereference && (r = gu.resolve(process.cwd(), r)), !u)
    return K.symlink(r, t);
  let i = null;
  try {
    i = await K.readlink(t);
  } catch (o) {
    if (o.code === "EINVAL" || o.code === "UNKNOWN") return K.symlink(r, t);
    throw o;
  }
  if (n.dereference && (i = gu.resolve(process.cwd(), i)), bu.isSrcSubdir(r, i))
    throw new Error(`Cannot copy '${r}' to a subdirectory of itself, '${i}'.`);
  if (bu.isSrcSubdir(i, r))
    throw new Error(`Cannot overwrite '${i}' with '${r}'.`);
  return await K.unlink(t), K.symlink(r, t);
}
var Cn = cn;
const X = pu, Pu = p, En = nu.mkdirsSync, An = Me.utimesMillisSync, $u = Bu;
function yn(u, e, t) {
  typeof t == "function" && (t = { filter: t }), t = t || {}, t.clobber = "clobber" in t ? !!t.clobber : !0, t.overwrite = "overwrite" in t ? !!t.overwrite : t.clobber, t.preserveTimestamps && process.arch === "ia32" && process.emitWarning(
    `Using the preserveTimestamps option in 32-bit node is not recommended;

	see https://github.com/jprichardson/node-fs-extra/issues/269`,
    "Warning",
    "fs-extra-WARN0002"
  );
  const { srcStat: n, destStat: r } = $u.checkPathsSync(u, e, "copy", t);
  if ($u.checkParentPathsSync(u, n, e, "copy"), t.filter && !t.filter(u, e)) return;
  const i = Pu.dirname(e);
  return X.existsSync(i) || En(i), Ue(r, u, e, t);
}
function Ue(u, e, t, n) {
  const i = (n.dereference ? X.statSync : X.lstatSync)(e);
  if (i.isDirectory()) return wn(i, u, e, t, n);
  if (i.isFile() || i.isCharacterDevice() || i.isBlockDevice()) return mn(i, u, e, t, n);
  if (i.isSymbolicLink()) return bn(u, e, t, n);
  throw i.isSocket() ? new Error(`Cannot copy a socket file: ${e}`) : i.isFIFO() ? new Error(`Cannot copy a FIFO pipe: ${e}`) : new Error(`Unknown file: ${e}`);
}
function mn(u, e, t, n, r) {
  return e ? dn(u, t, n, r) : Ve(u, t, n, r);
}
function dn(u, e, t, n) {
  if (n.overwrite)
    return X.unlinkSync(t), Ve(u, e, t, n);
  if (n.errorOnExist)
    throw new Error(`'${t}' already exists`);
}
function Ve(u, e, t, n) {
  return X.copyFileSync(e, t), n.preserveTimestamps && hn(u.mode, e, t), ce(t, u.mode);
}
function hn(u, e, t) {
  return pn(u) && Bn(t, u), Sn(e, t);
}
function pn(u) {
  return (u & 128) === 0;
}
function Bn(u, e) {
  return ce(u, e | 128);
}
function ce(u, e) {
  return X.chmodSync(u, e);
}
function Sn(u, e) {
  const t = X.statSync(u);
  return An(e, t.atime, t.mtime);
}
function wn(u, e, t, n, r) {
  return e ? He(t, n, r) : vn(u.mode, t, n, r);
}
function vn(u, e, t, n) {
  return X.mkdirSync(t), He(e, t, n), ce(t, u);
}
function He(u, e, t) {
  const n = X.opendirSync(u);
  try {
    let r;
    for (; (r = n.readSync()) !== null; )
      gn(r.name, u, e, t);
  } finally {
    n.closeSync();
  }
}
function gn(u, e, t, n) {
  const r = Pu.join(e, u), i = Pu.join(t, u);
  if (n.filter && !n.filter(r, i)) return;
  const { destStat: o } = $u.checkPathsSync(r, i, "copy", n);
  return Ue(o, r, i, n);
}
function bn(u, e, t, n) {
  let r = X.readlinkSync(e);
  if (n.dereference && (r = Pu.resolve(process.cwd(), r)), u) {
    let i;
    try {
      i = X.readlinkSync(t);
    } catch (o) {
      if (o.code === "EINVAL" || o.code === "UNKNOWN") return X.symlinkSync(r, t);
      throw o;
    }
    if (n.dereference && (i = Pu.resolve(process.cwd(), i)), $u.isSrcSubdir(r, i))
      throw new Error(`Cannot copy '${r}' to a subdirectory of itself, '${i}'.`);
    if ($u.isSrcSubdir(i, r))
      throw new Error(`Cannot overwrite '${i}' with '${r}'.`);
    return Pn(r, t);
  } else
    return X.symlinkSync(r, t);
}
function Pn(u, e) {
  return X.unlinkSync(e), X.symlinkSync(u, e);
}
var $n = yn;
const kn = J.fromPromise;
var ae = {
  copy: kn(Cn),
  copySync: $n
};
const Ge = pu, On = J.fromCallback;
function xn(u, e) {
  Ge.rm(u, { recursive: !0, force: !0 }, e);
}
function _n(u) {
  Ge.rmSync(u, { recursive: !0, force: !0 });
}
var Wu = {
  remove: On(xn),
  removeSync: _n
};
const In = J.fromPromise, ze = uu, Ye = p, Ke = nu, Qe = Wu, pe = In(async function(e) {
  let t;
  try {
    t = await ze.readdir(e);
  } catch {
    return Ke.mkdirs(e);
  }
  return Promise.all(t.map((n) => Qe.remove(Ye.join(e, n))));
});
function Be(u) {
  let e;
  try {
    e = ze.readdirSync(u);
  } catch {
    return Ke.mkdirsSync(u);
  }
  e.forEach((t) => {
    t = Ye.join(u, t), Qe.removeSync(t);
  });
}
var Nn = {
  emptyDirSync: Be,
  emptydirSync: Be,
  emptyDir: pe,
  emptydir: pe
};
const jn = J.fromPromise, Xe = p, ou = uu, Ze = nu;
async function Tn(u) {
  let e;
  try {
    e = await ou.stat(u);
  } catch {
  }
  if (e && e.isFile()) return;
  const t = Xe.dirname(u);
  let n = null;
  try {
    n = await ou.stat(t);
  } catch (r) {
    if (r.code === "ENOENT") {
      await Ze.mkdirs(t), await ou.writeFile(u, "");
      return;
    } else
      throw r;
  }
  n.isDirectory() ? await ou.writeFile(u, "") : await ou.readdir(t);
}
function Ln(u) {
  let e;
  try {
    e = ou.statSync(u);
  } catch {
  }
  if (e && e.isFile()) return;
  const t = Xe.dirname(u);
  try {
    ou.statSync(t).isDirectory() || ou.readdirSync(t);
  } catch (n) {
    if (n && n.code === "ENOENT") Ze.mkdirsSync(t);
    else throw n;
  }
  ou.writeFileSync(u, "");
}
var Mn = {
  createFile: jn(Tn),
  createFileSync: Ln
};
const Rn = J.fromPromise, ut = p, su = uu, et = nu, { pathExists: Jn } = Au, { areIdentical: tt } = Bu;
async function Wn(u, e) {
  let t;
  try {
    t = await su.lstat(e);
  } catch {
  }
  let n;
  try {
    n = await su.lstat(u);
  } catch (o) {
    throw o.message = o.message.replace("lstat", "ensureLink"), o;
  }
  if (t && tt(n, t)) return;
  const r = ut.dirname(e);
  await Jn(r) || await et.mkdirs(r), await su.link(u, e);
}
function qn(u, e) {
  let t;
  try {
    t = su.lstatSync(e);
  } catch {
  }
  try {
    const i = su.lstatSync(u);
    if (t && tt(i, t)) return;
  } catch (i) {
    throw i.message = i.message.replace("lstat", "ensureLink"), i;
  }
  const n = ut.dirname(e);
  return su.existsSync(n) || et.mkdirsSync(n), su.linkSync(u, e);
}
var Un = {
  createLink: Rn(Wn),
  createLinkSync: qn
};
const fu = p, wu = uu, { pathExists: Vn } = Au, Hn = J.fromPromise;
async function Gn(u, e) {
  if (fu.isAbsolute(u)) {
    try {
      await wu.lstat(u);
    } catch (i) {
      throw i.message = i.message.replace("lstat", "ensureSymlink"), i;
    }
    return {
      toCwd: u,
      toDst: u
    };
  }
  const t = fu.dirname(e), n = fu.join(t, u);
  if (await Vn(n))
    return {
      toCwd: n,
      toDst: u
    };
  try {
    await wu.lstat(u);
  } catch (i) {
    throw i.message = i.message.replace("lstat", "ensureSymlink"), i;
  }
  return {
    toCwd: u,
    toDst: fu.relative(t, u)
  };
}
function zn(u, e) {
  if (fu.isAbsolute(u)) {
    if (!wu.existsSync(u)) throw new Error("absolute srcpath does not exist");
    return {
      toCwd: u,
      toDst: u
    };
  }
  const t = fu.dirname(e), n = fu.join(t, u);
  if (wu.existsSync(n))
    return {
      toCwd: n,
      toDst: u
    };
  if (!wu.existsSync(u)) throw new Error("relative srcpath does not exist");
  return {
    toCwd: u,
    toDst: fu.relative(t, u)
  };
}
var Yn = {
  symlinkPaths: Hn(Gn),
  symlinkPathsSync: zn
};
const nt = uu, Kn = J.fromPromise;
async function Qn(u, e) {
  if (e) return e;
  let t;
  try {
    t = await nt.lstat(u);
  } catch {
    return "file";
  }
  return t && t.isDirectory() ? "dir" : "file";
}
function Xn(u, e) {
  if (e) return e;
  let t;
  try {
    t = nt.lstatSync(u);
  } catch {
    return "file";
  }
  return t && t.isDirectory() ? "dir" : "file";
}
var Zn = {
  symlinkType: Kn(Qn),
  symlinkTypeSync: Xn
};
const ur = J.fromPromise, rt = p, tu = uu, { mkdirs: er, mkdirsSync: tr } = nu, { symlinkPaths: nr, symlinkPathsSync: rr } = Yn, { symlinkType: ir, symlinkTypeSync: or } = Zn, { pathExists: Dr } = Au, { areIdentical: it } = Bu;
async function cr(u, e, t) {
  let n;
  try {
    n = await tu.lstat(e);
  } catch {
  }
  if (n && n.isSymbolicLink()) {
    const [a, F] = await Promise.all([
      tu.stat(u),
      tu.stat(e)
    ]);
    if (it(a, F)) return;
  }
  const r = await nr(u, e);
  u = r.toDst;
  const i = await ir(r.toCwd, t), o = rt.dirname(e);
  return await Dr(o) || await er(o), tu.symlink(u, e, i);
}
function ar(u, e, t) {
  let n;
  try {
    n = tu.lstatSync(e);
  } catch {
  }
  if (n && n.isSymbolicLink()) {
    const a = tu.statSync(u), F = tu.statSync(e);
    if (it(a, F)) return;
  }
  const r = rr(u, e);
  u = r.toDst, t = or(r.toCwd, t);
  const i = rt.dirname(e);
  return tu.existsSync(i) || tr(i), tu.symlinkSync(u, e, t);
}
var sr = {
  createSymlink: ur(cr),
  createSymlinkSync: ar
};
const { createFile: Se, createFileSync: we } = Mn, { createLink: ve, createLinkSync: ge } = Un, { createSymlink: be, createSymlinkSync: Pe } = sr;
var fr = {
  // file
  createFile: Se,
  createFileSync: we,
  ensureFile: Se,
  ensureFileSync: we,
  // link
  createLink: ve,
  createLinkSync: ge,
  ensureLink: ve,
  ensureLinkSync: ge,
  // symlink
  createSymlink: be,
  createSymlinkSync: Pe,
  ensureSymlink: be,
  ensureSymlinkSync: Pe
};
function lr(u, { EOL: e = `
`, finalEOL: t = !0, replacer: n = null, spaces: r } = {}) {
  const i = t ? e : "";
  return JSON.stringify(u, n, r).replace(/\n/g, e) + i;
}
function Fr(u) {
  return Buffer.isBuffer(u) && (u = u.toString("utf8")), u.replace(/^\uFEFF/, "");
}
var se = { stringify: lr, stripBom: Fr };
let hu;
try {
  hu = pu;
} catch {
  hu = M;
}
const qu = J, { stringify: ot, stripBom: Dt } = se;
async function Cr(u, e = {}) {
  typeof e == "string" && (e = { encoding: e });
  const t = e.fs || hu, n = "throws" in e ? e.throws : !0;
  let r = await qu.fromCallback(t.readFile)(u, e);
  r = Dt(r);
  let i;
  try {
    i = JSON.parse(r, e ? e.reviver : null);
  } catch (o) {
    if (n)
      throw o.message = `${u}: ${o.message}`, o;
    return null;
  }
  return i;
}
const Er = qu.fromPromise(Cr);
function Ar(u, e = {}) {
  typeof e == "string" && (e = { encoding: e });
  const t = e.fs || hu, n = "throws" in e ? e.throws : !0;
  try {
    let r = t.readFileSync(u, e);
    return r = Dt(r), JSON.parse(r, e.reviver);
  } catch (r) {
    if (n)
      throw r.message = `${u}: ${r.message}`, r;
    return null;
  }
}
async function yr(u, e, t = {}) {
  const n = t.fs || hu, r = ot(e, t);
  await qu.fromCallback(n.writeFile)(u, r, t);
}
const mr = qu.fromPromise(yr);
function dr(u, e, t = {}) {
  const n = t.fs || hu, r = ot(e, t);
  return n.writeFileSync(u, r, t);
}
var hr = {
  readFile: Er,
  readFileSync: Ar,
  writeFile: mr,
  writeFileSync: dr
};
const Iu = hr;
var pr = {
  // jsonfile exports
  readJson: Iu.readFile,
  readJsonSync: Iu.readFileSync,
  writeJson: Iu.writeFile,
  writeJsonSync: Iu.writeFileSync
};
const Br = J.fromPromise, Zu = uu, ct = p, at = nu, Sr = Au.pathExists;
async function wr(u, e, t = "utf-8") {
  const n = ct.dirname(u);
  return await Sr(n) || await at.mkdirs(n), Zu.writeFile(u, e, t);
}
function vr(u, ...e) {
  const t = ct.dirname(u);
  Zu.existsSync(t) || at.mkdirsSync(t), Zu.writeFileSync(u, ...e);
}
var fe = {
  outputFile: Br(wr),
  outputFileSync: vr
};
const { stringify: gr } = se, { outputFile: br } = fe;
async function Pr(u, e, t = {}) {
  const n = gr(e, t);
  await br(u, n, t);
}
var $r = Pr;
const { stringify: kr } = se, { outputFileSync: Or } = fe;
function xr(u, e, t) {
  const n = kr(e, t);
  Or(u, n, t);
}
var _r = xr;
const Ir = J.fromPromise, Z = pr;
Z.outputJson = Ir($r);
Z.outputJsonSync = _r;
Z.outputJSON = Z.outputJson;
Z.outputJSONSync = Z.outputJsonSync;
Z.writeJSON = Z.writeJson;
Z.writeJSONSync = Z.writeJsonSync;
Z.readJSON = Z.readJson;
Z.readJSONSync = Z.readJsonSync;
var Nr = Z;
const jr = uu, $e = p, { copy: Tr } = ae, { remove: st } = Wu, { mkdirp: Lr } = nu, { pathExists: Mr } = Au, ke = Bu;
async function Rr(u, e, t = {}) {
  const n = t.overwrite || t.clobber || !1, { srcStat: r, isChangingCase: i = !1 } = await ke.checkPaths(u, e, "move", t);
  await ke.checkParentPaths(u, r, e, "move");
  const o = $e.dirname(e);
  return $e.parse(o).root !== o && await Lr(o), Jr(u, e, n, i);
}
async function Jr(u, e, t, n) {
  if (!n) {
    if (t)
      await st(e);
    else if (await Mr(e))
      throw new Error("dest already exists.");
  }
  try {
    await jr.rename(u, e);
  } catch (r) {
    if (r.code !== "EXDEV")
      throw r;
    await Wr(u, e, t);
  }
}
async function Wr(u, e, t) {
  return await Tr(u, e, {
    overwrite: t,
    errorOnExist: !0,
    preserveTimestamps: !0
  }), st(u);
}
var qr = Rr;
const ft = pu, ue = p, Ur = ae.copySync, lt = Wu.removeSync, Vr = nu.mkdirpSync, Oe = Bu;
function Hr(u, e, t) {
  t = t || {};
  const n = t.overwrite || t.clobber || !1, { srcStat: r, isChangingCase: i = !1 } = Oe.checkPathsSync(u, e, "move", t);
  return Oe.checkParentPathsSync(u, r, e, "move"), Gr(e) || Vr(ue.dirname(e)), zr(u, e, n, i);
}
function Gr(u) {
  const e = ue.dirname(u);
  return ue.parse(e).root === e;
}
function zr(u, e, t, n) {
  if (n) return zu(u, e, t);
  if (t)
    return lt(e), zu(u, e, t);
  if (ft.existsSync(e)) throw new Error("dest already exists.");
  return zu(u, e, t);
}
function zu(u, e, t) {
  try {
    ft.renameSync(u, e);
  } catch (n) {
    if (n.code !== "EXDEV") throw n;
    return Yr(u, e, t);
  }
}
function Yr(u, e, t) {
  return Ur(u, e, {
    overwrite: t,
    errorOnExist: !0,
    preserveTimestamps: !0
  }), lt(u);
}
var Kr = Hr;
const Qr = J.fromPromise;
var Xr = {
  move: Qr(qr),
  moveSync: Kr
}, Zr = {
  // Export promiseified graceful-fs:
  ...uu,
  // Export extra methods:
  ...ae,
  ...Nn,
  ...fr,
  ...Nr,
  ...nu,
  ...Xr,
  ...fe,
  ...Au,
  ...Wu
};
const T = /* @__PURE__ */ Ot(Zr), Ft = kt(import.meta.url), ui = p.dirname(Ft), le = Ru.getPath("userData"), ei = p.join(le, "config.json"), ti = p.join(le, "info.json"), ni = p.join(le, "Mods"), x = {
  __filename: Ft,
  __dirname: ui,
  CONFIG_PATH: ei,
  INFO_PATH: ti,
  MODS_DIR: ni
};
var ri = /[\u1680\u2000-\u200A\u202F\u205F\u3000]/, ii = /[\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0561-\u0587\u05D0-\u05EA\u05F0-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u0860-\u086A\u08A0-\u08B4\u08B6-\u08BD\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u09FC\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0AF9\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58-\u0C5A\u0C60\u0C61\u0C80\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D54-\u0D56\u0D5F-\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1877\u1880-\u1884\u1887-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1C80-\u1C88\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5\u1CF6\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312E\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FEA\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA69D\uA6A0-\uA6EF\uA717-\uA71F\uA722-\uA788\uA78B-\uA7AE\uA7B0-\uA7B7\uA7F7-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA8FD\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uA9E0-\uA9E4\uA9E6-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB65\uAB70-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]|\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDD40-\uDD74\uDE80-\uDE9C\uDEA0-\uDED0\uDF00-\uDF1F\uDF2D-\uDF4A\uDF50-\uDF75\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF\uDFD1-\uDFD5]|\uD801[\uDC00-\uDC9D\uDCB0-\uDCD3\uDCD8-\uDCFB\uDD00-\uDD27\uDD30-\uDD63\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC60-\uDC76\uDC80-\uDC9E\uDCE0-\uDCF2\uDCF4\uDCF5\uDD00-\uDD15\uDD20-\uDD39\uDD80-\uDDB7\uDDBE\uDDBF\uDE00\uDE10-\uDE13\uDE15-\uDE17\uDE19-\uDE33\uDE60-\uDE7C\uDE80-\uDE9C\uDEC0-\uDEC7\uDEC9-\uDEE4\uDF00-\uDF35\uDF40-\uDF55\uDF60-\uDF72\uDF80-\uDF91]|\uD803[\uDC00-\uDC48\uDC80-\uDCB2\uDCC0-\uDCF2]|\uD804[\uDC03-\uDC37\uDC83-\uDCAF\uDCD0-\uDCE8\uDD03-\uDD26\uDD50-\uDD72\uDD76\uDD83-\uDDB2\uDDC1-\uDDC4\uDDDA\uDDDC\uDE00-\uDE11\uDE13-\uDE2B\uDE80-\uDE86\uDE88\uDE8A-\uDE8D\uDE8F-\uDE9D\uDE9F-\uDEA8\uDEB0-\uDEDE\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3D\uDF50\uDF5D-\uDF61]|\uD805[\uDC00-\uDC34\uDC47-\uDC4A\uDC80-\uDCAF\uDCC4\uDCC5\uDCC7\uDD80-\uDDAE\uDDD8-\uDDDB\uDE00-\uDE2F\uDE44\uDE80-\uDEAA\uDF00-\uDF19]|\uD806[\uDCA0-\uDCDF\uDCFF\uDE00\uDE0B-\uDE32\uDE3A\uDE50\uDE5C-\uDE83\uDE86-\uDE89\uDEC0-\uDEF8]|\uD807[\uDC00-\uDC08\uDC0A-\uDC2E\uDC40\uDC72-\uDC8F\uDD00-\uDD06\uDD08\uDD09\uDD0B-\uDD30\uDD46]|\uD808[\uDC00-\uDF99]|\uD809[\uDC00-\uDC6E\uDC80-\uDD43]|[\uD80C\uD81C-\uD820\uD840-\uD868\uD86A-\uD86C\uD86F-\uD872\uD874-\uD879][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2E]|\uD811[\uDC00-\uDE46]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDED0-\uDEED\uDF00-\uDF2F\uDF40-\uDF43\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDF00-\uDF44\uDF50\uDF93-\uDF9F\uDFE0\uDFE1]|\uD821[\uDC00-\uDFEC]|\uD822[\uDC00-\uDEF2]|\uD82C[\uDC00-\uDD1E\uDD70-\uDEFB]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB]|\uD83A[\uDC00-\uDCC4\uDD00-\uDD43]|\uD83B[\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD869[\uDC00-\uDED6\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEA1\uDEB0-\uDFFF]|\uD87A[\uDC00-\uDFE0]|\uD87E[\uDC00-\uDE1D]/, oi = /[\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0300-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u0483-\u0487\u048A-\u052F\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u05D0-\u05EA\u05F0-\u05F2\u0610-\u061A\u0620-\u0669\u066E-\u06D3\u06D5-\u06DC\u06DF-\u06E8\u06EA-\u06FC\u06FF\u0710-\u074A\u074D-\u07B1\u07C0-\u07F5\u07FA\u0800-\u082D\u0840-\u085B\u0860-\u086A\u08A0-\u08B4\u08B6-\u08BD\u08D4-\u08E1\u08E3-\u0963\u0966-\u096F\u0971-\u0983\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BC-\u09C4\u09C7\u09C8\u09CB-\u09CE\u09D7\u09DC\u09DD\u09DF-\u09E3\u09E6-\u09F1\u09FC\u0A01-\u0A03\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A3C\u0A3E-\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A59-\u0A5C\u0A5E\u0A66-\u0A75\u0A81-\u0A83\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABC-\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0AD0\u0AE0-\u0AE3\u0AE6-\u0AEF\u0AF9-\u0AFF\u0B01-\u0B03\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3C-\u0B44\u0B47\u0B48\u0B4B-\u0B4D\u0B56\u0B57\u0B5C\u0B5D\u0B5F-\u0B63\u0B66-\u0B6F\u0B71\u0B82\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD0\u0BD7\u0BE6-\u0BEF\u0C00-\u0C03\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D-\u0C44\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C58-\u0C5A\u0C60-\u0C63\u0C66-\u0C6F\u0C80-\u0C83\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBC-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5\u0CD6\u0CDE\u0CE0-\u0CE3\u0CE6-\u0CEF\u0CF1\u0CF2\u0D00-\u0D03\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D44\u0D46-\u0D48\u0D4A-\u0D4E\u0D54-\u0D57\u0D5F-\u0D63\u0D66-\u0D6F\u0D7A-\u0D7F\u0D82\u0D83\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0DCA\u0DCF-\u0DD4\u0DD6\u0DD8-\u0DDF\u0DE6-\u0DEF\u0DF2\u0DF3\u0E01-\u0E3A\u0E40-\u0E4E\u0E50-\u0E59\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB9\u0EBB-\u0EBD\u0EC0-\u0EC4\u0EC6\u0EC8-\u0ECD\u0ED0-\u0ED9\u0EDC-\u0EDF\u0F00\u0F18\u0F19\u0F20-\u0F29\u0F35\u0F37\u0F39\u0F3E-\u0F47\u0F49-\u0F6C\u0F71-\u0F84\u0F86-\u0F97\u0F99-\u0FBC\u0FC6\u1000-\u1049\u1050-\u109D\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u135D-\u135F\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u170C\u170E-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176C\u176E-\u1770\u1772\u1773\u1780-\u17D3\u17D7\u17DC\u17DD\u17E0-\u17E9\u180B-\u180D\u1810-\u1819\u1820-\u1877\u1880-\u18AA\u18B0-\u18F5\u1900-\u191E\u1920-\u192B\u1930-\u193B\u1946-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u19D0-\u19D9\u1A00-\u1A1B\u1A20-\u1A5E\u1A60-\u1A7C\u1A7F-\u1A89\u1A90-\u1A99\u1AA7\u1AB0-\u1ABD\u1B00-\u1B4B\u1B50-\u1B59\u1B6B-\u1B73\u1B80-\u1BF3\u1C00-\u1C37\u1C40-\u1C49\u1C4D-\u1C7D\u1C80-\u1C88\u1CD0-\u1CD2\u1CD4-\u1CF9\u1D00-\u1DF9\u1DFB-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u203F\u2040\u2054\u2071\u207F\u2090-\u209C\u20D0-\u20DC\u20E1\u20E5-\u20F0\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D7F-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2DE0-\u2DFF\u2E2F\u3005-\u3007\u3021-\u302F\u3031-\u3035\u3038-\u303C\u3041-\u3096\u3099\u309A\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312E\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FEA\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA62B\uA640-\uA66F\uA674-\uA67D\uA67F-\uA6F1\uA717-\uA71F\uA722-\uA788\uA78B-\uA7AE\uA7B0-\uA7B7\uA7F7-\uA827\uA840-\uA873\uA880-\uA8C5\uA8D0-\uA8D9\uA8E0-\uA8F7\uA8FB\uA8FD\uA900-\uA92D\uA930-\uA953\uA960-\uA97C\uA980-\uA9C0\uA9CF-\uA9D9\uA9E0-\uA9FE\uAA00-\uAA36\uAA40-\uAA4D\uAA50-\uAA59\uAA60-\uAA76\uAA7A-\uAAC2\uAADB-\uAADD\uAAE0-\uAAEF\uAAF2-\uAAF6\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB65\uAB70-\uABEA\uABEC\uABED\uABF0-\uABF9\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE00-\uFE0F\uFE20-\uFE2F\uFE33\uFE34\uFE4D-\uFE4F\uFE70-\uFE74\uFE76-\uFEFC\uFF10-\uFF19\uFF21-\uFF3A\uFF3F\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]|\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDD40-\uDD74\uDDFD\uDE80-\uDE9C\uDEA0-\uDED0\uDEE0\uDF00-\uDF1F\uDF2D-\uDF4A\uDF50-\uDF7A\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF\uDFD1-\uDFD5]|\uD801[\uDC00-\uDC9D\uDCA0-\uDCA9\uDCB0-\uDCD3\uDCD8-\uDCFB\uDD00-\uDD27\uDD30-\uDD63\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC60-\uDC76\uDC80-\uDC9E\uDCE0-\uDCF2\uDCF4\uDCF5\uDD00-\uDD15\uDD20-\uDD39\uDD80-\uDDB7\uDDBE\uDDBF\uDE00-\uDE03\uDE05\uDE06\uDE0C-\uDE13\uDE15-\uDE17\uDE19-\uDE33\uDE38-\uDE3A\uDE3F\uDE60-\uDE7C\uDE80-\uDE9C\uDEC0-\uDEC7\uDEC9-\uDEE6\uDF00-\uDF35\uDF40-\uDF55\uDF60-\uDF72\uDF80-\uDF91]|\uD803[\uDC00-\uDC48\uDC80-\uDCB2\uDCC0-\uDCF2]|\uD804[\uDC00-\uDC46\uDC66-\uDC6F\uDC7F-\uDCBA\uDCD0-\uDCE8\uDCF0-\uDCF9\uDD00-\uDD34\uDD36-\uDD3F\uDD50-\uDD73\uDD76\uDD80-\uDDC4\uDDCA-\uDDCC\uDDD0-\uDDDA\uDDDC\uDE00-\uDE11\uDE13-\uDE37\uDE3E\uDE80-\uDE86\uDE88\uDE8A-\uDE8D\uDE8F-\uDE9D\uDE9F-\uDEA8\uDEB0-\uDEEA\uDEF0-\uDEF9\uDF00-\uDF03\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3C-\uDF44\uDF47\uDF48\uDF4B-\uDF4D\uDF50\uDF57\uDF5D-\uDF63\uDF66-\uDF6C\uDF70-\uDF74]|\uD805[\uDC00-\uDC4A\uDC50-\uDC59\uDC80-\uDCC5\uDCC7\uDCD0-\uDCD9\uDD80-\uDDB5\uDDB8-\uDDC0\uDDD8-\uDDDD\uDE00-\uDE40\uDE44\uDE50-\uDE59\uDE80-\uDEB7\uDEC0-\uDEC9\uDF00-\uDF19\uDF1D-\uDF2B\uDF30-\uDF39]|\uD806[\uDCA0-\uDCE9\uDCFF\uDE00-\uDE3E\uDE47\uDE50-\uDE83\uDE86-\uDE99\uDEC0-\uDEF8]|\uD807[\uDC00-\uDC08\uDC0A-\uDC36\uDC38-\uDC40\uDC50-\uDC59\uDC72-\uDC8F\uDC92-\uDCA7\uDCA9-\uDCB6\uDD00-\uDD06\uDD08\uDD09\uDD0B-\uDD36\uDD3A\uDD3C\uDD3D\uDD3F-\uDD47\uDD50-\uDD59]|\uD808[\uDC00-\uDF99]|\uD809[\uDC00-\uDC6E\uDC80-\uDD43]|[\uD80C\uD81C-\uD820\uD840-\uD868\uD86A-\uD86C\uD86F-\uD872\uD874-\uD879][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2E]|\uD811[\uDC00-\uDE46]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDE60-\uDE69\uDED0-\uDEED\uDEF0-\uDEF4\uDF00-\uDF36\uDF40-\uDF43\uDF50-\uDF59\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDF00-\uDF44\uDF50-\uDF7E\uDF8F-\uDF9F\uDFE0\uDFE1]|\uD821[\uDC00-\uDFEC]|\uD822[\uDC00-\uDEF2]|\uD82C[\uDC00-\uDD1E\uDD70-\uDEFB]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99\uDC9D\uDC9E]|\uD834[\uDD65-\uDD69\uDD6D-\uDD72\uDD7B-\uDD82\uDD85-\uDD8B\uDDAA-\uDDAD\uDE42-\uDE44]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB\uDFCE-\uDFFF]|\uD836[\uDE00-\uDE36\uDE3B-\uDE6C\uDE75\uDE84\uDE9B-\uDE9F\uDEA1-\uDEAF]|\uD838[\uDC00-\uDC06\uDC08-\uDC18\uDC1B-\uDC21\uDC23\uDC24\uDC26-\uDC2A]|\uD83A[\uDC00-\uDCC4\uDCD0-\uDCD6\uDD00-\uDD4A\uDD50-\uDD59]|\uD83B[\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD869[\uDC00-\uDED6\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEA1\uDEB0-\uDFFF]|\uD87A[\uDC00-\uDFE0]|\uD87E[\uDC00-\uDE1D]|\uDB40[\uDD00-\uDDEF]/, Yu = {
  Space_Separator: ri,
  ID_Start: ii,
  ID_Continue: oi
}, L = {
  isSpaceSeparator(u) {
    return typeof u == "string" && Yu.Space_Separator.test(u);
  },
  isIdStartChar(u) {
    return typeof u == "string" && (u >= "a" && u <= "z" || u >= "A" && u <= "Z" || u === "$" || u === "_" || Yu.ID_Start.test(u));
  },
  isIdContinueChar(u) {
    return typeof u == "string" && (u >= "a" && u <= "z" || u >= "A" && u <= "Z" || u >= "0" && u <= "9" || u === "$" || u === "_" || u === "‌" || u === "‍" || Yu.ID_Continue.test(u));
  },
  isDigit(u) {
    return typeof u == "string" && /[0-9]/.test(u);
  },
  isHexDigit(u) {
    return typeof u == "string" && /[0-9A-Fa-f]/.test(u);
  }
};
let ee, Q, Du, Lu, lu, eu, q, Fe, vu;
var Di = function(e, t) {
  ee = String(e), Q = "start", Du = [], Lu = 0, lu = 1, eu = 0, q = void 0, Fe = void 0, vu = void 0;
  do
    q = ci(), fi[Q]();
  while (q.type !== "eof");
  return typeof t == "function" ? te({ "": vu }, "", t) : vu;
};
function te(u, e, t) {
  const n = u[e];
  if (n != null && typeof n == "object")
    if (Array.isArray(n))
      for (let r = 0; r < n.length; r++) {
        const i = String(r), o = te(n, i, t);
        o === void 0 ? delete n[i] : Object.defineProperty(n, i, {
          value: o,
          writable: !0,
          enumerable: !0,
          configurable: !0
        });
      }
    else
      for (const r in n) {
        const i = te(n, r, t);
        i === void 0 ? delete n[r] : Object.defineProperty(n, r, {
          value: i,
          writable: !0,
          enumerable: !0,
          configurable: !0
        });
      }
  return t.call(u, e, n);
}
let B, d, Su, iu, S;
function ci() {
  for (B = "default", d = "", Su = !1, iu = 1; ; ) {
    S = cu();
    const u = Ct[B]();
    if (u)
      return u;
  }
}
function cu() {
  if (ee[Lu])
    return String.fromCodePoint(ee.codePointAt(Lu));
}
function D() {
  const u = cu();
  return u === `
` ? (lu++, eu = 0) : u ? eu += u.length : eu++, u && (Lu += u.length), u;
}
const Ct = {
  default() {
    switch (S) {
      case "	":
      case "\v":
      case "\f":
      case " ":
      case " ":
      case "\uFEFF":
      case `
`:
      case "\r":
      case "\u2028":
      case "\u2029":
        D();
        return;
      case "/":
        D(), B = "comment";
        return;
      case void 0:
        return D(), k("eof");
    }
    if (L.isSpaceSeparator(S)) {
      D();
      return;
    }
    return Ct[Q]();
  },
  comment() {
    switch (S) {
      case "*":
        D(), B = "multiLineComment";
        return;
      case "/":
        D(), B = "singleLineComment";
        return;
    }
    throw O(D());
  },
  multiLineComment() {
    switch (S) {
      case "*":
        D(), B = "multiLineCommentAsterisk";
        return;
      case void 0:
        throw O(D());
    }
    D();
  },
  multiLineCommentAsterisk() {
    switch (S) {
      case "*":
        D();
        return;
      case "/":
        D(), B = "default";
        return;
      case void 0:
        throw O(D());
    }
    D(), B = "multiLineComment";
  },
  singleLineComment() {
    switch (S) {
      case `
`:
      case "\r":
      case "\u2028":
      case "\u2029":
        D(), B = "default";
        return;
      case void 0:
        return D(), k("eof");
    }
    D();
  },
  value() {
    switch (S) {
      case "{":
      case "[":
        return k("punctuator", D());
      case "n":
        return D(), Fu("ull"), k("null", null);
      case "t":
        return D(), Fu("rue"), k("boolean", !0);
      case "f":
        return D(), Fu("alse"), k("boolean", !1);
      case "-":
      case "+":
        D() === "-" && (iu = -1), B = "sign";
        return;
      case ".":
        d = D(), B = "decimalPointLeading";
        return;
      case "0":
        d = D(), B = "zero";
        return;
      case "1":
      case "2":
      case "3":
      case "4":
      case "5":
      case "6":
      case "7":
      case "8":
      case "9":
        d = D(), B = "decimalInteger";
        return;
      case "I":
        return D(), Fu("nfinity"), k("numeric", 1 / 0);
      case "N":
        return D(), Fu("aN"), k("numeric", NaN);
      case '"':
      case "'":
        Su = D() === '"', d = "", B = "string";
        return;
    }
    throw O(D());
  },
  identifierNameStartEscape() {
    if (S !== "u")
      throw O(D());
    D();
    const u = ne();
    switch (u) {
      case "$":
      case "_":
        break;
      default:
        if (!L.isIdStartChar(u))
          throw xe();
        break;
    }
    d += u, B = "identifierName";
  },
  identifierName() {
    switch (S) {
      case "$":
      case "_":
      case "‌":
      case "‍":
        d += D();
        return;
      case "\\":
        D(), B = "identifierNameEscape";
        return;
    }
    if (L.isIdContinueChar(S)) {
      d += D();
      return;
    }
    return k("identifier", d);
  },
  identifierNameEscape() {
    if (S !== "u")
      throw O(D());
    D();
    const u = ne();
    switch (u) {
      case "$":
      case "_":
      case "‌":
      case "‍":
        break;
      default:
        if (!L.isIdContinueChar(u))
          throw xe();
        break;
    }
    d += u, B = "identifierName";
  },
  sign() {
    switch (S) {
      case ".":
        d = D(), B = "decimalPointLeading";
        return;
      case "0":
        d = D(), B = "zero";
        return;
      case "1":
      case "2":
      case "3":
      case "4":
      case "5":
      case "6":
      case "7":
      case "8":
      case "9":
        d = D(), B = "decimalInteger";
        return;
      case "I":
        return D(), Fu("nfinity"), k("numeric", iu * (1 / 0));
      case "N":
        return D(), Fu("aN"), k("numeric", NaN);
    }
    throw O(D());
  },
  zero() {
    switch (S) {
      case ".":
        d += D(), B = "decimalPoint";
        return;
      case "e":
      case "E":
        d += D(), B = "decimalExponent";
        return;
      case "x":
      case "X":
        d += D(), B = "hexadecimal";
        return;
    }
    return k("numeric", iu * 0);
  },
  decimalInteger() {
    switch (S) {
      case ".":
        d += D(), B = "decimalPoint";
        return;
      case "e":
      case "E":
        d += D(), B = "decimalExponent";
        return;
    }
    if (L.isDigit(S)) {
      d += D();
      return;
    }
    return k("numeric", iu * Number(d));
  },
  decimalPointLeading() {
    if (L.isDigit(S)) {
      d += D(), B = "decimalFraction";
      return;
    }
    throw O(D());
  },
  decimalPoint() {
    switch (S) {
      case "e":
      case "E":
        d += D(), B = "decimalExponent";
        return;
    }
    if (L.isDigit(S)) {
      d += D(), B = "decimalFraction";
      return;
    }
    return k("numeric", iu * Number(d));
  },
  decimalFraction() {
    switch (S) {
      case "e":
      case "E":
        d += D(), B = "decimalExponent";
        return;
    }
    if (L.isDigit(S)) {
      d += D();
      return;
    }
    return k("numeric", iu * Number(d));
  },
  decimalExponent() {
    switch (S) {
      case "+":
      case "-":
        d += D(), B = "decimalExponentSign";
        return;
    }
    if (L.isDigit(S)) {
      d += D(), B = "decimalExponentInteger";
      return;
    }
    throw O(D());
  },
  decimalExponentSign() {
    if (L.isDigit(S)) {
      d += D(), B = "decimalExponentInteger";
      return;
    }
    throw O(D());
  },
  decimalExponentInteger() {
    if (L.isDigit(S)) {
      d += D();
      return;
    }
    return k("numeric", iu * Number(d));
  },
  hexadecimal() {
    if (L.isHexDigit(S)) {
      d += D(), B = "hexadecimalInteger";
      return;
    }
    throw O(D());
  },
  hexadecimalInteger() {
    if (L.isHexDigit(S)) {
      d += D();
      return;
    }
    return k("numeric", iu * Number(d));
  },
  string() {
    switch (S) {
      case "\\":
        D(), d += ai();
        return;
      case '"':
        if (Su)
          return D(), k("string", d);
        d += D();
        return;
      case "'":
        if (!Su)
          return D(), k("string", d);
        d += D();
        return;
      case `
`:
      case "\r":
        throw O(D());
      case "\u2028":
      case "\u2029":
        li(S);
        break;
      case void 0:
        throw O(D());
    }
    d += D();
  },
  start() {
    switch (S) {
      case "{":
      case "[":
        return k("punctuator", D());
    }
    B = "value";
  },
  beforePropertyName() {
    switch (S) {
      case "$":
      case "_":
        d = D(), B = "identifierName";
        return;
      case "\\":
        D(), B = "identifierNameStartEscape";
        return;
      case "}":
        return k("punctuator", D());
      case '"':
      case "'":
        Su = D() === '"', B = "string";
        return;
    }
    if (L.isIdStartChar(S)) {
      d += D(), B = "identifierName";
      return;
    }
    throw O(D());
  },
  afterPropertyName() {
    if (S === ":")
      return k("punctuator", D());
    throw O(D());
  },
  beforePropertyValue() {
    B = "value";
  },
  afterPropertyValue() {
    switch (S) {
      case ",":
      case "}":
        return k("punctuator", D());
    }
    throw O(D());
  },
  beforeArrayValue() {
    if (S === "]")
      return k("punctuator", D());
    B = "value";
  },
  afterArrayValue() {
    switch (S) {
      case ",":
      case "]":
        return k("punctuator", D());
    }
    throw O(D());
  },
  end() {
    throw O(D());
  }
};
function k(u, e) {
  return {
    type: u,
    value: e,
    line: lu,
    column: eu
  };
}
function Fu(u) {
  for (const e of u) {
    if (cu() !== e)
      throw O(D());
    D();
  }
}
function ai() {
  switch (cu()) {
    case "b":
      return D(), "\b";
    case "f":
      return D(), "\f";
    case "n":
      return D(), `
`;
    case "r":
      return D(), "\r";
    case "t":
      return D(), "	";
    case "v":
      return D(), "\v";
    case "0":
      if (D(), L.isDigit(cu()))
        throw O(D());
      return "\0";
    case "x":
      return D(), si();
    case "u":
      return D(), ne();
    case `
`:
    case "\u2028":
    case "\u2029":
      return D(), "";
    case "\r":
      return D(), cu() === `
` && D(), "";
    case "1":
    case "2":
    case "3":
    case "4":
    case "5":
    case "6":
    case "7":
    case "8":
    case "9":
      throw O(D());
    case void 0:
      throw O(D());
  }
  return D();
}
function si() {
  let u = "", e = cu();
  if (!L.isHexDigit(e) || (u += D(), e = cu(), !L.isHexDigit(e)))
    throw O(D());
  return u += D(), String.fromCodePoint(parseInt(u, 16));
}
function ne() {
  let u = "", e = 4;
  for (; e-- > 0; ) {
    const t = cu();
    if (!L.isHexDigit(t))
      throw O(D());
    u += D();
  }
  return String.fromCodePoint(parseInt(u, 16));
}
const fi = {
  start() {
    if (q.type === "eof")
      throw Cu();
    Ku();
  },
  beforePropertyName() {
    switch (q.type) {
      case "identifier":
      case "string":
        Fe = q.value, Q = "afterPropertyName";
        return;
      case "punctuator":
        Nu();
        return;
      case "eof":
        throw Cu();
    }
  },
  afterPropertyName() {
    if (q.type === "eof")
      throw Cu();
    Q = "beforePropertyValue";
  },
  beforePropertyValue() {
    if (q.type === "eof")
      throw Cu();
    Ku();
  },
  beforeArrayValue() {
    if (q.type === "eof")
      throw Cu();
    if (q.type === "punctuator" && q.value === "]") {
      Nu();
      return;
    }
    Ku();
  },
  afterPropertyValue() {
    if (q.type === "eof")
      throw Cu();
    switch (q.value) {
      case ",":
        Q = "beforePropertyName";
        return;
      case "}":
        Nu();
    }
  },
  afterArrayValue() {
    if (q.type === "eof")
      throw Cu();
    switch (q.value) {
      case ",":
        Q = "beforeArrayValue";
        return;
      case "]":
        Nu();
    }
  },
  end() {
  }
};
function Ku() {
  let u;
  switch (q.type) {
    case "punctuator":
      switch (q.value) {
        case "{":
          u = {};
          break;
        case "[":
          u = [];
          break;
      }
      break;
    case "null":
    case "boolean":
    case "numeric":
    case "string":
      u = q.value;
      break;
  }
  if (vu === void 0)
    vu = u;
  else {
    const e = Du[Du.length - 1];
    Array.isArray(e) ? e.push(u) : Object.defineProperty(e, Fe, {
      value: u,
      writable: !0,
      enumerable: !0,
      configurable: !0
    });
  }
  if (u !== null && typeof u == "object")
    Du.push(u), Array.isArray(u) ? Q = "beforeArrayValue" : Q = "beforePropertyName";
  else {
    const e = Du[Du.length - 1];
    e == null ? Q = "end" : Array.isArray(e) ? Q = "afterArrayValue" : Q = "afterPropertyValue";
  }
}
function Nu() {
  Du.pop();
  const u = Du[Du.length - 1];
  u == null ? Q = "end" : Array.isArray(u) ? Q = "afterArrayValue" : Q = "afterPropertyValue";
}
function O(u) {
  return Mu(u === void 0 ? `JSON5: invalid end of input at ${lu}:${eu}` : `JSON5: invalid character '${Et(u)}' at ${lu}:${eu}`);
}
function Cu() {
  return Mu(`JSON5: invalid end of input at ${lu}:${eu}`);
}
function xe() {
  return eu -= 5, Mu(`JSON5: invalid identifier character at ${lu}:${eu}`);
}
function li(u) {
  console.warn(`JSON5: '${Et(u)}' in strings is not valid ECMAScript; consider escaping`);
}
function Et(u) {
  const e = {
    "'": "\\'",
    '"': '\\"',
    "\\": "\\\\",
    "\b": "\\b",
    "\f": "\\f",
    "\n": "\\n",
    "\r": "\\r",
    "	": "\\t",
    "\v": "\\v",
    "\0": "\\0",
    "\u2028": "\\u2028",
    "\u2029": "\\u2029"
  };
  if (e[u])
    return e[u];
  if (u < " ") {
    const t = u.charCodeAt(0).toString(16);
    return "\\x" + ("00" + t).substring(t.length);
  }
  return u;
}
function Mu(u) {
  const e = new SyntaxError(u);
  return e.lineNumber = lu, e.columnNumber = eu, e;
}
var Fi = function(e, t, n) {
  const r = [];
  let i = "", o, a, F = "", h;
  if (t != null && typeof t == "object" && !Array.isArray(t) && (n = t.space, h = t.quote, t = t.replacer), typeof t == "function")
    a = t;
  else if (Array.isArray(t)) {
    o = [];
    for (const f of t) {
      let E;
      typeof f == "string" ? E = f : (typeof f == "number" || f instanceof String || f instanceof Number) && (E = String(f)), E !== void 0 && o.indexOf(E) < 0 && o.push(E);
    }
  }
  return n instanceof Number ? n = Number(n) : n instanceof String && (n = String(n)), typeof n == "number" ? n > 0 && (n = Math.min(10, Math.floor(n)), F = "          ".substr(0, n)) : typeof n == "string" && (F = n.substr(0, 10)), c("", { "": e });
  function c(f, E) {
    let s = E[f];
    switch (s != null && (typeof s.toJSON5 == "function" ? s = s.toJSON5(f) : typeof s.toJSON == "function" && (s = s.toJSON(f))), a && (s = a.call(E, f, s)), s instanceof Number ? s = Number(s) : s instanceof String ? s = String(s) : s instanceof Boolean && (s = s.valueOf()), s) {
      case null:
        return "null";
      case !0:
        return "true";
      case !1:
        return "false";
    }
    if (typeof s == "string")
      return l(s);
    if (typeof s == "number")
      return String(s);
    if (typeof s == "object")
      return Array.isArray(s) ? y(s) : A(s);
  }
  function l(f) {
    const E = {
      "'": 0.1,
      '"': 0.2
    }, s = {
      "'": "\\'",
      '"': '\\"',
      "\\": "\\\\",
      "\b": "\\b",
      "\f": "\\f",
      "\n": "\\n",
      "\r": "\\r",
      "	": "\\t",
      "\v": "\\v",
      "\0": "\\0",
      "\u2028": "\\u2028",
      "\u2029": "\\u2029"
    };
    let w = "";
    for (let P = 0; P < f.length; P++) {
      const R = f[P];
      switch (R) {
        case "'":
        case '"':
          E[R]++, w += R;
          continue;
        case "\0":
          if (L.isDigit(f[P + 1])) {
            w += "\\x00";
            continue;
          }
      }
      if (s[R]) {
        w += s[R];
        continue;
      }
      if (R < " ") {
        let ru = R.charCodeAt(0).toString(16);
        w += "\\x" + ("00" + ru).substring(ru.length);
        continue;
      }
      w += R;
    }
    const v = h || Object.keys(E).reduce((P, R) => E[P] < E[R] ? P : R);
    return w = w.replace(new RegExp(v, "g"), s[v]), v + w + v;
  }
  function A(f) {
    if (r.indexOf(f) >= 0)
      throw TypeError("Converting circular structure to JSON5");
    r.push(f);
    let E = i;
    i = i + F;
    let s = o || Object.keys(f), w = [];
    for (const P of s) {
      const R = c(P, f);
      if (R !== void 0) {
        let ru = C(P) + ":";
        F !== "" && (ru += " "), ru += R, w.push(ru);
      }
    }
    let v;
    if (w.length === 0)
      v = "{}";
    else {
      let P;
      if (F === "")
        P = w.join(","), v = "{" + P + "}";
      else {
        let R = `,
` + i;
        P = w.join(R), v = `{
` + i + P + `,
` + E + "}";
      }
    }
    return r.pop(), i = E, v;
  }
  function C(f) {
    if (f.length === 0)
      return l(f);
    const E = String.fromCodePoint(f.codePointAt(0));
    if (!L.isIdStartChar(E))
      return l(f);
    for (let s = E.length; s < f.length; s++)
      if (!L.isIdContinueChar(String.fromCodePoint(f.codePointAt(s))))
        return l(f);
    return f;
  }
  function y(f) {
    if (r.indexOf(f) >= 0)
      throw TypeError("Converting circular structure to JSON5");
    r.push(f);
    let E = i;
    i = i + F;
    let s = [];
    for (let v = 0; v < f.length; v++) {
      const P = c(String(v), f);
      s.push(P !== void 0 ? P : "null");
    }
    let w;
    if (s.length === 0)
      w = "[]";
    else if (F === "")
      w = "[" + s.join(",") + "]";
    else {
      let v = `,
` + i, P = s.join(v);
      w = `[
` + i + P + `,
` + E + "]";
    }
    return r.pop(), i = E, w;
  }
};
const Ci = {
  parse: Di,
  stringify: Fi
};
var Ei = Ci;
const Ai = ["ConsoleCommands", "SaveBackup"];
function Ce(u, e = {}) {
  if (!M.existsSync(u)) return e;
  const t = M.readdirSync(u, { withFileTypes: !0 });
  for (const n of t) {
    const r = p.join(u, n.name);
    if (!n.isDirectory()) continue;
    if (Ai.includes(n.name)) {
      e[n.name] = {
        uniqueId: n.name,
        // UniqueID 대신 폴더명을 UniqueID처럼 사용
        name: n.name,
        path: r,
        enabled: !0,
        // 무조건 활성화
        required: !0
        // UI에서 꺼지지 않도록 표시할 수 있음
      };
      continue;
    }
    const i = p.join(r, "manifest.json"), o = ku(i);
    o ? e[o.UniqueID] = {
      uniqueId: o.UniqueID,
      name: o.Name ?? n.name,
      path: r,
      enabled: !0
    } : Ce(r, e);
  }
  return e;
}
function Ee(u) {
  M.existsSync(x.CONFIG_PATH) || M.mkdirSync(x.CONFIG_PATH);
  const e = JSON.parse(M.readFileSync(x.CONFIG_PATH, "utf-8"));
  if (!u) return e;
  let t = e[u];
  if (!t) {
    const n = Ce(x.MODS_DIR);
    t = {};
    for (const [r, i] of Object.entries(n))
      t[r] = {
        name: i.name,
        enabled: i.enabled
      };
  }
  return di(t);
}
function yi(u, e) {
  const t = mi(
    u,
    x.MODS_DIR,
    e
  ), r = {
    ...Uu(),
    ...t
  };
  M.writeFileSync(
    x.CONFIG_PATH,
    JSON.stringify(r, null, 2),
    "utf-8"
  );
}
function mi(u, e, t) {
  const n = {};
  function r(i, o) {
    for (const a of Object.keys(i)) {
      const F = p.join(o, a), h = p.join(F, "manifest.json");
      if (M.existsSync(h))
        try {
          const c = ku(h);
          c != null && c.UniqueID && (n[c.UniqueID] = {
            name: a,
            enabled: i[a].enabled
            // 트리 안에 값이 있으면 반영
          });
        } catch (c) {
          console.error("manifest.json parse error:", h, c);
        }
      typeof i[a] == "object" && Object.keys(i[a]).length > 0 && r(i[a], F);
    }
  }
  return r(u, e), {
    [t]: n
  };
}
function ku(u) {
  if (!M.existsSync(u)) return null;
  try {
    const e = M.readFileSync(u, "utf-8"), t = Ei.parse(e);
    return t && t.UniqueID ? t : null;
  } catch (e) {
    return console.warn(`⚠️ manifest.json parse failed: ${u}`, e), null;
  }
}
function di(u) {
  const e = {};
  for (const [t, { enabled: n }] of Object.entries(u)) {
    const r = hi(x.MODS_DIR, t);
    if (!r) continue;
    const o = p.relative(x.MODS_DIR, r).split(p.sep);
    let a = e;
    o.forEach((F, h) => {
      a[F] || (a[F] = {}), h === o.length - 1 && (a[F].uniqueId = t, a[F].enabled = n), a = a[F];
    });
  }
  return e;
}
function hi(u, e) {
  function t(n) {
    if (!M.existsSync(n)) return null;
    const r = M.readdirSync(n, { withFileTypes: !0 });
    for (const i of r) {
      const o = p.join(n, i.name);
      if (i.isDirectory()) {
        const a = p.join(o, "manifest.json");
        if (M.existsSync(a))
          try {
            if (ku(a).UniqueID === e)
              return o;
          } catch {
          }
        const F = t(o);
        if (F) return F;
      }
    }
    return null;
  }
  return t(u);
}
function Uu() {
  return M.existsSync(x.CONFIG_PATH) ? JSON.parse(M.readFileSync(x.CONFIG_PATH, "utf-8")) : {};
}
function pi() {
  const u = Uu();
  return Object.keys(u);
}
function Bi(u, e) {
  const t = Ee(u);
  if (t[u])
    throw new Error(`Preset "${u}" already exists.`);
  t[u] = e, yt(u, t);
}
function At(u) {
  return Ee(u);
}
function Si(u, e, t) {
  const r = {
    ...At(u),
    ...t
  };
  yt(e, r), u !== e && mt(u);
}
function yt(u, e) {
  yi(e, u);
}
function mt(u) {
  let e = Uu();
  delete e[u], M.writeFileSync(
    x.CONFIG_PATH,
    JSON.stringify(e, null, 2),
    "utf-8"
  );
}
function wi() {
  const u = x.MODS_DIR;
  return M.existsSync(u) ? M.readdirSync(u).filter((e) => {
    const t = p.join(u, e);
    return M.statSync(t).isDirectory();
  }) : [];
}
function dt() {
  if (!T.existsSync(x.INFO_PATH))
    return {};
  try {
    const u = T.readFileSync(x.INFO_PATH, "utf-8");
    return JSON.parse(u);
  } catch (u) {
    return console.error("⚠️ Failed to read Info.json:", u), {};
  }
}
function vi(u) {
  const t = { ...dt(), ...u };
  try {
    T.writeFileSync(
      x.INFO_PATH,
      JSON.stringify(t, null, 2),
      "utf-8"
    );
  } catch (n) {
    console.error("⚠️ Failed to write Info.json:", n);
  }
}
let Qu;
function gi() {
  Qu = new $t({
    minWidth: 560,
    minHeight: 700,
    width: 560,
    height: 800,
    icon: p.join(
      Ru.isPackaged ? process.resourcesPath : p.join(x.__dirname, "public"),
      "Stardrop.png"
    ),
    // 아이콘 경로
    webPreferences: {
      preload: p.join(x.__dirname, "preload.mjs"),
      contextIsolation: !0,
      nodeIntegration: !1
    }
  }), process.env.VITE_DEV_SERVER_URL ? Qu.loadURL(process.env.VITE_DEV_SERVER_URL) : Qu.loadFile(p.join(x.__dirname, "../dist/index.html"));
}
Ru.whenReady().then(gi);
function ht(u) {
  return p.join(u, "../", "Mods");
}
function pt(u) {
  if (!T.existsSync(u)) return {};
  const e = {}, t = T.readdirSync(u);
  for (const n of t) {
    const r = p.join(u, n);
    if (!T.statSync(r).isDirectory()) continue;
    const i = p.join(r, "manifest.json");
    if (T.existsSync(i))
      e[n] = [];
    else {
      const o = pt(r);
      Object.keys(o).length > 0 && (e[n] = o);
    }
  }
  return e;
}
Y.handle("get-mod-list-tree", () => pt(x.MODS_DIR));
Y.handle(
  "apply-mods",
  async (u, e, t) => {
    if (!e) throw new Error("smapiPath is not provided");
    const n = ht(e), r = Ce(x.MODS_DIR);
    for (const [i, o] of Object.entries(t)) {
      const a = o.uniqueId ?? i, F = r[a];
      if (!F || !o.enabled)
        continue;
      const h = F.path, c = p.join(n, p.basename(h));
      if (o.enabled)
        try {
          await T.copy(h, c, { overwrite: !0 });
        } catch (l) {
          console.error(`❌ Failed to copy ${a}:`, l);
        }
      else
        try {
          T.existsSync(c) && await T.remove(c);
        } catch (l) {
          console.error(`❌ Failed to remove ${a}:`, l);
        }
    }
  }
);
Y.handle("read-config", async () => Ee());
Y.handle("open-mods-folder", async () => {
  T.existsSync(x.MODS_DIR) || T.mkdirSync(x.MODS_DIR), Pt.openPath(x.MODS_DIR);
});
Y.handle("get-presets", () => Uu() || {});
Y.handle("get-preset-list", () => pi());
Y.handle("get-mods", () => wi());
Y.handle("read-info", () => dt());
Y.handle("write-info", (u, e) => vi(e));
async function Bt(u, e) {
  const t = T.readdirSync(u, { withFileTypes: !0 });
  for (const n of t) {
    const r = p.join(u, n.name), i = p.join(e, n.name);
    if (n.isDirectory()) {
      const o = p.join(r, "manifest.json");
      if (T.existsSync(o))
        try {
          const F = ku(o).UniqueID;
          if (!F) continue;
          if (!T.existsSync(i))
            await T.copy(r, i);
          else {
            const h = p.join(
              i,
              "manifest.json"
            ), c = p.join(
              i,
              "config.json"
            ), l = p.join(r, "config.json");
            T.existsSync(h) && ku(h).UniqueID === F && T.existsSync(l) && await T.copyFile(l, c);
          }
        } catch (a) {
          console.error(`Failed to sync mod at ${r}:`, a);
        }
      else
        await Bt(r, i);
    }
  }
}
Y.handle("sync-config-ingame", async (u, e) => {
  if (!e) throw new Error("smapiPath is not provided");
  const t = ht(e), n = x.MODS_DIR;
  return await Bt(t, n), { success: !0 };
});
Y.handle("reset-mods", async (u, e) => {
  try {
    await T.emptyDir(p.join(e, "../", "Mods"));
  } catch (t) {
    throw console.error("Error resetting mods:", t), t;
  }
});
Y.handle(
  "create-preset",
  (u, e, t) => {
    Bi(e, t);
  }
);
Y.handle(
  "update-preset",
  (u, e, t, n) => {
    Si(e, t, n);
  }
);
Y.handle("read-preset", (u, e) => At(e));
Y.handle("delete-preset", (u, e) => {
  mt(e);
});
Y.handle("get-locale", () => Ru.getLocale().startsWith("ko") ? "ko" : "en");
Y.handle("get-translations", (u, e) => {
  const t = p.join(x.__dirname, "locales", `${e}.json`);
  return T.existsSync(t) ? JSON.parse(T.readFileSync(t, "utf-8")) : {};
});
