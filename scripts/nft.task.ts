import { task, types } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { NonceManager } from "@ethersproject/experimental";

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

task("mint-nft", "mint a fully on-chain NFT")
  .addParam("name", "metadata file name")
  .addParam("img", "image file name")
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    const { deployments, ethers } = hre;
    const [signer] = await ethers.getSigners();
    let fac = await ethers.getContractFactory('NFT');
    let d = await hre.deployments.get('NFT');
    const nftContract = fac.attach(d.address).connect(signer);
    fac = await ethers.getContractFactory('BFS');
    d = await hre.deployments.get('BFS');
    const bfsContract = fac.attach(d.address).connect(signer);

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

    const dirUri = `bfs://22213/${bfsContract.address}/${signer.address}/${taskArgs.name}`;
    nftContract.once(nftContract.filters.Transfer(null, ethers.utils.getAddress(signer.address)), async (from, to, tokenId, event: any) => {
      console.log('minted:', event);
      console.log('uri', await nftContract.tokenURI(tokenId));
    });
    const minttx = await nftContract.safeMint(signer.address, dirUri);
    await minttx.wait();
    console.log('Done');
  });

task("mint-nfts", "mint many NFTs")
  .addParam("name", "metadata file name")
  .addOptionalParam("bfsaddress", "The BFS address", "")
  .addOptionalParam("nftaddress", "The NFT address", "")
  .addOptionalParam("ext", "Metadata file extension", "json")
  .addOptionalParam("upload", "The BFS address", false, types.boolean)
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    const { deployments, ethers } = hre;
    const [signer] = await ethers.getSigners();
    const nonceManagedSigner = new NonceManager(signer);
    let contractAddress = taskArgs.nftaddress;
    if (contractAddress == "") {
      const d = await deployments.get("NFT");
      contractAddress = d.address;
    }
    let fac = await ethers.getContractFactory('NFT');
    const nftContract = fac.attach(contractAddress).connect(nonceManagedSigner);
    
    fac = await ethers.getContractFactory('BFS');
    contractAddress = taskArgs.bfsaddress;
    if (contractAddress == "") {
      const d = await deployments.get("BFS");
      contractAddress = d.address;
    }
    const bfsContract = fac.attach(contractAddress).connect(nonceManagedSigner);

    const fs = require('fs');
    // find all subdirectories with this prefix
    const filenameLst = fs.readdirSync('sudos-collection').filter((s: string) => s.endsWith(taskArgs.ext));
    
    let addresses = [];
    let uris = [];
    for (let j = 0; j < filenameLst.length; j++) {
      const tokenName = ethers.BigNumber.from(filenameLst[j].split('.')[0]);
      console.log('minting token', tokenName.toString());

      const uri = `bfs://22213/${bfsContract.address}/${signer.address}/${taskArgs.name}/${filenameLst[j]}`;
      console.log('uri', uri);
      // const evPrms = nftContract.once(nftContract.filters.Transfer(ethers.utils.getAddress('0x0000000000000000000000000000000000000000'), ethers.utils.getAddress(signer.address), null), async (from, to, tokenId, event: any) => {
      //   console.log('minted:', event);
      //   console.log('uri', await nftContract.tokenURI(tokenId));
      // });
      
      addresses.push(signer.address);
      uris.push(uri);
    }

    const minttx = await nftContract.batchMint(addresses, uris);
    console.log('tx', minttx);
    console.log('Done');
  });

task("upload-nfts", "mint many NFTs")
  .addParam("name", "metadata file name")
  .addOptionalParam("bfsaddress", "The BFS address", "")
  .addOptionalParam("nftaddress", "The NFT address", "")
  .addOptionalParam("ext", "Metadata file extension", "json")
  .addOptionalParam("upload", "The BFS address", false, types.boolean)
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    const { deployments, ethers } = hre;
    const [signer] = await ethers.getSigners();
    const nonceManagedSigner = new NonceManager(signer);
    let contractAddress = taskArgs.nftaddress;
    if (contractAddress == "") {
      const d = await deployments.get("NFT");
      contractAddress = d.address;
    }
    let fac = await ethers.getContractFactory('NFT');
    const nftContract = fac.attach(contractAddress).connect(nonceManagedSigner);
    
    fac = await ethers.getContractFactory('BFS');
    contractAddress = taskArgs.bfsaddress;
    if (contractAddress == "") {
      const d = await deployments.get("BFS");
      contractAddress = d.address;
    }
    const bfsContract = fac.attach(contractAddress).connect(nonceManagedSigner);

    const fs = require('fs');
    // find all subdirectories with this prefix
    const filenameLst = fs.readdirSync('sudos-collection').filter((s: string) => s.endsWith(taskArgs.ext));
    
    let queue = []
    for (let j = 0; j < filenameLst.length; j++) {
      const tokenName = ethers.BigNumber.from(filenameLst[j].split('.')[0]);
      if (tokenName.toNumber() == 0) {
        console.log('skipping token', tokenName.toString());
        await sleep(100);
        continue;
      }
      console.log('minting token', tokenName.toString());

      const fullPath = taskArgs.name + '/' + filenameLst[j];
      const rawdata = fs.readFileSync(fullPath);
      // partition rawdata into chunks
      const chunksize = 380_000;
      let chunks = [];
      for (let i = 0; i < rawdata.length; i += chunksize) {
        chunks.push(rawdata.slice(i, i + chunksize));
      }

      const name = taskArgs.name + '/' + filenameLst[j];
      for (let i = chunks.length - 1; i >= 0; i--) {
        console.log('inscribe chunk', i, 'of file', fullPath, 'with', chunks[i].length, 'bytes')
        try {
          const res = await bfsContract.store(name, i, chunks[i]);
          console.log(res.hash);
          queue.push(res.wait());
          await sleep(100);
        } catch (e) {
          console.log('error encountered, file likely exists already');
        }
      }
      if (queue.length >= 100) {
        await Promise.all(queue);
        queue = [];
      }
      const uri = `bfs://22213/${bfsContract.address}/${signer.address}/${taskArgs.name}/${filenameLst[j]}`;
      console.log('uri', uri);
    }
    await Promise.all(queue);
    console.log('Done');
  });

task("transfer-nft", "transfer single NFT with given token ID")
  .addParam("tokenid", "token id")
  .addParam("to", "address to transfer to")
  .addOptionalParam("nftaddress", "The NFT address", "")
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    const { deployments, ethers } = hre;
    const [signer] = await ethers.getSigners();
    const fac = await ethers.getContractFactory('NFT');
    let contractAddress = taskArgs.nftaddress;
    if (contractAddress == "") {
      const d = await deployments.get("NFT");
      contractAddress = d.address;
    }
    const nftContract = fac.attach(contractAddress).connect(signer);
    const tokenId = ethers.BigNumber.from(taskArgs.tokenid);
    const tx = await nftContract.transferFrom(signer.address, taskArgs.to, tokenId); // will not check that receiver contract is compatible
    console.log('tx', tx.hash);
    console.log('Done');
  });

task("transfer-nfts", "transfer many NFTs sequentially")
  .addParam("tokenids", "list of token ids")
  .addParam("tos", "address to transfer to")
  .addOptionalParam("nftaddress", "The NFT address", "")
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    const { deployments, ethers } = hre;
    const [signer] = await ethers.getSigners();
    const nonceManagedSigner = new NonceManager(signer);
    const fac = await ethers.getContractFactory('NFT');
    let contractAddress = taskArgs.nftaddress;
    if (contractAddress == "") {
      const d = await deployments.get("NFT");
      contractAddress = d.address;
    }
    const nftContract = fac.attach(contractAddress).connect(nonceManagedSigner);
    const tokenIds = taskArgs.tokenids.split(',').map((s: string) => ethers.BigNumber.from(s));
    const tos = taskArgs.tos.split(',');
    if (tokenIds.length != tos.length) {
      console.log('token ids and tos must be same length');
      return;
    }
    for (let i = 0; i < tokenIds.length; i++) {
      const tokenId = tokenIds[i];
      const to = tos[i];
      const tx = await nftContract.transferFrom(signer.address, to, tokenId);
      console.log('tx', tx.hash);
      await sleep(100);
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
    const [signer] = await ethers.getSigners();
    const fac = await ethers.getContractFactory('BFS');
    let contractAddress = taskArgs.bfsaddress;
    if (contractAddress == "") {
      const d = await deployments.get("BFS");
      contractAddress = d.address;
    }
    const bfsContract = fac.attach(contractAddress).connect(signer);

    let uri = taskArgs.uri;
    if (uri.length == 0) {
      const fac = await ethers.getContractFactory('NFT');
      let contractAddress = taskArgs.nftaddress;
      if (contractAddress == "") {
        const d = await deployments.get("NFT");
        contractAddress = d.address;
      }
      const nftContract = fac.attach(contractAddress).connect(signer);
      const tokenId = ethers.BigNumber.from(taskArgs.tokenid);

      const owner = await nftContract.ownerOf(tokenId);
      uri = await nftContract.tokenURI(tokenId);
      console.log('id', tokenId.toString(), '-> uri', uri);      
      console.log('owner of NFT:', await nftContract.ownerOf(tokenId));
    }

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
    const l = uriParts.length;
    const dirname = uriParts.slice(3, l - 1).join('/');
    const filenameShort = uriParts[l - 1].length == 0 ? 'metadata.json' : uriParts[l - 1];
    const fs = require('fs');
    if (dirname.length > 0) fs.mkdirSync(dirname, { recursive: true });
    let filename = dirname + '/' + filenameShort;
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
      console.log('NFT data:', resultBuf.toString() || 'none');
      return;
    }
    console.log('NFT metadata', md);

    if (md?.image?.length && md.image.length < 256) {
      const imgname = md.image;
      filename = dirname + '/' + imgname;
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


