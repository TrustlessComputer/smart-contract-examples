import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";

task("write-storage", "store file to BFS (chunked if needed)")
  .addParam("filename", "file name")
  .addOptionalParam("contract", "The BFS address", "")
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    const { deployments, ethers } = hre;
    const [ signer ] = await ethers.getSigners();
    const fac = await ethers.getContractFactory('BFS');
    let contractAddress = taskArgs.contract;
    if (contractAddress == "") {
      const d = await deployments.get("BFS");
      contractAddress = d.address;
    }
    const c = fac.attach(contractAddress).connect(signer);
    const fs = require('fs');
    const rawdata = fs.readFileSync(taskArgs.filename);
    // partition rawdata into chunks
    const chunksize = 380_000;
    let chunks = [];
    for (let i = 0; i < rawdata.length; i += chunksize) {
      chunks.push(rawdata.slice(i, i + chunksize));
    }

    for (let i = chunks.length - 1; i >= 0; i--) {
      console.log('inscribe chunk', i, 'with', chunks[i].length, 'bytes');
      const res = await c.store(taskArgs.filename, i, chunks[i]);
      console.log(res.hash);
      await res.wait();
    }
    console.log('Done');
  });

task("read-storage", "load file from BFS")
  .addParam("filename", "file name")
  .addOptionalParam("contract", "The BFS address", "")
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    const { deployments, ethers } = hre;
    const [ signer ] = await ethers.getSigners();
    const fac = await ethers.getContractFactory('BFS');
    let contractAddress = taskArgs.contract;
    if (contractAddress == "") {
      const d = await deployments.get("BFS");
      contractAddress = d.address;
    }
    const c = fac.attach(contractAddress).connect(signer);

    let chunks = [];
    for (let nextChunk = 0; nextChunk < 1000000;) { // loop at least once, max 1000000 chunks
      const res = await c.load(signer.address, taskArgs.filename, nextChunk);
      const temp = ethers.utils.arrayify(res[0]);
      chunks.push(temp);
      nextChunk = res[1].toNumber();
      if (nextChunk == -1) break;
    }
    const result = Buffer.concat(chunks);
    console.log('read data');
    console.log(result.toString());

    // const fs = require('fs');
    // const comparedata = fs.readFileSync(taskArgs.filename);
    // console.log("loaded data matches ?", result.equals(comparedata));

  });
