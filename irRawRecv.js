+(function (factory) {
  if (typeof exports === 'undefined') {
    factory(webduino || {});
  } else {
    module.exports = factory;
  }
}(function (scope) {
  'use strict';

  var Module = scope.Module;
  var proto;
  var self;

  function IrRawRecv(board, pinRecvIR) {
    console.log("debug IrRawRecv");
    self = this;
    Module.call(self);
    self._board = board;

    self._irInfo = "";
    self._pinRecvIR = pinRecvIR;
    onMessage();
  }

  function onMessage() {
    self._board.on(webduino.BoardEvent.SYSEX_MESSAGE, function (event) {
      var m = event.message;

      //record IR data
      if (m[0] == 0x04 && m[1] == 0x09 && m[2] == 0x0D) {
        var strData = "";
        for (var i = 3; i < m.length; i++) {
          strData += String.fromCharCode(m[i]);
        }
        self._irInfo += strData;

      }
      else if (m[0] == 0x04 && m[1] == 0x09 && m[2] == 0x0E) {
        self.irRecvCallback(self._irInfo);
        self._irInfo = "";
      }
    });
  }

  IrRawRecv.prototype = proto = Object.create(Module.prototype, {
    constructor: {
      value: IrRawRecv
    }
  });

  proto.receive = function (callback) {
    console.log("receive");
    self.irRecvCallback = callback;
    if (self._pinRecvIR > 0) {
      self._board.send([0xF0, 0x04, 0x0A, 0x00, 0x02, 0xF7]);
    }
  };

  proto.stopRecv = function () {
    console.log("stop receive");
    self._board.send([0xF0, 0x04, 0x0A, 0x01, 0xF7]);
  }

  scope.module.IrRawRecv = IrRawRecv;
}));
