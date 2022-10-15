import { Pool } from './Pool';
import { token } from './Token';
import { PoolUniswapV2 } from '../dex/PoolUniswapV2';
import { ethers } from 'ethers';
const fs = require('fs');

const ParsePool = async (path: string, provider: ethers.providers.AlchemyProvider): Promise<Pool[]> => {

    //parse json
    let pools: Pool[] = [];
    const json = JSON.parse(fs.readFileSync(path, 'utf8'));
    for (let i = 0; i < json.length; i++)
    {
        if (json[i].dex == "UniswapV2")
        {
            let pool = new PoolUniswapV2(new token(json[i].token0.address, json[i].token0.symbol, json[i].token0.decimals, json[i].token0.chainId), new token(json[i].token1.address, json[i].token1.symbol, json[i].token1.decimals, json[i].token1.chainId), json[i].chainId, provider);
            pools.push(pool);
        }
        else
        {
            throw new Error("Dex not supported or not found");
        }
    }
    return pools;
}

export { ParsePool };