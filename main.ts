import { PoolUniswapV2, UniswapV2 } from './srcs/dex/PoolUniswapV2';
import { PoolUniswapV3, UniswapV3 } from './srcs/dex/PoolUniswapV3';
import { ethers } from 'ethers';
import * as ft from './srcs/utils/ft';
import { FeeAmount } from '@uniswap/v3-sdk';
const fs = require('fs');


function loadingBar (i: number, j: number, len: number)
{
    let total = 0;
    let point = 0;
    for (let k = 0; k < len; k++)
    {
        for (let l = k + 1; l < len; l++)
        {
            total++;
            if (i == k && j == l)
            {
                point = total;
            }
        }
    }
    let pourcent = point / total * 100;
    let bar = "";
    for (let k = 0; k < 100; k++)
    {
        if (k < pourcent)
            bar += "=";
        else
            bar += " ";
    }
    //bar and pourcent
    process.stdout.write(`\r${bar} ${pourcent}% ${point}/${total}`);
    
}

// provider ethers js alchemy mainnet
const provider = new ethers.providers.AlchemyProvider("homestead", "puUlDh_yUa2QhAZ85j9dZb7BGgLLtVsQ");
//set default provider
ethers.getDefaultProvider();

const getPools: () => Promise<Array<ft.Pool>> = async () => {
    // open file json
    const json = JSON.parse(fs.readFileSync('./token.json', 'utf8'));
    let tokens: ft.Token[] = ft.Token.JsonToToken(json);
    let pools: ft.Pool[] = [];

    console.log("Token loaded: ", tokens.length);

    for (let i = 0; i < tokens.length; i++)
    {
        for (let j = i + 1; j < tokens.length; j++)
        {
            loadingBar(i, j, tokens.length);
            if (tokens[i].chainId == tokens[j].chainId)
            {
                let pool: ft.Pool;
                try {
                    pool = await UniswapV2(tokens[i], tokens[j], tokens[i].chainId, provider);
                    pools.push(pool);
                }
                catch (error) {
                }
                for (let y = 0; y < 4; y++)
                {
                    try {
                        pool = await UniswapV3(tokens[i], tokens[j], y, tokens[i].chainId, provider);
                        pools.push(pool);
                    }
                    catch
                    {}
                }
            }
        }
    }
    process.stdout.write("\n");
    console.log("Pool find: ", pools.length);
    let PoolJSON = new Array();
    pools.forEach(async (element: ft.Pool) => {
        PoolJSON.push(element.json);
    });
    fs.writeFileSync('pools.json', JSON.stringify(PoolJSON), { flag: 'w' });
    return pools;
}

const getPrices = async (pools: ft.Pool[]) => {
    pools.forEach(async (element: ft.Pool) => {
        //cast to PoolUniswapV2
        try {
            let pool = element as PoolUniswapV2;
            await pool.updatePrice();
            console.log(pool.token0.symbol, pool.token1.symbol, pool.price0, pool.price1);
        }
        catch (error) {
            // console.log(error);
        }
    });
}

const init = async () => {

    let pools: ft.Pool[] = [];
    if (!fs.existsSync('./pools.json'))
    {
        pools = await getPools();
    }
    else
    {
        pools = await ft.JsonToPool('./pools.json', provider);
    }
    console.log("Pool loaded: ", pools.length);
    provider.on("block", async (blockNumber: number) => {
        console.clear();
        console.log("block", blockNumber);
        await getPrices(pools);
    });
}

init();