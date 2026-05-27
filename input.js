(function () {
  const state = {
    MOVE_LEFT: false,
    MOVE_RIGHT: false,
    JUMP: false,
    GLITCH_ACTION: false,
    PAUSE: false
  };

  const keyMap = {
    ArrowLeft: "MOVE_LEFT",
    a: "MOVE_LEFT",
    A: "MOVE_LEFT",
    ArrowRight: "MOVE_RIGHT",
    d: "MOVE_RIGHT",
    D: "MOVE_RIGHT",
    ArrowUp: "JUMP",
    w: "JUMP",
    W: "JUMP",
    " ": "JUMP",
    Shift: "GLITCH_ACTION",
    Escape: "PAUSE",
    p: "PAUSE",
    P: "PAUSE"
  };

  function setKey(e, value) {
    const action = keyMap[e.key];
    if (!action) return;
    state[action] = value;
    if ([" ", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
      e.preventDefault();
    }
  }

  window.addEventListener("keydown", function (e) {
    setKey(e, true);
  });

  window.addEventListener("keyup", function (e) {
    setKey(e, false);
  });

  function bindTouchButtons() {
    document.querySelectorAll("[data-action]").forEach(function (button) {
      const action = button.getAttribute("data-action");

      button.addEventListener("touchstart", function (e) {
        e.preventDefault();
        state[action] = true;
      }, { passive: false });

      button.addEventListener("touchend", function (e) {
        e.preventDefault();
        state[action] = false;
      }, { passive: false });

      button.addEventListener("touchcancel", function (e) {
        e.preventDefault();
        state[action] = false;
      }, { passive: false });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bindTouchButtons);
  } else {
    bindTouchButtons();
  }

  window.Input = {
    get: function (action) {
      return !!state[action];
    }
  };
})();
