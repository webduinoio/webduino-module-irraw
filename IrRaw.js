+(function (factory) {
  if (typeof exports === 'undefined') {
    factory(webduino || {});
  } else {
    module.exports = factory;
  }
}(function (scope) {
  'use strict';

  var Module = scope.Module,
    BoardEvent = scope.BoardEvent;
  var proto;
  var sendLen = 32;
  var lastSendIR = false;
  var debugFlag = false;

  function log(obj) {
    if (debugFlag) {
      console.log(obj);
    }
  }

  function IrRaw(board, pinMapping) {
    Module.call(this);
    this._board = board;
    this.pinSendIR = this.pinRecvIR = -1;
    // this = this;
    if (typeof pinMapping === 'object') {
      if (pinMapping['send']) {
        this.pinSendIR = pinMapping['send'];
      }
      if (pinMapping['recv']) {
        this.pinRecvIR = pinMapping['recv'];
      }
    }
    onMessage(this);
  }

  function onMessage(self) {
    self._board.on(webduino.BoardEvent.SYSEX_MESSAGE, function (event) {
      var m = event.message;
      //send IR data to Board
      if (m[0] == 0x04 && m[1] == 0x09 && m[2] == 0x0B) {
        log("send IR data to Board callback");
        if (lastSendIR) {
          //store OK
          lastSendIR = false;
          log("send pin:" + self.pinSendIR);
          self._board.send([0xf0, 0x04, 0x09, 0x0C, self.pinSendIR, 0xF7]);
        }
      }
      //trigger IR send
      else if (m[0] == 0x04 && m[1] == 0x09 && m[2] == 0x0C) {
        log("trigger IR send callback...");
        self.irSendCallback();
      }
      //record IR data
      else if (m[0] == 0x04 && m[1] == 0x09 && m[2] == 0x0D) {
        log("record IR callback...");
        var strInfo = '';
        for (var i = 3; i < m.length; i++) {
          strInfo += String.fromCharCode(m[i]);
        }      
        self.irData = strInfo;
        self.irRecvCallback(self.irData);
      } else {
        log(event);
      }
    });
  }


  function send(startPos, data, self) {
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
    // console.log(raw);
    self._board.send(raw);
  }

  function sendIRCmd(cmd, len, self) {
    for (var i = 0; i < cmd.length; i = i + len) {
      var data = cmd.substring(i, i + len);
      send(i / 4, data, self);
    }
    lastSendIR = true;
  }

  IrRaw.prototype = proto = Object.create(Module.prototype, {
    constructor: {
      value: IrRaw
    }
  });

  proto.receive = function (callback) {
    console.log("receive:" + this.pinRecvIR);
    this.irRecvCallback = callback;
    if (this.pinRecvIR > 0) {
      // this._board.send([0xF0, 0x04, 0x09, 0x0D, this.pinRecvIR, 0xF7]);
      this._board.send([0xF0, 0x04, 0x0A, 0x00, 0x02, 0xF7]);
      log("wait for receiving...");
    }
  };

  proto.send = function (data, callback) {
    console.log("send:" + this.pinSendIR);
    if (this.pinSendIR > 0) {
      sendIRCmd(data, sendLen, this);
      this.irSendCallback = callback;
    }
  }

  proto.debug = function (val) {
    if (typeof val == 'boolean') {
      this.isDebug = val;
    }
  }

  proto.sendPin = function (pin) {
    this.pinSendIR = pin;
  }
  proto.recvPin = function (pin) {
    this.pinRecvIR = pin;
  }

  scope.module.IrRaw = IrRaw;
}));
