import { SimpleClass } from "homey";
import { NilanDataReadInfo } from "../Domain/NilanDataReadInfo";
import { INilanDevice } from "./INilanDevice";
import { ConnectionSettingsInfo } from "../Domain/ConnectionSettingsInfo";
import ModbusRTU from 'modbus-serial';
import { NilanStatusConverter } from "./NilanStatusConverter";
import { NumberHelper } from "./NumberHelper";

export class NilanCompactPAir9Device implements INilanDevice {

    constructor(public BaseClass: SimpleClass) {

    }

    public GetSupportedDevice(): string {
        return "compact_p_air_9";
    }

    public async GetData(connectionSettings: ConnectionSettingsInfo): Promise<NilanDataReadInfo> {

        try {
            const client = new ModbusRTU();
            await client.connectTCP(connectionSettings.IpAddress, { port: connectionSettings.Port });
            client.setID(connectionSettings.DeviceId);

            var dataRead = NilanDataReadInfo.CreateEmpty(false);

            // FILTER INFORMATION

            await client.readHoldingRegisters(1326, 1)
                .then(data => {
                    //this.BaseClass.log("Resp", "inletFilterTimerThreshold", data);
                    dataRead.InletFilterTimerThreshold = data.data[0];
                }).catch(error => {
                    this.BaseClass.log("ERR:", error);
                    dataRead.ErrorRead = true;
                });

            await client.readHoldingRegisters(1328, 1)
                .then(data => {
                    //this.BaseClass.log("Resp", "inletFilterTimerPassDays", data);
                    dataRead.InletFilterTimerPassDays = data.data[0];
                }).catch(error => {
                    this.BaseClass.log("ERR:", error);
                    dataRead.ErrorRead = true;
                });

            await client.readHoldingRegisters(1327, 1)
                .then(data => {
                    //this.BaseClass.log("Resp", "outletFilterTimerThreshold", data);
                    dataRead.OutletFilterTimerThreshold = data.data[0];
                }).catch(error => {
                    this.BaseClass.log("ERR:", error);
                    dataRead.ErrorRead = true;
                });

            await client.readHoldingRegisters(1329, 1)
                .then(data => {
                    //this.BaseClass.log("Resp", "outletFilterTimerPassDays", data);
                    dataRead.OutletFilterTimerPassDays = data.data[0];
                }).catch(error => {
                    this.BaseClass.log("ERR:", error);
                    dataRead.ErrorRead = true;
                });

            await this.FetchTemperatures(client, dataRead);
            
            // Working mode
            await client.readHoldingRegisters(1047, 1)
                .then(response => {
                var workMode = NumberHelper.ToInt16(response.data[0]);
                dataRead.SystemWorkMode = NilanStatusConverter.ResolveWorkModeText(workMode);
            }).catch(error => {
                this.BaseClass.log("ERR:", error);
                dataRead.ErrorRead = true;
            });

            // Heater external state:
            await client.readHoldingRegisters(5019, 1)
                .then(response => {
                var stateExternalHeater = NumberHelper.ToInt16(response.data[0]);
                dataRead.HeaterExternalState = NilanStatusConverter.ResolveHeaterExternalState(stateExternalHeater);
            }).catch(error => {
                this.BaseClass.log("ERR:", error);
                dataRead.ErrorRead = true;
            });

            // Water temp setpoint:
            await client.readHoldingRegisters(5548, 1)
                .then(response => {
                    dataRead.WaterTempSetpoint = NumberHelper.ParseAsTemperature(response.data[0]);
                }).catch(error => {
                    this.BaseClass.log("ERR:", error);
                    dataRead.ErrorRead = true;
                }
            );
            
            // Regulstaion mode
            await client.readHoldingRegisters(5432, 1)
                .then(response => {
                    dataRead.CurrentRegulationMode = NilanStatusConverter.ResolveRegulationMode(response.data[0]);
                }).catch(error => {
                    this.BaseClass.log("ERR:", error);
                    dataRead.ErrorRead = true;
                }
            );

            // Humidity
            await client.readHoldingRegisters(4716, 1)
            .then(response => {
                dataRead.HumiditySensor = NumberHelper.ToInt16(response.data[0]);
            }).catch(error => {
                this.BaseClass.log("ERR:", error);
                dataRead.ErrorRead = true;
            });

            await client.readHoldingRegisters(4747, 1)
            .then(response => {
                dataRead.UserFanSpeed = NumberHelper.ToInt16(response.data[0])-100;
            }).catch(error => {
                this.BaseClass.log("ERR:", error);
                dataRead.ErrorRead = true;
            });

            await client.readHoldingRegisters(4746, 1)
            .then(response => {
                dataRead.UserTemperature = NumberHelper.ParseAsTemperature(response.data[0]);
            }).catch(error => {
                this.BaseClass.log("ERR:", error);
                dataRead.ErrorRead = true;
            });

            // DEMO
            // await client.readHoldingRegisters(23, 1)
            //     .then(response => {
            //     this.BaseClass.log("response", response);
                    
            // }).catch(error => {
            //     this.BaseClass.log("ERR:", error);
            //     dataRead.ErrorRead = true;
            // });

            client.close(() => { });

        } catch (error) {

            return NilanDataReadInfo.CreateEmpty(true);
        }

        if (dataRead.ErrorRead)
            dataRead.ConnectionError = true; // Raise global flag

        return dataRead;
    }


    private async FetchTemperatures(client: ModbusRTU, dataRead: NilanDataReadInfo) {
        // TEMPERATURES
        
        await client.readHoldingRegisters(5152, 1)
            .then(response => {
                dataRead.T1TempSensor = NumberHelper.ParseAsTemperature(response.data[0]);
            }).catch(error => {
                this.BaseClass.log("ERR:", error);
                dataRead.ErrorRead = true;
            }
        );

        await client.readHoldingRegisters(5153, 1)
            .then(response => {
                dataRead.T2TempSensor = NumberHelper.ParseAsTemperature(response.data[0]);
            }).catch(error => {
                this.BaseClass.log("ERR:", error);
                dataRead.ErrorRead = true;
            }
        );

        await client.readHoldingRegisters(5154, 1)
            .then(response => {
                dataRead.T3TempSensor = NumberHelper.ParseAsTemperature(response.data[0]);
            }).catch(error => {
                this.BaseClass.log("ERR:", error);
                dataRead.ErrorRead = true;
            }
        );

        await client.readHoldingRegisters(5155, 1)
            .then(response => {
                dataRead.T4TempSensor = NumberHelper.ParseAsTemperature(response.data[0]);
            }).catch(error => {
                this.BaseClass.log("ERR:", error);
                dataRead.ErrorRead = true;
            }
        );

        await client.readHoldingRegisters(5156, 1)
            .then(response => {
                dataRead.T5TempSensor = NumberHelper.ParseAsTemperature(response.data[0]);
            }).catch(error => {
                this.BaseClass.log("ERR:", error);
                dataRead.ErrorRead = true;
            }
        );

        await client.readHoldingRegisters(5157, 1)
            .then(response => {
                dataRead.T6TempSensor = NumberHelper.ParseAsTemperature(response.data[0]);
            }).catch(error => {
                this.BaseClass.log("ERR:", error);
                dataRead.ErrorRead = true;
            }
        );

        await client.readHoldingRegisters(5162, 1)
            .then(response => {
                dataRead.TemperatureHotWaterTop = NumberHelper.ParseAsTemperature(response.data[0]);
            }).catch(error => {
                this.BaseClass.log("ERR:", error);
                dataRead.ErrorRead = true;
            }
        );

        await client.readHoldingRegisters(5163, 1)
            .then(response => {
                dataRead.TemperatureHotWaterBottom = NumberHelper.ParseAsTemperature(response.data[0]);
            }).catch(error => {
                this.BaseClass.log("ERR:", error);
                dataRead.ErrorRead = true;
            }
        );
        
        // T16  - T23
        await client.readHoldingRegisters(5167, 1)
            .then(response => {
                dataRead.T16TempSensor = NumberHelper.ParseAsTemperature(response.data[0]);
            }).catch(error => {
                this.BaseClass.log("ERR:", error);
                dataRead.ErrorRead = true;
            }
        );
        
        await client.readHoldingRegisters(5168, 1)
            .then(response => {
                dataRead.T17TempSensor = NumberHelper.ParseAsTemperature(response.data[0]);
            }).catch(error => {
                this.BaseClass.log("ERR:", error);
                dataRead.ErrorRead = true;
            }
        );

        await client.readHoldingRegisters(5169, 1)
            .then(response => {
                dataRead.T18TempSensor = NumberHelper.ParseAsTemperature(response.data[0]);
            }).catch(error => {
                this.BaseClass.log("ERR:", error);
                dataRead.ErrorRead = true;
            }
        );

        await client.readHoldingRegisters(5171, 1)
            .then(response => {
                dataRead.T20TempSensor = NumberHelper.ParseAsTemperature(response.data[0]);
            }).catch(error => {
                this.BaseClass.log("ERR:", error);
                dataRead.ErrorRead = true;
            }
        );

        await client.readHoldingRegisters(5174, 1)
            .then(response => {
                dataRead.T23TempSensor = NumberHelper.ParseAsTemperature(response.data[0]);
            }).catch(error => {
                this.BaseClass.log("ERR:", error);
                dataRead.ErrorRead = true;
            }
        );

        await client.readHoldingRegisters(5088, 1)
            .then(response => {
                dataRead.TempMasterSensor = NumberHelper.ParseAsTemperature(response.data[0]);
            }).catch(error => {
                this.BaseClass.log("ERR:", error);
                dataRead.ErrorRead = true;
            }
        );

        // await client.readHoldingRegisters(5191, 1)
        //     .then(response => {
        //         this.BaseClass.log("DUNNO", NumberHelper.ParseAsTemperature(response.data[0]));
        //     }).catch(error => {
        //         this.BaseClass.log("ERR:", error);
        //         dataRead.ErrorRead = true;
        //     }
        // );

    }
}