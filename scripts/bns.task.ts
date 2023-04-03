import { task, types } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { NonceManager } from "@ethersproject/experimental";

const sleep = (ms: number) => {
	return new Promise((resolve) => setTimeout(resolve, ms));
};

task("register", "register a domain")
	.addOptionalParam("contract", "contract address", "", types.string)
	.addParam("domain", "domain name")
	.addOptionalParam("owner", "owner address", "")
	.setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
		const { deployments, ethers } = hre;
		const [signer] = await ethers.getSigners();

		let owner = taskArgs.owner;
		if (owner === "") {
			owner = signer.address;
		}
		let contractAddress = taskArgs.contract;
		if (contractAddress === "") {
			const d = await deployments.get("BNS");
			contractAddress = d.address;
		}
		const fac = await ethers.getContractFactory("BNS");
		const c = fac.attach(contractAddress).connect(signer);
		const tx = await c.register(owner, Buffer.from(taskArgs.domain));
		console.log(tx.hash);
		// await tx.wait();
	})

task("register-bulk", "register many domain names")
	.addOptionalParam("contract", "contract address", "", types.string)
	.addOptionalParam("filename", "file containing domain names", "bns-domains.csv", types.string)
	.addOptionalParam("owner", "owner address", "")
	.setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
		const { deployments, ethers } = hre;
		const [signer] = await ethers.getSigners();
		const nonceManagedSigner = new NonceManager(signer);

		let owner = taskArgs.owner;
		if (owner === "") {
			owner = signer.address;
		}
		let contractAddress = taskArgs.contract;
		if (contractAddress === "") {
			const d = await deployments.get("BNS");
			contractAddress = d.address;
		}
		const fac = await ethers.getContractFactory("BNS");
		const c = fac.attach(contractAddress).connect(nonceManagedSigner);
		const fs = require("fs");

		const brand_names = fs.readFileSync(taskArgs.filename, "utf-8").split("\n").map((s: string) => s.trim())
		// list of numbers from 0 to 999 as strings
		const numeric_names = Array.from(Array(1000).keys()).map((i) => i.toString());
		const names = brand_names.concat(numeric_names);
		console.log("Registering", names.length, "domains");
		// console.log(brand_names, numeric_names);
		await sleep(5000);
		let domainNames = [];
		for (let i = 0; i < names.length; i++) {
			console.log('registering', names[i], '...');
			try {
				domainNames.push(Buffer.from(names[i]));
			} catch (e) {
				console.log('domain name', names[i], 'likely existed. Skipping');
			}
		}

		const tx = await c.registerBatch(owner, domainNames);
		console.log(tx);
		console.log('Done');
	})



task("resolve", "resolve a domain")
.addOptionalParam("contract", "contract address", "", types.string)
	.addParam("domain", "domain name")
	.setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
		if (!taskArgs.domain.endsWith(".tc")) {
			console.log("domain must end with '.tc'");
			return;
		}

		const dom = taskArgs.domain.slice(0, -3);
		const { deployments, ethers } = hre;
		const [signer] = await ethers.getSigners();

		let contractAddress = taskArgs.contract;
		if (contractAddress === "") {
			const d = await deployments.get("BNS");
			contractAddress = d.address;
		}

		const fac = await ethers.getContractFactory("BNS");
		const c = fac.attach(contractAddress).connect(signer);
		const id = await c.registry(Buffer.from(dom));
		const res = await c.resolver(id);
		console.log(res);
	})

task("addresses", "get addresses")
    .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    	const { ethers } = hre;
    	const accs = await ethers.getSigners();
    	console.log(accs.map(a => a.address));
	})


