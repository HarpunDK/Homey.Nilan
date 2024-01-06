export class NilanDataReadInfo {
    constructor(public InletFilterTimerThreshold:  number, public InletFilterTimerPassDays:  number,
                public OutletFilterTimerThreshold: number, public OutletFilterTimerPassDays: number,
                public SystemWorkMode: string,
                public HeaterExternalState: string,
                public CurrentRegulationMode: string,
                public T1TempSensor: number, public T2TempSensor: number, public T3TempSensor: number, public T4TempSensor: number,
                public T5TempSensor: number, public T6TempSensor: number,
                public TemperatureHotWaterTop: number, public TemperatureHotWaterBottom: number,
                public WaterTempSetpoint: number,
                public TempMasterSensor: number,
                public HumiditySensor: number,
                public T16TempSensor: number,
                public T17TempSensor: number,
                public T18TempSensor: number,
                public T20TempSensor: number,
                public T23TempSensor: number,
                public ErrorRead: boolean, public ConnectionError: boolean

        )
    {}

    public static CreateEmpty = (connectionError: boolean) : NilanDataReadInfo => {
        return new NilanDataReadInfo(0, 0, 0, 0, "", "", "", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, false, connectionError);
    }
}