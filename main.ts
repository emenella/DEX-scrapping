import { token, JsonToToken } from './srcs/utils/Token';
import { Pool } from './srcs/utils/Pool';
import { PoolUniswapV2, UniswapV2 } from './srcs/dex/PoolUniswapV2';
import { ethers } from 'ethers';
import { ParsePool } from './srcs/utils/Parse';
const fs = require('fs');


function loadingBar (i: number, j: number, len: number)
{
    let total = 0;
    for (let k = 0; k < len; k++)
    {
        for (let l = k + 1; l < len; l++)
        {
            total++;
        }
    }
    let pourcent = (i * len + j) / total * 100;
    let bar = "";
    for (let k = 0; k < 100; k++)
    {
        if (k < pourcent)
            bar += "=";
        else
            bar += " ";
    }
    //bar and pourcent
    process.stdout.write(`\r${bar} ${pourcent}% ${i * len + j}/${total}`);
    
}

// provider ethers js alchemy mainnet
const provider = new ethers.providers.AlchemyProvider("homestead", "puUlDh_yUa2QhAZ85j9dZb7BGgLLtVsQ");
//set default provider
ethers.getDefaultProvider();

const getPools: () => Promise<Array<Pool>> = async () => {
    // open file json
    const json = JSON.parse(fs.readFileSync('./token.json', 'utf8'));
    let tokens: token[] = JsonToToken(json);

    let pools: Pool[] = [];



    for (let i = 0; i < tokens.length; i++)
    {
        for (let j = i + 1; j < tokens.length; j++)
        {
            // loadingBar(i, j, tokens.length * tokens.length);
            if (tokens[i].chainId == tokens[j].chainId)
            {
                try {
                    console.log(tokens[i].symbol, tokens[j].symbol);
                    let pool = await UniswapV2(tokens[i], tokens[j], tokens[i].chainId, provider);
                    pools.push(pool);
                }
                catch (error) {
                    console.log(error);
                }
            }
        }
    }
    let PoolJSON = new Array();
    pools.forEach((element: Pool) => {
        console.log(element.pool, element.token0.address, element.token1.address, element.price0, element.price1);
        //make a json file with json object
        PoolJSON.push(element.json);
    });
    fs.writeFileSync('pool.json', JSON.stringify(PoolJSON), { flag: 'w' });
    return pools;
}

const getPrices = async (pools: Pool[]) => {
    pools.forEach(async (element: Pool) => {
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

    let pools: Pool[] = [];
    if (!fs.existsSync('./pool.json'))
    {
        pools = await getPools();
    }
    else
    {
        pools = await ParsePool('./pool.json', provider);
    }

    provider.on("block", async (blockNumber: number) => {
        console.log("block", blockNumber);
        await getPrices(pools);
    });
}

init();