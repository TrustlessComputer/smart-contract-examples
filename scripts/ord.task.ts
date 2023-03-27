import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";

task("ord-inscribe", "create a ordinal-like NFT")
  .addParam("data", "inscribe data (hexstring)")
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    const { deployments, ethers } = hre;
    const [signer] = await ethers.getSigners();

    const fac = await ethers.getContractFactory("Ordinals");
    const d = await deployments.get("Ordinals");
    const c = fac.attach(d.address).connect(signer);
    const res = await c.inscribe(signer.address, taskArgs.data);
    console.log(res.hash);
  });

task("ord-read", "read a ordinal-like NFT")
  .addParam("id", "ordinal id")
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    const { deployments, ethers } = hre;
    const [signer] = await ethers.getSigners();

    const fac = await ethers.getContractFactory("Ordinals");
    const d = await deployments.get("Ordinals");
    const c = fac.attach(d.address).connect(signer);
    const res = await c.inscriptions(ethers.BigNumber.from(taskArgs.id));
    console.log(res);
  });