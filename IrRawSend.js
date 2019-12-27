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
  var sendLen = 32;
  var self;
  var lastSendIR = false;

  function IrRawSend(board, pinSendIR) {
    console.log("debug IrRawSend");
    self = this;
    Module.call(self);
    self._board = board;
    self._pinSendIR = pinSendIR;

    onMessage();
  }

  function onMessage() {
    self._board.on(webduino.BoardEvent.SYSEX_MESSAGE, function (event) {
      var m = event.message;

      if (m[0] == 0x04 && m[1] == 0x09 && m[2] == 0x0B) {
        if (lastSendIR) {
          //store OK
          lastSendIR = false;
          self._board.send([0xf0, 0x04, 0x09, 0x0C, self._pinSendIR, 0xF7]);
        }
      }
      //trigger IR send
      else if (m[0] == 0x04 && m[1] == 0x09 && m[2] == 0x0C) {
        self.irSendCallback();
      }
    });
  }


  function send(startPos, data) {

    var CMD = [0xf0, 0x04, 0x09, 0x0A];
    var raw = [];
    raw = raw.concat(CMD);
    var n = '0000' + startPos.toString(16);
    n = n.substring(n.length - 4);
    for (var i = 0; i < 4; i++) {
      raw.push(n.charCodeAt(i));
    }
    raw.push(0xf7);
    // send Data //  
    CMD = [0xf0, 0x04, 0x09, 0x0B];
    raw = raw.concat(CMD);
    for (i = 0; i < data.length; i++) {
      raw.push(data.charCodeAt(i));
    }
    raw.push(0xf7);
    self._board.send(raw);
  }

  function sendIRCmd(cmd, len) {
    for (var i = 0; i < cmd.length; i = i + len) {
      var data = cmd.substring(i, i + len);
      send(i / 4, data);
    }
    lastSendIR = true;
  }

  IrRawSend.prototype = proto = Object.create(Module.prototype, {
    constructor: {
      value: IrRawSend
    }
  });

  proto.send = function (data, callback) {
    sendIRCmd(data, sendLen);
    self.irSendCallback = callback;
  }

  scope.module.IrRawSend = IrRawSend;
}));
