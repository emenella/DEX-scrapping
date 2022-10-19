import * as ft from '../utils/ft';
import { Pool, FeeAmount, FACTORY_ADDRESS } from '@uniswap/v3-sdk'
import { Price, Token} from '@uniswap/sdk-core';
import { ChainId } from '@uniswap/sdk';
import { ethers } from 'ethers';
import { abi as IUniswapV3PoolABI } from '@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json'
import { abi as IUniswapV3Factory } from '@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Factory.sol/IUniswapV3Factory.json'

class PoolUniswapV3 extends ft.Pool
{
    private poolUni: Pool;
    private _fees: FeeAmount;
    private _price0: Price<Token, Token>;
    private _price1: Price<Token, Token>;
    private _token0: Token;
    private _token1: Token;
    private _provider: ethers.providers.UrlJsonRpcProvider;

    constructor(tokenA: ft.Token, tokenB: ft.Token, fees: FeeAmount, chainId: ChainId, provider: ethers.providers.UrlJsonRpcProvider)
    {
        super("", chainId, tokenA, tokenB, 0, 0);
        this._provider = provider;
        this._token0 = new Token(this._tokenA.chainId, ethers.utils.getAddress(this._tokenA.address), this._tokenA.decimals);
        this._token1 = new Token(this._tokenB.chainId, ethers.utils.getAddress(this._tokenB.address), this._tokenB.decimals);
        this._fees = fees;
    }

    public async getPool() {
        this._pool = await this.getPoolAddress(this._token0, this._token1)
        if (this._pool == "0x0000000000000000000000000000000000000000")
        {
            throw new Error("Pool not found");
        }
    }

    public async updatePrice()
    {
        let poolContract :ethers.Contract = new ethers.Contract(this._pool, IUniswapV3PoolABI, this._provider);
        const [liquidity, slot] = await Promise.all([poolContract.liquidity(), poolContract.slot0()])
        this.poolUni = new Pool(this._token0, this._token1, this._fees, slot[0], liquidity, slot[1]);
        this._price0 = this.poolUni.token0Price;
        this._price1 = this.poolUni.token1Price;
        this._priceA = parseFloat(this._price0.toSignificant(6));
        this._priceB = parseFloat(this._price0.toSignificant(6));
    }

    public async getPoolAddress(tokenA: Token, tokenB: Token): Promise<string> {
        const [token0, token1] = tokenA.sortsBefore(tokenB) ? [tokenA, tokenB] : [tokenB, tokenA];
        let factory = new ethers.Contract(FACTORY_ADDRESS, IUniswapV3Factory, this._provider);
        return await factory.getPool(token0.address, token1.address, this._fees); 
    }



    public get json(): {}
    {
        return {
            "pool": this._pool,
            "chainId": this._chainId,
            "token0": this._tokenA.json(),
            "token1": this._tokenB.json(),
            "fees": this._fees,
            "price0": this._priceA,
            "price1": this._priceB,
            "dex": "UniswapV3"
        }
    }
}

const UniswapV3 = async (tokenA: ft.Token, tokenB: ft.Token, fees: FeeAmount, chainid: ChainId, provider: ethers.providers.UrlJsonRpcProvider) => {
    let pool = new PoolUniswapV3(tokenA, tokenB, fees, chainid, provider);
    await pool.getPool();
    await pool.updatePrice();
    return pool;
}

export { PoolUniswapV3, UniswapV3 };