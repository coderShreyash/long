(function(window, document, undefined) {
  "use strict";
  
  var elax = document.getElementById("ax"),
      elay = document.getElementById("ay"),
      elaz = document.getElementById("az"),
      elagx = document.getElementById("agx"),
      elagy = document.getElementById("agy"),
      elagz = document.getElementById("agz"),
      sens = 0.05,
      dec = 2,
      a = null,
      ag = null;

  var mouseListener = function(event) {
    if(null !== event.acceleration) {
      a = event.acceleration;
      elax.innerHTML = Math.abs((a.x * sens).toFixed(dec));
      elay.innerHTML = Math.abs((a.y * sens).toFixed(dec));
      elaz.innerHTML = Math.abs((a.z * sens).toFixed(dec));
    }
    
    
    if(null !== event.accelerationIncludingGravity) {
      ag = event.accelerationIncludingGravity;
      elagx.innerHTML = (ag.x * sens).toFixed(dec);
      elagy.innerHTML = (ag.y * sens).toFixed(dec);
      elagz.innerHTML = (ag.z * sens).toFixed(dec);
    }
    
  };
  
  window.addEventListener("devicemotion", mouseListener, false);
})(window, document);