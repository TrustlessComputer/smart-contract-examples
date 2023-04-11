import { task, types } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));


task("make-proposal", "make a grant proposal")
  .addOptionalParam("contract", "contract address", "", types.string)
  .addOptionalParam("token", "ERC20 grant token address", "", types.string)
  .addOptionalParam("amount", "grant amount (unit 1e18)", "0.001", types.string)
  .addOptionalParam("receiver", "grant receiver", "", types.string)
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    const { deployments, ethers } = hre;
    const accs = await ethers.getSigners();
    let fac = await ethers.getContractFactory('TCDAO');
    let contractAddress = taskArgs.contract;
    if (contractAddress == "") {
      const d = await deployments.get("TCDAO");
      contractAddress = d.address;
    }
    const c = fac.attach(contractAddress).connect(accs[0]);
    fac = await ethers.getContractFactory('MyERC20');
    let tokenAddress = taskArgs.token;
    if (tokenAddress == "") {
      tokenAddress = (await deployments.get("MyERC20")).address;
    }
    const token = fac.attach(tokenAddress);
    const grantAmount = ethers.utils.parseUnits(taskArgs.amount, 'ether');
    let grantReceiver = taskArgs.receiver;
    if (grantReceiver == "") {
      grantReceiver = accs[2].address;
    }

    const transferCalldata = token.interface.encodeFunctionData('transfer', [grantReceiver, grantAmount]);
    const res = await c.functions['propose(address[],uint256[],bytes[],string)'](
      [token.address],
      [0],
      [transferCalldata],
      "Proposal #1: send grant to dev A",
    );
    console.log(res.hash);
  });

task("make-proposal-2", "make a grant proposal (for native token)")
  .addOptionalParam("contract", "contract address", "", types.string)
  .addOptionalParam("amount", "grant amount (unit 1e18)", "0.001", types.string)
  .addOptionalParam("receiver", "grant receiver", "", types.string)
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    const { deployments, ethers } = hre;
    const accs = await ethers.getSigners();
    let fac = await ethers.getContractFactory('TCDAO');
    let contractAddress = taskArgs.contract;
    if (contractAddress == "") {
      const d = await deployments.get("TCDAO");
      contractAddress = d.address;
    }
    const c = fac.attach(contractAddress).connect(accs[0]);

    const grantAmount = ethers.utils.parseUnits(taskArgs.amount, 'ether');
    let grantReceiver = taskArgs.receiver;
    if (grantReceiver == "") {
      grantReceiver = accs[2].address;
    }
    const transferCalldata = "0x";
    const res = await c.functions['propose(address[],uint256[],bytes[],string)'](
      [grantReceiver],
      [grantAmount],
      [transferCalldata],
      "Proposal #2: send grant (in native token) to dev B",
    );
    console.log(res.hash);
  });

task("execute-proposal", "execute a proposal")
  .addOptionalParam("contract", "contract address", "", types.string)
  .addOptionalParam("id", "proposal id", "0", types.string)
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    const { deployments, ethers } = hre;
    const accs = await ethers.getSigners();
    let fac = await ethers.getContractFactory('TCDAO');
    let contractAddress = taskArgs.contract;
    if (contractAddress == "") {
      const d = await deployments.get("TCDAO");
      contractAddress = d.address;
    }

    const proposalId = ethers.BigNumber.from(taskArgs.id);
    const c = fac.attach(contractAddress).connect(accs[0]);
    const res = await c.functions['execute(uint256)'](proposalId);
    console.log(res.hash);
  });


task("get-votes", "get votes")
  .addOptionalParam("contract", "contract address", "", types.string)
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    const { deployments, ethers } = hre;
    const accs = await ethers.getSigners();
    let fac = await ethers.getContractFactory('TCDAO');
    let contractAddress = taskArgs.contract;
    if (contractAddress == "") {
      const d = await deployments.get("TCDAO");
      contractAddress = d.address;
    }

    const c = fac.attach(contractAddress).connect(accs[0]);
    const qnum = await c.functions['quorumNumerator()']();
    console.log('quorumNumerator', qnum.toString());
    const qden = await c.functions['quorumDenominator()']();
    console.log('quorumDenominator', qden.toString());
    const res = await c.getVotes(accs[0].address, await ethers.provider.getBlockNumber() - 1);
    console.log(res);
  });
