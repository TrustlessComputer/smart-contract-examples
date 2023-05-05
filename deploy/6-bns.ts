import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';

const func: DeployFunction = async function(hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts } = hre;
    const { deploy, log, execute } = deployments;
    const { deployer } = await getNamedAccounts();

    await deploy('BNS', {
        from: deployer,
        proxy: {
            proxyContract: 'OpenZeppelinTransparentProxy',
            execute: {
                init: {
                    methodName: 'initialize',
                    args: [],
                },
                onUpgrade: {
                    methodName: 'afterUpgrade',
                    args: [],
                },
            },
        },
        log: true,
        // waitConfirmations: 2,
    });
};

func.tags = ['6', 'BNS'];
func.dependencies = [];
export default func;
