import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";

task("launch", "Launch new crowd fund campaign")
  .addParam("goal", "goal amount of campaign")
  .addParam("start", "start time")
  .addParam("end", "end time")
  .addOptionalParam("contract", "the contract address", "")
  .setAction(async (taskArgs: any, hre: HardhatRuntimeEnvironment) => {
    const { deployments, ethers } = hre;
    const accs = await ethers.getSigners();
    let contractAddress = taskArgs.contract;
    if (contractAddress == "") {
      const d = await deployments.get("CrowdSale");
      contractAddress = d.address;
    }
    const fac = await ethers.getContractFactory("CrowdSale");
    const c = fac.attach(contractAddress).connect(accs[0]);
    const res = await c.launch(taskArgs.goal, taskArgs.start, taskArgs.end);
    console.log(res);
    console.log("Crowd fund id: ", await c.count());
  });

task("pledge", "transferring their token to a campaign")
    .addParam("id", "crowd fun id")
    .addParam("amount", "pledge amount to the campaign")
    .addOptionalParam("contract", "the contract address", "")
    .setAction(async (taskArgs: any, hre: HardhatRuntimeEnvironment) => {
        const { deployments, ethers } = hre;
        const accs = await ethers.getSigners();
        let contractAddress = taskArgs.contract;
        if (contractAddress == "") {
            const d = await deployments.get("CrowdSale");
            contractAddress = d.address;
        }
        const fac = await ethers.getContractFactory("CrowdSale");
        const c = fac.attach(contractAddress).connect(accs[0]);
        // approve
        const fac2 = await ethers.getContractFactory("MyERC20");
        const token = fac2.attach(await c.token()).connect(accs[0]);
        await token.approve(contractAddress, BigInt("10000000000000000000000"));
        const res = await c.pledge(taskArgs.id, taskArgs.amount);
        console.log(res);
    });

task("claim", "Creator claim tokens from campaign")
    .addParam("id", "campaign id")
    .addOptionalParam("contract", "the contract address", "")
    .setAction(async (taskArgs: any, hre: HardhatRuntimeEnvironment) => {
        const { deployments, ethers } = hre;
        const accs = await ethers.getSigners();
        let contractAddress = taskArgs.contract;
        if (contractAddress == "") {
            const d = await deployments.get("CrowdSale");
            contractAddress = d.address;
        }
        const fac = await ethers.getContractFactory("CrowdSale");
        const c = fac.attach(contractAddress).connect(accs[0]);
        const res = await c.claim(taskArgs.id);
        console.log(res);
    });
