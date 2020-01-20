+(function (factory) {
  if (typeof exports === 'undefined') {
    factory(webduino || {});
  } else {
    module.exports = factory;
  }
}(function (scope) {
  'use strict';

  let Module = scope.Module;
  let WEBDUINO_COMMAND = 0x04;
  let SENSOR_IRRSEND = 0x09;
  let START_POS = 0x0A;
  let SEND_RAW_DATA = 0x0B;
  let TRIGGER_IR = 0x0C;
  let proto;
  let sendLen = 32;
  let self;

  function IrRawSend(board, pinSendIR) {
    self = this;
    Module.call(self);
    self._board = board;
    self._pinSendIR = pinSendIR;
    onMessage();
  }

  function onMessage() {
    self._board.on(webduino.BoardEvent.SYSEX_MESSAGE, function (event) {
      let m = event.message;
      if (m[0] == WEBDUINO_COMMAND && m[1] == SENSOR_IRRSEND && m[2] == TRIGGER_IR) {
        self.irSendCallback();
      }
    });
  }


  function send(startPos, data) {

    let CMD = [0xf0, WEBDUINO_COMMAND, SENSOR_IRRSEND, START_POS];
    let raw = [];
    raw = raw.concat(CMD);
    let n = '0000' + startPos.toString(16);
    n = n.substring(n.length - 4);
    for (let i = 0; i < 4; i++) {
      raw.push(n.charCodeAt(i));
    }
    raw.push(0xf7);

    // send raw data 
    CMD = [0xf0, WEBDUINO_COMMAND, SENSOR_IRRSEND, SEND_RAW_DATA];
    raw = raw.concat(CMD);
    for (let i = 0; i < data.length; i++) {
      raw.push(data.charCodeAt(i));
    }
    raw.push(0xf7);
    // console.log(raw);
    self._board.send(raw);
  }

  function sendIRCmd(cmd, len) {
    for (let i = 0; i < cmd.length; i = i + len) {
      let data = cmd.substring(i, i + len);
      send(i / 4, data);
    }
    self._board.send([0xf0, WEBDUINO_COMMAND, SENSOR_IRRSEND, TRIGGER_IR, self._pinSendIR, 0xF7]);
  }

  IrRawSend.prototype = proto = Object.create(Module.prototype, {
    constructor: {
      value: IrRawSend
    }
  });

  proto.send = (data, callback) => {
    sendIRCmd(data, sendLen);
    self.irSendCallback = callback;
  }

  scope.module.IrRawSend = IrRawSend;
}));
