import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';

const func: DeployFunction = async function(hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts } = hre;
    const { deploy, deterministic } = deployments;
    const { deployer } = await getNamedAccounts();
    const gw = await deployments.get('GWTC');

    await deploy('TCDAO', {
        from: deployer,
        proxy: {
            proxyContract: 'OpenZeppelinTransparentProxy',
            execute: {
                init: {
                    methodName: 'initialize',
                    args: [gw.address],
                },
                // onUpgrade: {
                //     methodName: 'afterUpgrade',
                //     args: [],
                // },
            },
        },
        log: true,
    });
};

func.tags = ['8', 'TCDAO'];
func.dependencies = ['GWTC'];
export default func;
