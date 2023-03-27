import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";

task("register", "register a domain")
	.addParam("domain", "domain name")
	.addOptionalParam("owner", "owner address", "")
	.setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
		const { deployments, ethers } = hre;
		const [signer] = await ethers.getSigners();

		let owner = taskArgs.owner;
		if (owner === "") {
			owner = signer.address;
		}
		const fac = await ethers.getContractFactory("BNS");
		const d = await deployments.get("BNS");
		const c = fac.attach(d.address).connect(signer);
		const tx = await c.register(owner, Buffer.from(taskArgs.domain));
		console.log(tx.hash);
		// await tx.wait();
	})

task("resolve", "resolve a domain")
	.addParam("domain", "domain name")
	.setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
		if (!taskArgs.domain.endsWith(".tc")) {
			console.log("domain must end with '.tc'");
			return;
		}
		const dom = taskArgs.domain.slice(0, -3);
		const { deployments, ethers } = hre;
		const [signer] = await ethers.getSigners();

		const fac = await ethers.getContractFactory("BNS");
		const d = await deployments.get("BNS");
		const c = fac.attach(d.address).connect(signer);
		const id = await c.registry(Buffer.from(dom));
		const res = await c.resolver(id);
		console.log(res);
	})
