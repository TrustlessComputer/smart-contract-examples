import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';

const func: DeployFunction = async function(hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts } = hre;
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();

    const result = await deploy('WETH9', {
        from: deployer,
        args: [],
        log: true
    });
};

func.tags = ['1', 'WETH9'];
func.dependencies = [];
export default func;
