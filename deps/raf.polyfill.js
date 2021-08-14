// deno-lint-ignore-file
import __performance_now$ from "https://esm.sh/performance-now";
var __global$ = window;
/**
 * 
 * @param {*} n 
 * @returns 
 */
var u = n => 
{
    return require(n);
};
/**
 * @param {*} n 
 * @param {*} e
 * @return {Function}
 */
function y (n, e) {
    return () => (e || n((e = { exports: {} }).exports, e), e.exports);
}
/**
 * 
 * @param {*} _A 
 * @param {*} h 
 */
const pq = (_A, h) =>
{
    var x = __performance_now$, 
        /** @type {*} */
        l = typeof window == "undefined" ? __global$ : window, 
        i = ["moz", "webkit"], 
        a = "AnimationFrame", 
        c = l["request" + a], 
        o = l["cancel" + a] || l["cancelRequest" + a];
    for (t = 0; !c && t < i.length; t++)
        c = l[i[t] + "Request" + a], 
        o = l[i[t] + "Cancel" + a] || l[i[t] + "CancelRequest" + a];
    var t;
    (!c || !o) && (p = 0, m = 0, r = [], v = 1e3 / 60,
        c = function (/** @type {any} */ n)
        {
            if (r.length === 0) 
            {
                var e = x(), d = Math.max(0, v - (e - p));
                p = d + e, setTimeout(function ()
                {
                    var s = r.slice(0);
                    r.length = 0;
                    for (var f = 0; f < s.length; f++)
                        if (!s[f].cancelled)
                            try { s[f].callback(p); }
                            catch (w) { setTimeout(function () { throw w; }, 0); }
                }, Math.round(d));
            }
            return r.push({ handle: ++m, callback: n, cancelled: !1 }), m;
        },
        o = function (/** @type {any} */ n)
        {
            for (var e = 0; e < r.length; e++)
                r[e].handle === n && (r[e].cancelled = !0);
        });
    
    var /** @type {*} */ p, /** @type {*} */ m, /** @type {*} */ r, /** @type {*} */ v;
    h.exports = function (/** @type {any} */ n) { return c.call(l, n); };
    h.exports.cancel = function () { o.apply(l, arguments); };
    h.exports.polyfill = function (/** @type {Window & typeof globalThis} */ n)
    { n || (n = l), n.requestAnimationFrame = c, n.cancelAnimationFrame = o; };
};
const g = y(pq, undefined);

g().polyfill();
