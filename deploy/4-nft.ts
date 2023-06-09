import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';

const func: DeployFunction = async function(hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts } = hre;
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();

    const result = await deploy('NFT', {
        from: deployer,
        args: [],
        log: true
    });
};

func.tags = ['4', 'NFT'];
func.dependencies = [];
export default func;
