import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';
import { network } from 'hardhat';

const func: DeployFunction = async function(hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts } = hre;
    const { deploy, deterministic } = deployments;
    const { deployer } = await getNamedAccounts();

    if (network.name === 'hardhat' || network.name === 'localhost') {
        await network.provider.send("evm_setIntervalMining", [3000]); // FOR DEBUG
    }
    
    await deploy('WTC', {
        from: deployer,
        args: [],
        log: true,
    });
};

func.tags = ['1', 'WTC'];
func.dependencies = [];
export default func;
