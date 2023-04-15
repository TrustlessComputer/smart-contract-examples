import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";

task("getPrice", "get current price of the NFT")
    .addOptionalParam("contract", "The dutch auction contract address", "")
    .setAction(async (taskArgs: any, hre: HardhatRuntimeEnvironment) => {
        const { deployments, ethers } = hre;
        const accs = await ethers.getSigners();
        let contractAddress = taskArgs.contract;
        if (contractAddress == "") {
            const d = await deployments.get("DutchAuction");
            contractAddress = d.address;
        }
        const fac = await ethers.getContractFactory("DutchAuction");
        const c = fac.attach(contractAddress).connect(accs[0]);
        const res = await c.getPrice();
        console.log("current price", ": ", ethers.utils.formatEther(res), " ETH");
    });

task("buy", "depositing ETH to buy nft token")
  .addParam("amount", "deposit amount")
  .addOptionalParam("contract", "The dutch auction contract address", "")
  .setAction(async (taskArgs: any, hre: HardhatRuntimeEnvironment) => {
    const { deployments, ethers } = hre;
    const accs = await ethers.getSigners();
    let contractAddress = taskArgs.contract;
    if (contractAddress == "") {
      const d = await deployments.get("DutchAuction");
      contractAddress = d.address;
    }
    const fac = await ethers.getContractFactory("DutchAuction");
    const c = fac.attach(contractAddress).connect(accs[1]);
    const res = await c.buy({ value: ethers.utils.parseUnits(taskArgs.amount, 'ether') });
    console.log(res);
  });
