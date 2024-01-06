import { ConnectionSettingsInfo } from "../Domain/ConnectionSettingsInfo";
import { NilanDataReadInfo } from "../Domain/NilanDataReadInfo";

export interface INilanDevice {

    GetSupportedDevice():string;

    GetData(connectionSettings: ConnectionSettingsInfo) : Promise<NilanDataReadInfo>
}