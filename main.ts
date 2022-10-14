import { token, JsonToToken } from './srcs/utils/Token';
import { Pool } from './srcs/utils/Pool';
import { PoolUniswapV2 } from './srcs/dex/PoolUniswapV2';
import { ethers } from 'ethers';
import { stdin } from 'process';
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

const main = async () => {
    // open file json
    const json = JSON.parse(fs.readFileSync('./token.json', 'utf8'));
    let tokens: token[] = JsonToToken(json);

    let pools: Pool[] = [];

    // provider ethers js alchemy mainnet
    const provider = new ethers.providers.AlchemyProvider("homestead", "puUlDh_yUa2QhAZ85j9dZb7BGgLLtVsQ");
    //set default provider
    ethers.getDefaultProvider();


    for (let i = 0; i < tokens.length; i++)
    {
        for (let j = i + 1; j < tokens.length; j++)
        {
            // loadingBar(i, j, tokens.length * tokens.length);
            if (tokens[i].chainId == tokens[j].chainId)
            {
                try {
                    console.log(tokens[i].symbol, tokens[j].symbol);
                    let pool = await new PoolUniswapV2(tokens[i], tokens[j], tokens[i].chainId, provider);
                    await pool.getPair();
                    console.log(pool.token0.symbol, pool.token1.symbol, pool.price0, pool.price1);
                    // fs.appendFileSync('pools.txt', `${tokens[i].symbol} ${tokens[j].symbol} ${pool.price0} ${pool.price1}\n`);
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
    fs.appendFileSync('pools.json', JSON.stringify(PoolJSON, null, 2));
}

main();