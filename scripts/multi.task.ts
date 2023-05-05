import { task, types } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";

task("multisend", "multisend")
	.addParam("contract", "contract address", "0x1899b9457823Fd7E24C9Ffc340D140c8b5477b7f", types.string)
	.setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
		const { deployments, ethers } = hre;
		const accs = await ethers.getSigners();

		const fac = await ethers.getContractFactory("Multisend");
		let contractAddress = taskArgs.contract;
		// const d = await deployments.get("Multisend");
		const c = fac.attach(contractAddress).connect(accs[0]); // account 0 must be funded
		const addresses = ['', '']; // your addresses
		const amounts = [ethers.utils.parseEther('0.01'), ethers.utils.parseEther('0.02')]; // your amounts

		if (addresses.length != amounts.length) {
			throw new Error("addresses and amounts must be the same length");
		}
		let sumAmount = ethers.BigNumber.from(0);
		for (let i = 0; i < amounts.length; i++) {
			sumAmount = sumAmount.add(amounts[i]);
		}
		console.log("Addresses to send to:", addresses);
		console.log("Amounts to send:", amounts);
		const res = await c.multisend(addresses, amounts, { value: sumAmount });
		console.log(res.hash);
	})
