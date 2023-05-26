import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";

task("sendMessage", "send message")
  .addParam("contract", "Messenger contract address")
  .addParam("message", "message content")
  .setAction(async (taskArgs: any, hre: HardhatRuntimeEnvironment) => {    
    const { deployments, ethers } = hre;
    const signer = await ethers.getSigner(taskArgs.from);
    let contractAddress = taskArgs.contract;
    const c = await ethers.getContractAt("Messenger", contractAddress, signer);
    const res = await c.sendMessage(
        taskArgs.message
        //{ gasPrice: taskArgs.gasprice, gasLimit: 400000 }
    );

    console.log(res);
  });

task("getMessageList", "get messages")
  .addParam("contract", "Messenger contract address")  
  .setAction(async (taskArgs: any, hre: HardhatRuntimeEnvironment) => {    
    const { deployments, ethers } = hre;
    const signer = await ethers.getSigner(taskArgs.from);
    let contractAddress = taskArgs.contract;
    const c = await ethers.getContractAt("Messenger", contractAddress, signer);
    const res = await c.getMessageList();

    console.log(res);
  });
