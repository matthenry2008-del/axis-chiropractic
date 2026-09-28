/* ==========================================================================
   Axis Chiropractic — demo password screen
   Keeps casual visitors out of the demo. This is NOT real security: the site
   files are still publicly readable. Load in <head>, before styles render.
   ========================================================================== */
(function () {
  "use strict";

  // SHA-256 of the demo password (the password itself lives in DEMO_PASSWORD.txt,
  // which is kept off GitHub).
  var PASSWORD_HASH = "1835c9e3bd9e11a00cb9b0998b7a332569c532c77866b7aa47d7f73030aac767";
  var STORAGE_KEY = "axis-demo-unlocked";

  function isUnlocked() {
    try { return localStorage.getItem(STORAGE_KEY) === PASSWORD_HASH; } catch (e) { return false; }
  }
  if (isUnlocked()) return;

  // hide the real page until the right password is entered
  var hide = document.createElement("style");
  hide.textContent =
    "body > *:not(#demo-gate){display:none !important}" +
    "#demo-gate{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;" +
    "padding:16px;background:#FBFCFD;font-family:'Instrument Sans',system-ui,sans-serif;color:#122A3E;z-index:2147483647}" +
    "#demo-gate form{width:100%;max-width:360px;text-align:center}" +
    "#demo-gate .logo{font-family:'Cormorant Garamond',Georgia,serif;font-size:30px;font-weight:600;letter-spacing:.3em;margin-right:-.3em}" +
    "#demo-gate p{font-size:14px;color:rgba(18,42,62,.65);margin:10px 0 22px}" +
    "#demo-gate input{width:100%;box-sizing:border-box;font:inherit;font-size:16px;padding:12px 14px;" +
    "border:1.5px solid rgba(18,42,62,.24);border-radius:10px;background:#fff;color:inherit}" +
    "#demo-gate input:focus{outline:2px solid #1F6FB2;outline-offset:1px}" +
    "#demo-gate button{width:100%;margin-top:10px;font:inherit;font-weight:700;font-size:15px;padding:12px;" +
    "border:0;border-radius:10px;background:#1F6FB2;color:#fff;cursor:pointer}" +
    "#demo-gate .err{min-height:20px;margin-top:10px;font-size:13.5px;color:#B3261E}";
  document.head.appendChild(hide);

  function sha256Hex(text) {
    return crypto.subtle.digest("SHA-256", new TextEncoder().encode(text)).then(function (buf) {
      return Array.prototype.map.call(new Uint8Array(buf), function (b) {
        return ("0" + b.toString(16)).slice(-2);
      }).join("");
    });
  }

  function showGate() {
    var gate = document.createElement("div");
    gate.id = "demo-gate";
    gate.innerHTML =
      '<form autocomplete="off">' +
      '<div class="logo">AXIS</div>' +
      '<p>This is a private preview. Enter the password to continue.</p>' +
      '<input type="password" aria-label="Password" placeholder="Password" required>' +
      '<button type="submit">View site</button>' +
      '<div class="err" role="alert"></div>' +
      "</form>";
    document.body.appendChild(gate);

    var form = gate.querySelector("form");
    var input = gate.querySelector("input");
    var err = gate.querySelector(".err");
    input.focus();

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      sha256Hex(input.value.trim()).then(function (hash) {
        if (hash !== PASSWORD_HASH) {
          err.textContent = "That password isn't right. Please try again.";
          input.select();
          return;
        }
        try { localStorage.setItem(STORAGE_KEY, hash); } catch (e2) {}
        gate.remove();
        hide.remove();
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", showGate);
  } else {
    showGate();
  }
})();
