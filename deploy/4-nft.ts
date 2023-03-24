import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';

const func: DeployFunction = async function(hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts } = hre;
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const st = await deployments.get("BFS");

    const result = await deploy('NFT', {
        from: deployer,
        args: [st.address],
        skipIfAlreadyDeployed: true,
        log: true
    });
};

func.tags = ['3', 'NFT'];
func.dependencies = [];
export default func;
