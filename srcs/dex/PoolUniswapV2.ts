import { Pool } from '../utils/Pool';
import { token } from '../utils/Token';
import { ethers, utils } from 'ethers';
import { FACTORY_ADDRESS, INIT_CODE_HASH } from '@uniswap/sdk'
import { ChainId, Pair, Token ,Fetcher, Price } from '@uniswap/sdk'

class PoolUniswapV2 extends Pool
{
    public _pair: Pair;
    public _price0: Price;
    private _price1: Price;
    private _token0: Token;
    private _token1: Token;
    private _provider: ethers.providers.AlchemyProvider;

    constructor(tokenA: token, tokenB: token, chainId: ChainId, provider: ethers.providers.AlchemyProvider)
    {
        super("", chainId , tokenA, tokenB, 0, 0);
        this._provider = provider;
        this._token0 = new Token(this._tokenA.chainId, utils.getAddress(this._tokenA.address), this._tokenA.decimals);
        this._token1 = new Token(this._tokenB.chainId, utils.getAddress(this._tokenB.address), this._tokenB.decimals);

    }

    public async getPair() {
        // call getPair from ethers js
        this._pool = await this.getPairAddress(this._token0, this._token1);
        // console.log(this._pool);
        //if pool dont exist throw error
        if (this._pool == "0x0000000000000000000000000000000000000000")
        {
            throw new Error("Pool not found");
        }
    }

    public async updatePrice()
    {
        this._pair = await Fetcher.fetchPairData(this._token0, this._token1, this._provider);
        this._price0 = this._pair.token0Price;
        this._price1 = this._pair.token1Price;
        this._priceA = parseFloat(this._price0.toSignificant(6));
        this._priceB = parseFloat(this._price1.toSignificant(6));
    }

    private async getPairAddress(tokenA: Token, tokenB: Token): Promise<string> {
        const [token0, token1] = tokenA.sortsBefore(tokenB) ? [tokenA, tokenB] : [tokenB, tokenA]
        let factory = await new ethers.Contract(FACTORY_ADDRESS, ['function getPair(address tokenA, address tokenB) view returns (address pair)'], this._provider);
        return await factory.getPair(token0.address, token1.address);
    }

    public get json(): {}
    {
        console.log("json of pooluniswapv2");
        return {
            "pool": this._pool,
            "chainId": this._chainId,
            "token0": this._tokenA.json(),
            "token1": this._tokenB.json(),
            "price0": this._priceA,
            "price1": this._priceB,
            "dex": "UniswapV2"
        }
    }
}

const UniswapV2 = async (tokenA: token, tokenB: token, chainId: ChainId, provider: ethers.providers.AlchemyProvider) => {
    let pool = new PoolUniswapV2(tokenA, tokenB, chainId, provider);
    await pool.getPair();
    // await pool.updatePrice();
    return pool;
}

export { PoolUniswapV2, UniswapV2 };