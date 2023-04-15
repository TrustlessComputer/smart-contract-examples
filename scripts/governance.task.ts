import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import {toUtf8Bytes} from "@ethersproject/strings";

task("createProposal", "Create new proposal")
  .addParam("target", "recipient address")
    .addParam("value", "transfer amount")
    .addParam("description", "send tc to recipient")
  .addOptionalParam("contract", "The contract address", "")
  .setAction(async (taskArgs: any, hre: HardhatRuntimeEnvironment) => {
    const { deployments, ethers } = hre;
    const accs = await ethers.getSigners();
    let contractAddress = taskArgs.contract;
    if (contractAddress == "") {
      const d = await deployments.get("DAO");
      contractAddress = d.address;
    }
    const fac = await ethers.getContractFactory("DAO");
    const c = fac.attach(contractAddress).connect(accs[0]);
    const res = await c["propose(address[],uint256[],bytes[],string)"]([taskArgs.target], [ethers.utils.parseEther(taskArgs.value)], ["0x00"], taskArgs.description);
    console.log(res);
    console.log("proposal id: ", await c.hashProposal([taskArgs.target], [ethers.utils.parseEther(taskArgs.value)], ["0x00"], ethers.utils.keccak256(ethers.utils.toUtf8Bytes(taskArgs.description))));
  });

task("castVote", "cast vote")
  .addParam("id", "proposal id")
  .addParam("vote", "0 - against 1 - for 2 - abstained")
  .addOptionalParam("contract", "The contract address", "")
  .setAction(async (taskArgs: any, hre: HardhatRuntimeEnvironment) => {
    const { deployments, ethers } = hre;
    let contractAddress = taskArgs.contract;
    if (contractAddress == "") {
      const d = await deployments.get("DAO");
      contractAddress = d.address;
    }
    const fac = await ethers.getContractFactory("DAO");
    const c = fac.attach(contractAddress);
    const res = await c.castVote(taskArgs.id, taskArgs.vote);
    console.log(res);
  });

task("getState", "get state of proposal")
    .addParam("id", "proposal id")
    .addOptionalParam("contract", "The contract address", "")
    .setAction(async (taskArgs: any, hre: HardhatRuntimeEnvironment) => {
        const { deployments, ethers } = hre;
        let contractAddress = taskArgs.contract;
        if (contractAddress == "") {
            const d = await deployments.get("DAO");
            contractAddress = d.address;
        }
        const fac = await ethers.getContractFactory("DAO");
        const c = fac.attach(contractAddress);
        const res = await c.state(taskArgs.id);
        console.log(res);
    });
