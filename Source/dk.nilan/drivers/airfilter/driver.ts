import Homey from 'homey';

class AirFilterDriver extends Homey.Driver {

  /**
   * onInit is called when the driver is initialized.
   */
  async onInit() {
    
    this.log('AirFilterDriver has been initialized');
  }

  /**
   * onPairListDevices is called when a user is adding a device and the 'list_devices' view is called.
   * This should return an array with the data of devices that are available for pairing.
   */
  async onPairListDevices() {
    return [
      {
        "name": 'Compact P - Air 9 ',
        "data": {
          "id": 'compact_p_air_9',
        }
      }
    ];
  }

}

module.exports = AirFilterDriver;
