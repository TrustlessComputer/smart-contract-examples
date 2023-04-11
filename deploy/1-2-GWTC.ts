import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';

const func: DeployFunction = async function(hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts } = hre;
    const { deploy, deterministic } = deployments;
    const { deployer } = await getNamedAccounts();
    const w = await deployments.get('WTC');

    await deploy('GWTC', {
        from: deployer,
        args: [w.address],
        log: true,
    });
};

func.tags = ['1', 'GWTC'];
func.dependencies = ['WTC'];
export default func;
