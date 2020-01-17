+(function (window, webduino) {

  'use strict';

  /* this function for old version */
  window.getIrRaw = function (board, pinMapping) {
    return new webduino.module.IrRaw(board, pinMapping);
  };

  window.getIrRawSend = function (board, pinSendIR) {
    return new webduino.module.IrRawSend(board, pinSendIR);
  };

  window.getIrRawRecv = function (board, pinRecvIR) {
    return new webduino.module.IrRawRecv(board, pinRecvIR);
  };

}(window, window.webduino));
