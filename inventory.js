(function () {
  const buffer = new Uint8Array(1);
  buffer[0] = 10;

  window.Inventory = {
    bonus: 0,

    getBits: function () {
      return buffer[0];
    },

    spendBits: function (n) {
      buffer[0] = buffer[0] - n;
      return buffer[0];
    },

    addBits: function (n) {
      buffer[0] = buffer[0] + n;
      return buffer[0];
    },

    canAfford: function (price) {
      return (buffer[0] + this.bonus) >= price;
    },

    reset: function () {
      buffer[0] = 10;
      this.bonus = 0;
    }
  };
})();
