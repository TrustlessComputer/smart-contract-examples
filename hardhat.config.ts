import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-deploy";
import "@ericxstone/hardhat-blockscout-verify";
import { SOLIDITY_VERSION, EVM_VERSION } from "@ericxstone/hardhat-blockscout-verify";
import './scripts/erc20.task';
import './scripts/weth9.task';
import './scripts/bfs.task';
import './scripts/nft.task';
import './scripts/ord.task';
import './scripts/bns.task';
import './scripts/multi.task';
import './scripts/artifacts.task';

const config: HardhatUserConfig = {
  defaultNetwork: "mynw",
  solidity: {
    compilers: [
      { version: "0.5.16", settings: {} },
      { version: "0.8.17", settings: {} },
    ]
  },
  networks: {
    mynw: {
      url: "http://localhost:10002",
      accounts: {
        mnemonic: "test test test test test test test test test test test junk",
      },
      // issue: https://github.com/NomicFoundation/hardhat/issues/3136
      // workaround: https://github.com/NomicFoundation/hardhat/issues/2672#issuecomment-1167409582
      timeout: 100_000,
    },
  },
  namedAccounts: {
    deployer: 0
  },
  blockscoutVerify: {
    blockscoutURL: "http://localhost:4000",
    contracts: {
      "WETH9": {
        compilerVersion: SOLIDITY_VERSION.SOLIDITY_V_5_16,
        optimization: false,
        evmVersion: EVM_VERSION.EVM_BERLIN,
        optimizationRuns: 0,
      },
      "ERC20": {
        compilerVersion: SOLIDITY_VERSION.SOLIDITY_V_8_17,
        optimization: false,
        evmVersion: EVM_VERSION.EVM_BERLIN,
        optimizationRuns: 0,
      },
      "Storage": {
        compilerVersion: SOLIDITY_VERSION.SOLIDITY_V_8_17,
        optimization: false,
        evmVersion: EVM_VERSION.EVM_BERLIN,
        optimizationRuns: 0,
      },
      "ERC721NFT": {
        compilerVersion: SOLIDITY_VERSION.SOLIDITY_V_8_17,
        optimization: false,
        evmVersion: EVM_VERSION.EVM_BERLIN,
        optimizationRuns: 0,
      },
    },
  },
};

export default config;
