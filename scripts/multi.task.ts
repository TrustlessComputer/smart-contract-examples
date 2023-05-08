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

task("multisend-token", "multisend ERC20 token")
	.addOptionalParam("contract", "contract address", "0xb80A67b3771e365BaadFB509AB3c1691597B958B", types.string)
	.addOptionalParam("token", "token address", "0xBcd1CE73A7990a571549585F3542aCa0774A0Bb2", types.string)
	.setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
		const { deployments, ethers } = hre;
		const accs = await ethers.getSigners();

		const c = await ethers.getContractAt("TokenMultiSender", taskArgs.contract, accs[0]);
		const addresses = ['', '']; // your addresses
		const amounts = [ethers.utils.parseEther('0.01'), ethers.utils.parseEther('0.02')];
		let sumAmount = ethers.BigNumber.from(0);
		for (let i = 0; i < amounts.length; i++) {
			sumAmount = sumAmount.add(amounts[i]);
		}
		console.log("Addresses to send to:", addresses);
		console.log("Amounts to send:", amounts);
		// approve 
		const token = await ethers.getContractAt("@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20", taskArgs.token, accs[0]);
		const res1 = await token.approve(taskArgs.contract, sumAmount);
		await res1.wait();
		console.log('approve:', res1.hash);
		const res = await c.multiTransferToken_a4A(taskArgs.token, addresses, amounts, sumAmount);
		console.log('multisend:', res.hash);
	});
