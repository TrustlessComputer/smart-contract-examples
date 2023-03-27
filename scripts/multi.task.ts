import { task, types } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";

task("multisend", "multisend")
	.addOptionalParam("count", "number of receivers", 5, types.int)
	.addParam("amount", "amount")
	.setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
		const { deployments, ethers } = hre;
		const accs = await ethers.getSigners();

		const fac = await ethers.getContractFactory("Multisend");
		const d = await deployments.get("Multisend");
		const c = fac.attach(d.address).connect(accs[0]); // account 0 must be funded
		const addresses = accs.slice(1, 1 + taskArgs.count).map(a => a.address)
		const amounts = [];
		let sumAmount = ethers.BigNumber.from(0);
		for (let i = 0; i < taskArgs.count; i++) {
			amounts.push(ethers.utils.parseEther(taskArgs.amount));
			sumAmount = sumAmount.add(ethers.utils.parseEther(taskArgs.amount));
		}
		console.log("Addresses to send to:", addresses);
		console.log("Amounts to send:", amounts);
		const res = await c.multisend(addresses, amounts, { value: sumAmount });
		console.log(res.hash);
	})