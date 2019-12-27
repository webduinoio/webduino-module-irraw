+(function (window, webduino) {

  'use strict';

  window.getIrRawSend = function (board, pinSendIR) {
    return new webduino.module.IrRawSend(board, pinSendIR);
  };

  window.getIrRawRecv = function (board, pinRecvIR) {
    return new webduino.module.IrRawRecv(board, pinRecvIR);
  };

}(window, window.webduino));
