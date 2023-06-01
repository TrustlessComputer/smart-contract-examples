import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";

task("change-admin", "Change the admin of a proxy")
  .addOptionalParam("proxy", "The address of the proxy", "")
  .addOptionalParam("oldadmin", "The address of the old admin", "")
  .addOptionalParam("newadmin", "The address of the new admin", "")
  .setAction(async (taskArgs: any, hre: HardhatRuntimeEnvironment) => {
    const { deployments, ethers } = hre;
    const accs = await ethers.getSigners();
    
    let proxy = taskArgs.proxy;
    if (proxy == "") {
      proxy = (await deployments.get("DefaultProxyAdmin")).address;
    }
    let signer;
    if (taskArgs.oldadmin == "") {
      signer = accs[0];
    } else {
      signer = await ethers.getSigner(taskArgs.oldadmin);
    }

    let newadmin = taskArgs.newadmin;
    if (newadmin == "") {
      newadmin = accs[1].address;
    }
    const fac = await ethers.getContractFactory("ProxyAdmin");
    const c = fac.attach(proxy).connect(signer);
    const res = await c.transferOwnership(newadmin);
    console.log("tx:", res.hash);

  });
