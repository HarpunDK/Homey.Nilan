'use strict';

import Homey from 'homey';

class NilanApp extends Homey.App {

  /**
   * onInit is called when the app is initialized.
   */
  async onInit() {
    this.log('NilanApp has been initialized');

    // const client = new ModbusRTU();
    // await client.connectTCP("192.168.1.107", { port: 502 });
    // client.setID(1);

    // await client.readHoldingRegisters(1328, 1).then(data => {
    //   this.log("Resp", data);
    // }).catch(error => {
    //   this.error(error);
    // })
    // .finally(() => {
    //   this.log("Done.");
    // });

  }

}

module.exports = NilanApp;
