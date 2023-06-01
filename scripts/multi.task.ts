import { task, types } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { NonceManager } from "@ethersproject/experimental";

task("multisend", "multisend")
	.setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
		const { deployments, ethers } = hre;
		const accs = await ethers.getSigners();

		const fac = await ethers.getContractFactory("Multisend");
		const d = await deployments.get("Multisend");
		const c = fac.attach(d.address).connect(accs[0]); // account 0 must be funded
		const addresses = ['', '']; // your addresses
		const amounts = [ethers.utils.parseEther('0.01'), ethers.utils.parseEther('0.02')];

		if (addresses.length != amounts.length) {
			throw new Error("addresses and amounts must be the same length");
		}
		if (addresses.length > 250) {
			throw new Error("cannot send to more than 250 addresses");
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

task("multisend-token", "multisend ERC20 token")
	.addOptionalParam("contract", "contract address", "0xb80A67b3771e365BaadFB509AB3c1691597B958B", types.string)
	.addOptionalParam("token", "token address", "", types.string)
	.setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
		const { deployments, ethers } = hre;
		const accs = await ethers.getSigners();
		const nonceManagedSigner = new NonceManager(accs[0]);

		const c = await ethers.getContractAt("TokenMultiSender", taskArgs.contract, nonceManagedSigner);
		const addresses = ['', '']; // your addresses
		const amounts = [ethers.utils.parseEther('0.001'), ethers.utils.parseEther('0.002')];
		let sumAmount = ethers.BigNumber.from(0);
		for (let i = 0; i < amounts.length; i++) {
			sumAmount = sumAmount.add(amounts[i]);
		}
		console.log("Addresses to send to:", addresses);
		console.log("Amounts to send:", amounts);
		// approve 
		const token = await ethers.getContractAt("@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20", taskArgs.token, nonceManagedSigner);
		const res1 = await token.approve(taskArgs.contract, sumAmount);
		await res1.wait();
		console.log('approve:', res1.hash);

		let res;
		const BATCH_SIZE = 250;
		// send to 250 addresses at a time (contract dictates)
		for (let i = 0; i < addresses.length; i += BATCH_SIZE) {
			const addresses1 = addresses.slice(i, i + BATCH_SIZE);
			const amounts1 = amounts.slice(i, i + BATCH_SIZE);
			let sum1 = ethers.BigNumber.from(0);
			for (let j = 0; j < amounts1.length; j++) {
				sum1 = sum1.add(amounts1[j]);
			}

			console.log('batch amount total:', sum1.toString());
			res = await c.multiTransferToken_a4A(taskArgs.token, addresses1, amounts1, sum1);
			console.log('multisend:', res.hash);
		}
		await res.wait();
	});
