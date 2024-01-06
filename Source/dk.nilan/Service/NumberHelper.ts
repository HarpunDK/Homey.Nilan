export class NumberHelper {

    static ToInt16(input: number) {
        return (input << 16) >> 16;
    }

    static ParseAsTemperature(input: number) {
        return Math.floor(this.ToInt16(input) / 10);
    }

    static ParseFloatAndDivide(input : number){
        return parseFloat(input+"") / 10;
    }

}