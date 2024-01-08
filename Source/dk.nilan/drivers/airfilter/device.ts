import Homey from 'homey';
import _ from 'underscore';
import { INilanDevice } from '../../Service/INilanDevice';
import { NilanCompactPAir9Device } from '../../Service/NilanCompactPAir9Device';
import { ConnectionSettingsInfo } from '../../Domain/ConnectionSettingsInfo';
import { NilanDataReadInfo } from '../../Domain/NilanDataReadInfo';

class AirfilterDevice extends Homey.Device {

  /**
   * onInit is called when the device is initialized.
   */
  async onInit() {
    this.log('AirfilterDevice has been initialized');
    
    var deviceDriverInfo = this.getData().id;
    
    // --- --- --- --- ---
    var strategies = Array<INilanDevice>();
    strategies.push(new NilanCompactPAir9Device(this));
    
    var currentStrategy = _.find(strategies, (strategy) => strategy.GetSupportedDevice() == deviceDriverInfo) as INilanDevice;
    
    // Trigger
    const setpointFanSpeedTriggerCard         = this.homey.flow.getDeviceTriggerCard("setpoint-fan-speed-changed");
    const setpointUserTemperatureTriggerCard  = this.homey.flow.getDeviceTriggerCard("setpoint-user-temperature-changed");
    
    // Catch up right now

    var dataReadStartup = await this.PullDataCycle(currentStrategy);
    await this.SetCapabilityValues(dataReadStartup);

    this.homey.setInterval(async () => {
      var dataRead = await this.PullDataCycle(currentStrategy);

      // Var old-values: 
      var userFanSpeedOldValue    = await +(this.getStoreValue("UserFanSpeed") ?? 0);
      var userTemperatureOldValue = await +(this.getStoreValue("UserTemperature") ?? 0);

      await this.SetCapabilityValues(dataRead);

      if (dataRead.IsReadingComplete()){
        // Check if user-fan-changed
        if (userFanSpeedOldValue > 0 && userFanSpeedOldValue != dataRead.UserFanSpeed) {
          // Raise changed event
          this.log("CHANGED", "UserFan", dataRead.UserFanSpeed);
          await setpointFanSpeedTriggerCard.trigger(this);
          await this.setStoreValue("UserFanSpeed", dataRead.UserFanSpeed);
          await this.homey.notifications.createNotification({ excerpt: `${this.getName()}: User fan speed changed. New value: ${dataRead.UserFanSpeed}/4`});
        }

        if (userTemperatureOldValue > 0 && userTemperatureOldValue != dataRead.UserTemperature) {
          // Raise changed event
          this.log("CHANGED", "UserTemperature", dataRead.UserTemperature);
          await setpointUserTemperatureTriggerCard.trigger(this);
          await this.setStoreValue("UserTemperature", dataRead.UserTemperature);
          await this.homey.notifications.createNotification({ excerpt: `${this.getName()}: User temperature changed. New value: ${dataRead.UserTemperature}°C`});
        }
      }
    }, await this.PullIntervalSeconds() * 1000);

    //setpointFanSpeedTriggerCard.registerRunListener()

    // Conditions:
    const inletNeedServiceTrigger    = this.homey.flow.getConditionCard("inlet-filter-need-service");
    const outletNeedServiceTrigger   = this.homey.flow.getConditionCard("outlet-filter-need-service");
    const inletDaysToServiceTrigger  = this.homey.flow.getConditionCard("inlet-days-to-service");
    const outletDaysToServiceTrigger = this.homey.flow.getConditionCard("outlet-days-to-service");
    const outdoorDegreeIndicatorTrigger = this.homey.flow.getConditionCard("outdoor-degree-indicator");

    

    inletNeedServiceTrigger.registerRunListener(async () => {
      return this.getCapabilityValue("alarm_filter_inlet_capability") || false;
    });

    outletNeedServiceTrigger.registerRunListener(async () => {
      return this.getCapabilityValue("alarm_filter_outlet_capability") || false;
    });

    inletDaysToServiceTrigger.registerRunListener(async (args) => {
      var argDays = args.Days;
      return +(this.getCapabilityValue("days_filter_inlet_capability") || 0) < argDays;
    });

    outletDaysToServiceTrigger.registerRunListener(async (args) => {
      var argDays = args.Days;
      return +(this.getCapabilityValue("days_filter_outlet_capability") || 0) < argDays;
    });

    outdoorDegreeIndicatorTrigger.registerRunListener(async (args) => {
      var argDegree = args.Degree;
      return +(this.getCapabilityValue("temperature_outside_capability") || 0) < argDegree;
    });

  }

  private PullDataCycle = async (deviceStrategy: INilanDevice) : Promise<NilanDataReadInfo> => {
    var configuration = await this.GetConnectionSettings();
    var dataRead = await deviceStrategy.GetData(configuration);

    return dataRead;
  }

  /**
   * onAdded is called when the user adds the device, called just after pairing.
   */
  async onAdded() {
    this.log('AirfilterDevice has been added');
  }

  /**
   * onSettings is called when the user updates the device's settings.
   * @param {object} event the onSettings event data
   * @param {object} event.oldSettings The old settings object
   * @param {object} event.newSettings The new settings object
   * @param {string[]} event.changedKeys An array of keys changed since the previous version
   * @returns {Promise<string|void>} return a custom message that will be displayed
   */
  async onSettings({
    oldSettings,
    newSettings,
    changedKeys,
  }: {
    oldSettings: { [key: string]: boolean | string | number | undefined | null };
    newSettings: { [key: string]: boolean | string | number | undefined | null };
    changedKeys: string[];
  }): Promise<string | void> {
    this.log("AirfilterDevice settings where changed");

    if (_.contains(changedKeys, "device-ip")){
      var newDeviceIp = newSettings["device-ip"];
      this.log("Settings", "IP", newDeviceIp);
    };

    if (_.contains(changedKeys, "device-port")){
      var newPort = newSettings["device-port"];
      this.log("Settings", "PORT", newPort);
    };

    if (_.contains(changedKeys, "device-id")){
      var newDeviceId = newSettings["device-id"];
      this.log("Settings", "ID", newDeviceId);
    };

    if (_.contains(changedKeys, "update-rate")){
      var newUpdateRate = newSettings["update-rate"];
      this.log("Settings", "RATE", newUpdateRate);
    };

    
  }

  /**
   * onRenamed is called when the user updates the device's name.
   * This method can be used this to synchronise the name to the device.
   * @param {string} name The new name
   */
  async onRenamed(name: string) {
    this.log('AirfilterDevice was renamed');
  }

  /**
   * onDeleted is called when the user deleted the device.
   */
  async onDeleted() {
    this.log('AirfilterDevice has been deleted');
  }

  public GetConnectionSettings = async () => {    
    return new ConnectionSettingsInfo(this.getSetting("device-ip"), +(this.getSetting("device-port") ?? 502), +(this.getSetting("device-id") ?? 1));
  }

  private PullIntervalSeconds = async () => {
    return +(this.getSetting("update-rate") ?? 15);
  }

  private SetCapabilityValues = async (dataRead : NilanDataReadInfo) => {
    this.log("SetCapabilities", "WITH", dataRead);

    //await this.setCapabilityValue("generic_alarm", dataRead.ErrorRead);
    await this.setCapabilityValue("alarm_connection_capability", dataRead.ConnectionError);


    await this.setCapabilityValue("alarm_connection_capability", dataRead.ConnectionError);
    await this.setCapabilityValue("alarm_read_capability", dataRead.ErrorRead);
    await this.setCapabilityValue("temperature_outside_capability", dataRead.T1TempSensor);
    await this.setCapabilityValue("temperature_supply_capability", dataRead.T2TempSensor);
    await this.setCapabilityValue("temperature_extract_capability", dataRead.T3TempSensor);
    await this.setCapabilityValue("temperature_discharge_capability", dataRead.T4TempSensor);
    await this.setCapabilityValue("temperature_condenser_capability", dataRead.T5TempSensor);
    await this.setCapabilityValue("temperature_evaporator_capability", dataRead.T6TempSensor);
    await this.setCapabilityValue("temperature_master_capability", dataRead.TempMasterSensor);
    
    await this.setCapabilityValue("percentage_humidity_capability", dataRead.HumiditySensor);

    // Filter
    await this.setCapabilityValue("days_filter_inlet_capability", dataRead.InletFilterTimerPassDays);
    await this.setCapabilityValue("days_filter_outlet_capability", dataRead.OutletFilterTimerPassDays);
    
    await this.setCapabilityValue("alarm_filter_inlet_capability", dataRead.InletFilterTimerPassDays < 0);
    await this.setCapabilityValue("alarm_filter_outlet_capability", dataRead.OutletFilterTimerPassDays < 0);

    // Other
    await this.setCapabilityValue("water_bottom_temperature_capability", dataRead.TemperatureHotWaterBottom);
    await this.setCapabilityValue("water_top_temperature_capability", dataRead.TemperatureHotWaterTop);
    await this.setCapabilityValue("systemworkmode_capability", dataRead.SystemWorkMode);
    await this.setCapabilityValue("heater_external_capability", dataRead.HeaterExternalState);
    
    // User
    await this.setCapabilityValue("user_fan_speed_capability", dataRead.UserFanSpeed);
    await this.setCapabilityValue("user_temperature_capability", dataRead.UserTemperature);

  }

}

module.exports = AirfilterDevice;
