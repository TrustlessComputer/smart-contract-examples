import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';

const func: DeployFunction = async function(hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts } = hre;
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();

    await deploy('Ordinals', {
        from: deployer,
        args: [],
        log: true,
        waitConfirmations: 1,
    });
};

func.tags = ['5', 'Ordinals'];
func.dependencies = [];
export default func;
