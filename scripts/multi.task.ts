import { task, types } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";

task("multisend", "multisend")
	.setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
		const { deployments, ethers } = hre;
		const accs = await ethers.getSigners();

		const fac = await ethers.getContractFactory("Multisend");
		const d = await deployments.get("Multisend");
		const c = fac.attach(d.address).connect(accs[0]); // account 0 must be funded
		const addresses = ['', '']; // your addresses
		const amounts = [ethers.utils.parseEther('0.01'), ethers.utils.parseEther('0.02')];
		let sumAmount = ethers.BigNumber.from(0);
		for (let i = 0; i < amounts.length; i++) {
			sumAmount = sumAmount.add(amounts[i]);
		}
		console.log("Addresses to send to:", addresses);
		console.log("Amounts to send:", amounts);
		const res = await c.multisend(addresses, amounts, { value: sumAmount });
		console.log(res.hash);
	})
