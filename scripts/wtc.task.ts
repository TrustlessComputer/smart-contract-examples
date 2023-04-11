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

task("deposit-gwtc", "Deposit native token to get governance token")
  .addParam("amount", "deposit amount")
  .addOptionalParam("contract", "The governance token address", "")
  .setAction(async (taskArgs: any, hre: HardhatRuntimeEnvironment) => {
    const { deployments, ethers } = hre;
    const accs = await ethers.getSigners();
    let contractAddress = taskArgs.contract;
    if (contractAddress == "") {
      const d = await deployments.get("GWTC");
      contractAddress = d.address;
    }
    const res = await accs[0].sendTransaction({ to: contractAddress, value: ethers.utils.parseUnits(taskArgs.amount, 'ether') });
    console.log(res.hash);
  });

task("withdraw-gwtc", "Withdraw governance token to get native token (in 2 steps)")
  .addParam("amount", "withdraw amount")
  // .addOptionalParam("contract", "The wrapped token address", "")
  .setAction(async (taskArgs: any, hre: HardhatRuntimeEnvironment) => {
    const { deployments, ethers } = hre;
    const [ signer ] = await ethers.getSigners();
    let d = await deployments.get("GWTC");
    let fac = await ethers.getContractFactory("GWTC");
    let c = fac.attach(d.address);
    let res = await c.withdrawTo(signer.address, ethers.utils.parseUnits(taskArgs.amount, 'ether'));
    await res.wait();
    console.log('withdraw GWTC to WTC', res.hash);

    d = await deployments.get("WTC");
    fac = await ethers.getContractFactory("WTC");
    c = fac.attach(d.address);
    res = await c.withdraw(ethers.utils.parseUnits(taskArgs.amount, 'ether'));
    console.log('withdraw WTC to TC', res.hash);
    
  });

task("send-tc-dao", "Send native token to DAO")
  .addParam("amount", "deposit amount")
  .addOptionalParam("contract", "The DAO address", "")
  .setAction(async (taskArgs: any, hre: HardhatRuntimeEnvironment) => {
    const { deployments, ethers } = hre;
    const accs = await ethers.getSigners();
    let contractAddress = taskArgs.contract;
    if (contractAddress == "") {
      const d = await deployments.get("TCDAO");
      contractAddress = d.address;
    }
    const fac = await ethers.getContractFactory("TCDAO");
    const c = fac.attach(contractAddress).connect(accs[0]);
    const res = await c.deposit({ value: ethers.utils.parseUnits(taskArgs.amount, 'ether') });
    console.log(res.hash);
    await res.wait();
  });

