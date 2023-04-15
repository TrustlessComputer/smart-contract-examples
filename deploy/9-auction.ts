import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';
import {ethers} from "hardhat";

const func: DeployFunction = async function(hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts } = hre;
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();

    const nft = await ethers.getContractFactory("NFT");
    const contract = await nft.deploy();

    const result = await deploy('DutchAuction', {
        from: deployer,
        args: ["1000000000000000000", 100000, contract.address, 0],
        log: true
    });
    // mint nft
    await contract.safeMint(result.address, 0);
};

func.tags = ['9', 'DutchAuction'];
func.dependencies = [];
export default func;
