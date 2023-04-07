import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";

task("artifact-preserve", "call artifact preserve chunk")
  .addOptionalParam("contract", "The Artifacts address", "")
  .addParam("filename", "The filename to preserve")
  .addOptionalParam("privatekey", "(optional) private key to use for signing", "")
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    const { deployments, ethers } = hre;
    let signer;
    if (taskArgs.privatekey.length > 0) {
      signer = new ethers.Wallet(taskArgs.privatekey, ethers.provider);
    } else {
      const accs = await ethers.getSigners();
      signer = accs[0];
    }
    
    const fac = await ethers.getContractFactory('Artifacts');
    let contractAddress = taskArgs.contract;
    if (contractAddress == "") {
      const d = await deployments.get("Artifacts");
      contractAddress = d.address;
    }
    const c = fac.attach(contractAddress).connect(signer);
    const fs = require('fs');
    const rawdata = fs.readFileSync(taskArgs.filename);
    const maxsize = 380_000;
    if (rawdata.length > maxsize) {
      console.log('file too big (over 380KB)');
      return;
    }

    const res = await c.preserveChunks(signer.address, [rawdata]);
    console.log('tx', res.hash);
  });