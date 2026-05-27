(function () {
  const KEY = "glitch_protocol_save";

  function defaultState() {
    return {
      currentLevel: 1,
      collectedItems: [],
      bits: 10,
      cameraChipCollected: false
    };
  }

  window.Save = {
    defaultState: defaultState,

    read: function () {
      try {
        const raw = localStorage.getItem(KEY);
        if (!raw) return defaultState();
        return Object.assign(defaultState(), JSON.parse(raw));
      } catch (e) {
        return defaultState();
      }
    },

    write: function (data) {
      const next = Object.assign(defaultState(), this.read(), data || {});
      localStorage.setItem(KEY, JSON.stringify(next));
      return next;
    },

    clear: function () {
      localStorage.removeItem(KEY);
    }
  };
})();
