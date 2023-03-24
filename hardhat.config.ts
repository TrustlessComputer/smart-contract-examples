import { HardhatUserConfig, task } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-deploy";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import "@ericxstone/hardhat-blockscout-verify";
import { SOLIDITY_VERSION, EVM_VERSION } from "@ericxstone/hardhat-blockscout-verify";

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
        mnemonic: "...",
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

task("balance", "Prints an account's balance")
  .addOptionalParam("account", "The account's address", "")
  .setAction(async (taskArgs: any, hre: HardhatRuntimeEnvironment) => {
    const { ethers } = hre;
    const accs = await ethers.getSigners();
    const account = taskArgs.account || accs[0].address;
    const balance = await ethers.provider.getBalance(account);

    console.log(ethers.utils.formatEther(balance), "ETH");
  });

task("balanceERC20", "Prints an account's balance of ERC20 token")
  .setAction(async (taskArgs: any, hre: HardhatRuntimeEnvironment) => {
    const { deployments, ethers } = hre;
    const accs = await ethers.getSigners();
    const d = await deployments.get("MyERC20");
    const fac = await ethers.getContractFactory("MyERC20");
    const c = fac.attach(d.address);
    for (const acc of accs) {
      const balance = await c.balanceOf(acc.address);
      console.log(acc.address, ":", ethers.utils.formatEther(balance), "TTK");
    }
  });

task("transferERC20", "Transfer ERC20 token")
  .addParam("from", "sender address")
  .addParam("to", "receiver address")
  .addParam("amount", "transfer amount (in TTK)")
  .setAction(async (taskArgs: any, hre: HardhatRuntimeEnvironment) => {
    const { deployments, ethers } = hre;
    const signer = await ethers.getSigner(taskArgs.from);
    const d = await deployments.get("MyERC20");
    const fac = await ethers.getContractFactory("MyERC20");
    const c = fac.attach(d.address).connect(signer);
    const res = await c.transfer(taskArgs.to, ethers.utils.parseEther(taskArgs.amount));
    console.log(res);
  });

task("deposit", "Deposit native token to get wrapped token")
  .addParam("amount", "deposit amount")
  .setAction(async (taskArgs: any, hre: HardhatRuntimeEnvironment) => {
    const { deployments, ethers } = hre;
    const accs = await ethers.getSigners();
    const d = await deployments.get("WETH9");
    const fac = await ethers.getContractFactory("WETH9");
    const c = fac.attach(d.address).connect(accs[0]);
    const res = await c.deposit({ value: ethers.utils.parseUnits(taskArgs.amount, 'ether') });
    console.log(res);
  });

task("withdraw", "Withdraw wrapped token to get native token")
  .addParam("amount", "withdraw amount")
  .setAction(async (taskArgs: any, hre: HardhatRuntimeEnvironment) => {
    const { deployments, ethers } = hre;
    const d = await deployments.get("WETH9");
    const fac = await ethers.getContractFactory("WETH9");
    const c = fac.attach(d.address);
    const res = await c.withdraw(ethers.utils.parseUnits(taskArgs.amount, 'ether'));
    console.log(res);
  });


task("write-storage", "store file to BFS (chunked if needed)")
  .addParam("filename", "file name")
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    const temp = await hre.deployments.get('BFS');
    const { deployments, ethers } = hre;
    const [ signer ] = await ethers.getSigners();
    const fac = await ethers.getContractFactory('BFS');
    const c = fac.attach(temp.address).connect(signer);
    const fs = require('fs');
    const rawdata = fs.readFileSync(taskArgs.filename);
    // partition rawdata into chunks
    const chunksize = 380_000;
    let chunks = [];
    for (let i = 0; i < rawdata.length; i += chunksize) {
      chunks.push(rawdata.slice(i, i + chunksize));
    }

    for (let i = chunks.length - 1; i >= 0; i--) {
      console.log('inscribe chunk', i, 'with', chunks[i].length, 'bytes');
      const res = await c.store(taskArgs.filename, i, chunks[i]);
      console.log(res.hash);
      await res.wait();
    }
    console.log('Done');
  });

task("read-storage", "load file from BFS")
  .addParam("filename", "file name")
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    const temp = await hre.deployments.get('BFS');
    const { deployments, ethers } = hre;
    const [ signer ] = await ethers.getSigners();
    const fac = await ethers.getContractFactory('BFS');
    const c = fac.attach(temp.address).connect(signer);

    let chunks = [];
    for (let nextChunk = 0; nextChunk < 1000000;) { // loop at least once, max 1000000 chunks
      const res = await c.load(signer.address, taskArgs.filename, nextChunk);
      const temp = ethers.utils.arrayify(res[0]);
      chunks.push(temp);
      nextChunk = res[1].toNumber();
      if (nextChunk == -1) break;
    }
    const result = Buffer.concat(chunks);
    console.log('read data');
    console.log(result.toString());

    // const fs = require('fs');
    // const comparedata = fs.readFileSync(taskArgs.filename);
    // console.log("loaded data matches ?", result.equals(comparedata));

  });

task("mint-nft", "mint a fully on-chain NFT")
  .addParam("name", "metadata file name")
  .addParam("img", "image file name")
  .addParam("tokenid", "token id")
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    const { deployments, ethers } = hre;
    const [ signer ] = await ethers.getSigners();
    let fac = await ethers.getContractFactory('NFT');
    let d = await hre.deployments.get('NFT');
    const nftContract = fac.attach(d.address).connect(signer);
    fac = await ethers.getContractFactory('BFS');
    d = await hre.deployments.get('BFS');
    const bfsContract = fac.attach(d.address).connect(signer);

    const tokenId = ethers.BigNumber.from(taskArgs.tokenid);
    const fs = require('fs');
    const filenames = ['metadata.json', taskArgs.img].map(s => taskArgs.name + '/' + s);
    const rawdataLst = filenames.map(filename => fs.readFileSync(filename));
    for (let k = 0; k < rawdataLst.length; k++) {
      const rawdata = rawdataLst[k];
      // partition rawdata into chunks
      const chunksize = 380_000;
      let chunks = [];
      for (let i = 0; i < rawdata.length; i += chunksize) {
        chunks.push(rawdata.slice(i, i + chunksize));
      }

      for (let i = chunks.length - 1; i >= 0; i--) {
        console.log('inscribe chunk', i, 'of file', filenames[k], 'with', chunks[i].length, 'bytes');
        const res = await bfsContract.store(filenames[k], i, chunks[i]);
        console.log(res.hash);
        await res.wait();
      }
    }

    const minttx = await nftContract.safeMint(signer.address, tokenId, signer.address + '/' + taskArgs.name);
    console.log('minted token', tokenId.toString(), 'with tx', minttx.hash);
    await minttx.wait();
    console.log('uri', await nftContract.tokenURI(tokenId));
    console.log('Done');
  });

task("mint-nfts", "mint many NFTs")
  .addParam("name", "metadata file name")
  .addOptionalParam("bfsaddress", "The BFS address", "")
  .addOptionalParam("nftaddress", "The NFT address", "")
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    const { deployments, ethers } = hre;
    const [ signer ] = await ethers.getSigners();
    let fac = await ethers.getContractFactory('NFT');
    let contractAddress = taskArgs.nftaddress;
    if (contractAddress == "") {
      const d = await deployments.get("NFT");
      contractAddress = d.address;
    }
    const nftContract = fac.attach(contractAddress).connect(signer);
    fac = await ethers.getContractFactory('BFS');
    contractAddress = taskArgs.bfsaddress;
    if (contractAddress == "") {
      const d = await deployments.get("BFS");
      contractAddress = d.address;
    }
    const bfsContract = fac.attach(contractAddress).connect(signer);

    const fs = require('fs');
    // find all subdirectories with this prefix
    const onchainPrefix = taskArgs.name;
    const filenameLst = fs.readdirSync('nfts').filter((s: string) => s.endsWith('html'));
    console.log('tokenIds', filenameLst);
    for (let j = 0; j < filenameLst.length; j++) {
      const tokenId = ethers.BigNumber.from(filenameLst[j].split('.')[0]);
      console.log('minting token', tokenId.toString());
      const fullPath = 'nfts/' + filenameLst[j];
        const rawdata = fs.readFileSync(fullPath);
        // partition rawdata into chunks
        const chunksize = 380_000;
        let chunks = [];
        for (let i = 0; i < rawdata.length; i += chunksize) {
          chunks.push(rawdata.slice(i, i + chunksize));
        }

        const name = onchainPrefix + '/' + filenameLst[j];
        for (let i = chunks.length - 1; i >= 0; i--) {
          console.log('inscribe chunk', i, 'of file', fullPath, 'with', chunks[i].length, 'bytes')
          // console.log(' and data:', chunks[i]);
          const res = await bfsContract.store(name, i, chunks[i]);
          console.log(res.hash);
          await res.wait();
        }
      const minttx = await nftContract.safeMint(signer.address, tokenId, signer.address + '/' + name);
      console.log('minted token', tokenId.toString(), 'with tx', minttx.hash);
      await minttx.wait();
      console.log('uri', await nftContract.tokenURI(tokenId));
    }
    console.log('Done');
  });

task("get-nft", "retrieve data for an NFT")
  .addOptionalParam("uri", "uri of the NFT", "")
  .addOptionalParam("tokenid", "token id (if no uri is given)", "")
  .addOptionalParam("bfsaddress", "The BFS address", "")
  .addOptionalParam("nftaddress", "The NFT address", "")
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    const { deployments, ethers } = hre;
    const [ signer ] = await ethers.getSigners();
    let fac = await ethers.getContractFactory('NFT');
    let contractAddress = taskArgs.nftaddress;
    if (contractAddress == "") {
      const d = await deployments.get("NFT");
      contractAddress = d.address;
    }
    const nftContract = fac.attach(contractAddress).connect(signer);
    fac = await ethers.getContractFactory('BFS');
    contractAddress = taskArgs.bfsaddress;
    if (contractAddress == "") {
      const d = await deployments.get("BFS");
      contractAddress = d.address;
    }
    const bfsContract = fac.attach(contractAddress).connect(signer);

    let uri = taskArgs.uri;
    if (uri.length == 0) {
      const fac = await ethers.getContractFactory('NFT');
      const d = await hre.deployments.get('NFT');
      const nftContract = fac.attach(d.address).connect(signer);
      const tokenId = ethers.BigNumber.from(taskArgs.tokenid);
      uri = await nftContract.tokenURI(tokenId);
    }
    console.log('uri', uri);
    if (!uri.startsWith('bfs://')) {
      throw new Error('uri must start with bfs://');
    }
    let temp = uri.slice(6);
    const uriParts = temp.split('/', 5);
    
    if (uriParts[0] != 22213) {
      throw new Error('invalid chain ID');
    }
    if (ethers.utils.getAddress(uriParts[1]) != ethers.utils.getAddress(bfsContract.address)) {
      throw new Error('invalid BFS address');
    }
    const addr = uriParts[2];
    const filenamePre = uriParts[3];
    const fs = require('fs');
    fs.mkdirSync(filenamePre, { recursive: true });
    let filename = filenamePre + '/' + uriParts[4] // + '/metadata.json';
    let chunks = [];
    for (let nextChunk = 0; nextChunk < 1000000;) {
      const res = await bfsContract.load(addr, filename, nextChunk);
      const temp = ethers.utils.arrayify(res[0]);
      chunks.push(temp);
      nextChunk = res[1].toNumber();
      if (nextChunk == -1) break;
    }
    const resultBuf = Buffer.concat(chunks);
    fs.writeFileSync(filename, resultBuf);
    let md;
    try {
      md = JSON.parse(resultBuf.toString());
    } catch (e) { 
      console.log('NFT data:', resultBuf.toString());
      return;
    }
    console.log('NFT metadata', md);

    if (md?.image?.length) {
      const imgname = md.image;
      filename = filenamePre + '/' + imgname;
      chunks = [];
      for (let nextChunk = 0; nextChunk < 1000000;) {
        const res = await bfsContract.load(signer.address, filename, nextChunk);
        const temp = ethers.utils.arrayify(res[0]);
        chunks.push(temp);
        nextChunk = res[1].toNumber();
        if (nextChunk == -1) break;
      }
      const resultBuf = Buffer.concat(chunks);
      fs.writeFileSync(filename, resultBuf);
      console.log('NFT image name:', filename);
    }
  });



export default config;
