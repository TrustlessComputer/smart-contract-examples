import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";

task("createServer", "create server")
  .addParam("contract", "Discord contract address")
  .addParam("sname", "server name")
  .setAction(async (taskArgs: any, hre: HardhatRuntimeEnvironment) => {    
    const { deployments, ethers } = hre;
    const signer = await ethers.getSigner(taskArgs.from);
    let contractAddress = taskArgs.contract;
    const c = await ethers.getContractAt("Discord", contractAddress, signer);
    const res = await c.createServer(
        taskArgs.sname        
    );

    console.log(res);
  });

task("joinServer", "join server")
  .addParam("contract", "Discord contract address")
  .addParam("sname", "server name")  
  .setAction(async (taskArgs: any, hre: HardhatRuntimeEnvironment) => {    
    const { deployments, ethers } = hre;
    const signer = await ethers.getSigner(taskArgs.from);
    let contractAddress = taskArgs.contract;
    const c = await ethers.getContractAt("Discord", contractAddress, signer);
    const res = await c.joinServer(
        taskArgs.sname
    );

    console.log(res);
  });

task("createChannel", "create channel")
  .addParam("contract", "Discord contract address")
  .addParam("sname", "server name")
  .addParam("cname", "channel name")
  .setAction(async (taskArgs: any, hre: HardhatRuntimeEnvironment) => {    
    const { deployments, ethers } = hre;
    const signer = await ethers.getSigner(taskArgs.from);
    let contractAddress = taskArgs.contract;
    const c = await ethers.getContractAt("Discord", contractAddress, signer);
    const res = await c.createChannel(
        taskArgs.sname,
        taskArgs.cname        
    );

    console.log(res);
  });

task("postMessage", "post message")
  .addParam("contract", "Discord contract address")
  .addParam("sname", "server name")  
  .addParam("cname", "channel name")  
  .addParam("message", "message content")  
  .setAction(async (taskArgs: any, hre: HardhatRuntimeEnvironment) => {    
    const { deployments, ethers } = hre;
    const signer = await ethers.getSigner(taskArgs.from);
    let contractAddress = taskArgs.contract;
    const c = await ethers.getContractAt("Discord", contractAddress, signer);
    const res = await c.postMessage(
        taskArgs.sname,
        taskArgs.cname,
        taskArgs.message
    );

    console.log(res);
  });

task("getMessages", "get messages")
  .addParam("contract", "Discord contract address")
  .addParam("sname", "server name")  
  .addParam("cname", "channel name")    
  .setAction(async (taskArgs: any, hre: HardhatRuntimeEnvironment) => {    
    const { deployments, ethers } = hre;
    const signer = await ethers.getSigner(taskArgs.from);
    let contractAddress = taskArgs.contract;
    const c = await ethers.getContractAt("Discord", contractAddress, signer);
    const res = await c.getMessages(
        taskArgs.sname,
        taskArgs.cname
    );

    console.log(res);
  });


