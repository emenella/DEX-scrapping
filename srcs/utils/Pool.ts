import { Token } from "./Token";

export class Pool
{
    protected _pool: string;
    protected _chainId: number;
    protected _tokenA: Token;
    protected _tokenB: Token;
    protected _priceA: number;
    protected _priceB: number;

    constructor(pool: string, chainid: number, tokenA: Token, tokenB: Token, priceA: number, priceB: number)
    {
        this._pool = pool;
        this._chainId = chainid;
        this._tokenA = tokenA;
        this._tokenB = tokenB;
        this._priceA = priceA;
        this._priceB = priceB;
    }

    // Getters and setters
    public get pool(): string
    {
        return this._pool;
    }

    public get token0(): Token
    {
        return this._tokenA;
    }

    public get token1(): Token
    {
        return this._tokenB;
    }

    public updatePrice()
    {
        return;
    }

    public get price0(): number
    {
        return this._priceA;
    }

    public get price1(): number
    {
        return this._priceB;
    }

    public get json(): {}
    {
        return {
            "pool": this._pool,
            "chainId": this._chainId,
            "token0": this._tokenA.json(),
            "token1": this._tokenB.json(),
            "price0": this._priceA,
            "price1": this._priceB
        }
    }

};