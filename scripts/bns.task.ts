import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";

task("register", "register a domain")
	.addParam("domain", "domain name")
	.addOptionalParam("contract", "BNS contract address", "")
	.addOptionalParam("owner", "(optional) domain owner address (can be different from sender)", "")
	.addOptionalParam("privatekey", "(optional) private key to use for signing", "")
	.setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
		const { deployments, ethers } = hre;
		let signer;
		if (taskArgs.privatekey.length > 0) {
			signer = new ethers.Wallet(taskArgs.privatekey, ethers.provider);
		} else {
			const accs = await ethers.getSigners();
			signer = accs[0];
		}

		let owner = taskArgs.owner;
		if (owner === "") {
			owner = signer.address;
		}

		let contractAddress = taskArgs.contract;
		if (contractAddress === "") {
			const d = await deployments.get("BNS");
			contractAddress = d.address;
		}

		let domain = taskArgs.domain;
		if (domain.endsWith(".tc")) {
			domain = domain.substring(0, taskArgs.domain.length - 3);
		}
		const fac = await ethers.getContractFactory("BNS");
		const c = fac.attach(contractAddress).connect(signer);
		const tx = await c.register(owner, Buffer.from(domain));
		console.log('tx:', tx.hash);
	})

task("resolve", "resolve a domain")
	.addParam("domain", "domain name")
	.addOptionalParam("contract", "BNS contract address", "")
	.setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
		let domain = taskArgs.domain;
		if (domain.endsWith(".tc")) {
			domain = domain.substring(0, taskArgs.domain.length - 3);
		}
		const { deployments, ethers } = hre;
		const [signer] = await ethers.getSigners();

		const fac = await ethers.getContractFactory("BNS");
		let contractAddress = taskArgs.contract;
		if (contractAddress === "") {
			const d = await deployments.get("BNS");
			contractAddress = d.address;
		}
		const c = fac.attach(contractAddress).connect(signer);
		const isRegistered = await c.registered(Buffer.from(domain));
		if (!isRegistered) {
			console.log("domain not registered");
			return;
		}
		const id = await c.registry(Buffer.from(domain));
		const res = await c.resolver(id);
		console.log('resolve:', res);
	})
