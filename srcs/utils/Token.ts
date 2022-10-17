export class Token
{
    private _address: string;
    private _symbol: string;
    private _decimals: number;
    private _chainId: number;

    constructor(address: string, symbol: string, decimals: number, chainId: number)
    {
        this._address = address;
        this._symbol = symbol;
        this._decimals = decimals;
        this._chainId = chainId;
    }

    // Getters and setters
    public get address(): string
    {
        return this._address;
    }

    public get symbol(): string
    {
        return this._symbol;
    }

    public get decimals(): number
    {
        return this._decimals;
    }

    public get chainId(): number
    {
        return this._chainId;
    }

    public json(): any
    {
        return {
            "address": this._address,
            "symbol": this._symbol,
            "decimals": this._decimals,
            "chainId": this._chainId
        }
    }

    public static JsonToToken(json: any): Token[]
    {
        let tokens: Token[] = [];
        let tmp = json["tokens"];
        tmp.forEach((element: any) => {
            if (element["chainId"] == 1)
            {
                let tmp: Token = new Token(element["address"], element["symbol"], element["decimals"], element["chainId"]);
                tokens.push(tmp);
            }
        });
        return tokens;
    }
}