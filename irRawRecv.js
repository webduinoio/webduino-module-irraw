+(function (factory) {
  if (typeof exports === 'undefined') {
    factory(webduino || {});
  } else {
    module.exports = factory;
  }
}(function (scope) {
  'use strict';

  let Module = scope.Module;
  let proto;
  let self;
  let WEBDUINO_COMMAND = 0x04;
  let SENSOR_RECV = 0x0A;
  let INIT_RECV = 0x00;
  let STOP_RECV = 0x01;
  let RECORD_RAW_DATA = 0x02;
  let RECORD_FINISH = 0x03;
  
  function IrRawRecv(board, pinRecvIR) {
    self = this;
    Module.call(self);
    self._board = board;

    self._irInfo = "";
    self._pinRecvIR = pinRecvIR;
    onMessage();
  }

  function onMessage() {
    self._board.on(webduino.BoardEvent.SYSEX_MESSAGE, function (event) {
      let m = event.message;

      // record raw data
      if (m[0] == WEBDUINO_COMMAND && m[1] == SENSOR_RECV && m[2] == RECORD_RAW_DATA) {
        let strData = "";
        for (let i = 3; i < m.length; i++) {
          strData += String.fromCharCode(m[i]);
        }
        self._irInfo += strData;
      }

      // record finish
      else if (m[0] == WEBDUINO_COMMAND && m[1] == SENSOR_RECV && m[2] == RECORD_FINISH) {
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

  proto.receive = (callback) => {
    self.irRecvCallback = callback;
    if (self._pinRecvIR > 0) {
      self._board.send([0xF0, WEBDUINO_COMMAND, SENSOR_RECV, INIT_RECV, self._pinRecvIR, 0xF7]);
    }
  };

  proto.stopRecv = () => {
    self._board.send([0xF0, WEBDUINO_COMMAND, SENSOR_RECV, STOP_RECV, 0xF7]);
  }

  scope.module.IrRawRecv = IrRawRecv;
}));
