export class NilanStatusConverter {

    public static ResolveWorkModeText = (state: number) : string => {
        switch (state) {
            case 0:
                return "System is off";
            case 1:
                return "System works in Week/Year mode";
            case 2:
                return "System works in Ext.Operation mode";
            case 3:
                return "System works in manual mode";
            case 4:
                return "System works in LON mode";
            case 5:
                return "System works in service mode";
            default:
                return "Unknown status";
        }
    }

    public static ResolveHeaterExternalState = (state: number) : string => {
        switch (state) {
            case 0:
                return "Device Ok.";
            case 1:
                return "Device On.";
            case 2:
                return "Device Off.";
            case 3:
                return "Device Start up.";
            case 4:
                return "Device Refrigerate";
            case 5:
                return "Device Frost";
            case 6:
                return "Device Error";
            case 7:
                return "Device Not ready";
            case 8:
                return "Device Overheat";
            default:
                return "Unknown status";
        }
    }

    public static ResolveRegulationMode = (state: number) : string =>  {
        switch(state) {
            case 0:
                return "Mode isn't defined.";
            case 1:
                return "Cooling mode.";
            case 2:
                return "Heating mode.";
            case 3:
                return "Ventilation mode.";
            case 4:
                return "Hot water mode.";
            default:
                return "Unknown status";
        }
    }

}