import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-deploy";
import "@ericxstone/hardhat-blockscout-verify";
import { SOLIDITY_VERSION, EVM_VERSION } from "@ericxstone/hardhat-blockscout-verify";

import './scripts/erc20.task';
import './scripts/wtc.task';
import './scripts/bfs.task';
import './scripts/nft.task';
import './scripts/ord.task';
import './scripts/bns.task';
import './scripts/multi.task';
import './scripts/dao.task';
import './scripts/proxy.task';

// dotenv
import dotenv from 'dotenv';
dotenv.config();

let localTestMnemonic = "test test test test test test test test test test test junk";
const config: HardhatUserConfig = {
  defaultNetwork: "tcbtc",
  solidity: {
    compilers: [
      { version: "0.5.16", settings: {} },
      { 
        version: "0.8.17",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        }
      },
    ]
  },
  networks: {
    hardhat: {
      accounts: {
        mnemonic: localTestMnemonic,
        count: 10,
      },
      blockGasLimit: 50_000_000,
      gas: 40_000_000,
    },
    tcbtc: {
      url: "http://localhost:10002",
      accounts: {
        mnemonic: localTestMnemonic,
        // count: 1001,
      },
      // issue: https://github.com/NomicFoundation/hardhat/issues/3136
      // workaround: https://github.com/NomicFoundation/hardhat/issues/2672#issuecomment-1167409582
      timeout: 100_000,
    },
    tctest: {
      url: "https://tc-regtest.trustless.computer/",
      accounts: {
        mnemonic: localTestMnemonic,
        count: 4,
      },
      // issue: https://github.com/NomicFoundation/hardhat/issues/3136
      // workaround: https://github.com/NomicFoundation/hardhat/issues/2672#issuecomment-1167409582
      timeout: 100_000,
    },
    localhost: {
      url: "http://localhost:8546",
      accounts: {
        mnemonic: localTestMnemonic,
        count: 10,
      },
      timeout: 100_000,
      blockGasLimit: 50_000_000,
      gas: 40_000_000,
    },
    mynw: {
      url: "http://localhost:10002",
      accounts: {
        mnemonic: localTestMnemonic,
      },
      // issue: https://github.com/NomicFoundation/hardhat/issues/3136
      // workaround: https://github.com/NomicFoundation/hardhat/issues/2672#issuecomment-1167409582
      timeout: 100_000,
    }
  },
  namedAccounts: {
    deployer: 0
  },
  blockscoutVerify: {
    blockscoutURL: "http://localhost:4000",
    contracts: {
      "WTC": {
        compilerVersion: SOLIDITY_VERSION.SOLIDITY_V_5_16,
        optimization: false,
        evmVersion: EVM_VERSION.EVM_BERLIN,
        optimizationRuns: 200,
      },
      "ERC20": {
        compilerVersion: SOLIDITY_VERSION.SOLIDITY_V_8_17,
        optimization: false,
        evmVersion: EVM_VERSION.EVM_BERLIN,
        optimizationRuns: 200,
      },
      "Storage": {
        compilerVersion: SOLIDITY_VERSION.SOLIDITY_V_8_17,
        optimization: false,
        evmVersion: EVM_VERSION.EVM_BERLIN,
        optimizationRuns: 200,
      },
      "ERC721NFT": {
        compilerVersion: SOLIDITY_VERSION.SOLIDITY_V_8_17,
        optimization: false,
        evmVersion: EVM_VERSION.EVM_BERLIN,
        optimizationRuns: 200,
      },
      "Multisend": {
        compilerVersion: SOLIDITY_VERSION.SOLIDITY_V_8_17,
        optimization: false,
        evmVersion: EVM_VERSION.EVM_BERLIN,
        optimizationRuns: 200,
      },
      "Ordinals": {
        compilerVersion: SOLIDITY_VERSION.SOLIDITY_V_8_17,
        optimization: false,
        evmVersion: EVM_VERSION.EVM_BERLIN,
        optimizationRuns: 200,
      },
      "BNS": {
        compilerVersion: SOLIDITY_VERSION.SOLIDITY_V_8_17,
        optimization: false,
        evmVersion: EVM_VERSION.EVM_BERLIN,
        optimizationRuns: 200,
      },
      "governance": {
        compilerVersion: SOLIDITY_VERSION.SOLIDITY_V_8_17,
        optimization: true,
        evmVersion: EVM_VERSION.EVM_BERLIN,
        optimizationRuns: 200,
      },
      "GWTC": {
        compilerVersion: SOLIDITY_VERSION.SOLIDITY_V_8_17,
        optimization: false,
        evmVersion: EVM_VERSION.EVM_BERLIN,
        optimizationRuns: 200,
      },
      "TransparentUpgradeableProxy": {
        compilerVersion: SOLIDITY_VERSION.SOLIDITY_V_8_10,
        optimization: true,
        evmVersion: EVM_VERSION.EVM_LONDON,
        optimizationRuns: 999999,
      },
      "ProxyAdmin": {
        compilerVersion: SOLIDITY_VERSION.SOLIDITY_V_8_10,
        optimization: true,
        evmVersion: EVM_VERSION.EVM_LONDON,
        optimizationRuns: 999999,
      },
    },
  },
};

export default config;
