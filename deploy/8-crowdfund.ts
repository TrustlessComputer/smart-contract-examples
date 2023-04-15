import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';
import {ethers} from "hardhat";

const func: DeployFunction = async function(hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts } = hre;
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();

    const erc20 = await ethers.getContractFactory("MyERC20");
    const contract = await erc20.deploy();

    const result = await deploy('CrowdSale', {
        from: deployer,
        args: [contract.address],
        log: true
    });
};

func.tags = ['8', 'CrowdSale'];
func.dependencies = [];
export default func;
