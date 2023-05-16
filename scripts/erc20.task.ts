import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";

task("balance", "Prints an account's balance")
  .addOptionalParam("account", "The account's address", "")
  .setAction(async (taskArgs: any, hre: HardhatRuntimeEnvironment) => {
    const { ethers } = hre;
    const accs = await ethers.getSigners();
    const account = taskArgs.account || accs[0].address;
    const balance = await ethers.provider.getBalance(account);

    console.log(ethers.utils.formatEther(balance), "ETH");
  });

task("balanceERC20", "Prints all account balances of ERC20 token")
  .addOptionalParam("contract", "The token address", "")
  .setAction(async (taskArgs: any, hre: HardhatRuntimeEnvironment) => {
    const { deployments, ethers } = hre;
    const accs = await ethers.getSigners();
    let contractAddress = taskArgs.contract;
    if (contractAddress == "") {
      const d = await deployments.get("MyERC20");
      contractAddress = d.address;
    }
    const fac = await ethers.getContractFactory("MyERC20");
    const c = fac.attach(contractAddress);
    for (const acc of accs) {
      const balance = await c.balanceOf(acc.address);
      console.log(acc.address, ":", ethers.utils.formatEther(balance), "TTK");
    }
  });

task("transferERC20", "Transfer ERC20 token")
  .addParam("from", "sender address")
  .addParam("to", "receiver address")
  .addParam("amount", "transfer amount (in TTK)")
  .addOptionalParam("contract", "The token address", "")
  .setAction(async (taskArgs: any, hre: HardhatRuntimeEnvironment) => {
    const { deployments, ethers } = hre;
    const signer = await ethers.getSigner(taskArgs.from);
    let contractAddress = taskArgs.contract;
    if (contractAddress == "") {
      const d = await deployments.get("MyERC20");
      contractAddress = d.address;
    }
    const fac = await ethers.getContractFactory("MyERC20");
    const c = fac.attach(contractAddress).connect(signer);
    const res = await c.transfer(taskArgs.to, ethers.utils.parseEther(taskArgs.amount));
    console.log(res);
  });

task("renounceOwnerShip", "Remove ownership from sc")
  .addOptionalParam("contract", "The token address", "")
  .setAction(async (taskArgs: any, hre: HardhatRuntimeEnvironment) => {
    const { deployments, ethers } = hre;
    const accs = await ethers.getSigners();
    let contractAddress = taskArgs.contract;
    if (contractAddress == "") {
      const d = await deployments.get("MyERC20");
      contractAddress = d.address;
    }
    const fac = await ethers.getContractFactory("MyERC20");
    const c = fac.attach(contractAddress).connect(accs[0]);
    const res = await c.renounceOwnership();
    console.log(res);
  });
