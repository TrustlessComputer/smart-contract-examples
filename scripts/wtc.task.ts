import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";

task("deposit-wtc", "Deposit native token to get wrapped token")
  .addParam("amount", "deposit amount")
  .addOptionalParam("contract", "The wrapped token address", "")
  .setAction(async (taskArgs: any, hre: HardhatRuntimeEnvironment) => {
    const { deployments, ethers } = hre;
    const accs = await ethers.getSigners();
    let contractAddress = taskArgs.contract;
    if (contractAddress == "") {
      const d = await deployments.get("WTC");
      contractAddress = d.address;
    }
    const fac = await ethers.getContractFactory("WTC");
    const c = fac.attach(contractAddress).connect(accs[0]);
    const res = await c.deposit({ value: ethers.utils.parseUnits(taskArgs.amount, 'ether') });
    console.log(res);
  });

task("withdraw-wtc", "Withdraw wrapped token to get native token")
  .addParam("amount", "withdraw amount")
  .addOptionalParam("contract", "The wrapped token address", "")
  .setAction(async (taskArgs: any, hre: HardhatRuntimeEnvironment) => {
    const { deployments, ethers } = hre;
    let contractAddress = taskArgs.contract;
    if (contractAddress == "") {
      const d = await deployments.get("WTC");
      contractAddress = d.address;
    }
    const fac = await ethers.getContractFactory("WTC");
    const c = fac.attach(contractAddress);
    const res = await c.withdraw(ethers.utils.parseUnits(taskArgs.amount, 'ether'));
    console.log(res);
  });


