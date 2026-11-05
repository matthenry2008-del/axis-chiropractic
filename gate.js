/* ==========================================================================
   Axis Chiropractic, demo password screen
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
    "padding:16px;background:#000;font-family:Archivo,'Helvetica Neue',Arial,sans-serif;color:#e9eae7;z-index:2147483647}" +
    "#demo-gate form{width:100%;max-width:360px}" +
    "#demo-gate img{width:180px;height:auto;margin:0 0 28px}" +
    "#demo-gate p{font-size:16px;line-height:1.5;color:#a9adaf;margin:0 0 20px}" +
    "#demo-gate label{display:block;font-weight:650;font-size:15px;color:#fff;margin-bottom:6px}" +
    "#demo-gate input{width:100%;box-sizing:border-box;font:inherit;font-size:17px;padding:12px 14px;min-height:50px;" +
    "border:1.5px solid #767c80;border-radius:4px;background:#fff;color:#191c1e}" +
    "#demo-gate input:focus{outline:3px solid #fff;outline-offset:2px}" +
    "#demo-gate button{width:100%;margin-top:12px;font:inherit;font-weight:650;font-size:16px;min-height:50px;" +
    "border:0;border-radius:4px;background:#fff;color:#000;cursor:pointer}" +
    "#demo-gate button:focus-visible{outline:3px solid #d01117;outline-offset:3px}" +
    "#demo-gate .err{min-height:22px;margin-top:12px;font-size:15px;font-weight:600;color:#ff8a8f}";
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
      '<img src="assets/axis-logo.png" alt="Axis Chiropractic">' +
      '<p>This is a private preview. Enter the password to continue.</p>' +
      '<label for="demo-pw">Password</label>' +
      '<input id="demo-pw" type="password" required>' +
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
