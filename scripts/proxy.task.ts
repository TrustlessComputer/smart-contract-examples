import { task, types } from "hardhat/config";
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

task("upgrade-by-admin", "Change the admin of a proxy")
  .addOptionalParam("proxy", "The address of the proxy", "", types.string)
  .addOptionalParam("admin", "The address of the admin", "", types.string)
  .addOptionalParam("newimpl", "The address of the new implementation", "")
  .addOptionalParam("from", "The address of the admin", "", types.string)
  .setAction(async (taskArgs: any, hre: HardhatRuntimeEnvironment) => {
    const { ethers } = hre;
    let signer = await ethers.getImpersonatedSigner(taskArgs.from);

    let proxy = taskArgs.proxy;

    let newimpl = taskArgs.newimpl;

    const fac = await ethers.getContractFactory("ProxyAdmin");
    const data = fac.interface.encodeFunctionData("upgrade", [proxy, newimpl]);
    const res = await signer.sendTransaction({
      to: taskArgs.admin,
      data: data,
    });

    console.log("tx:", res);
  });

