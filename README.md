## List of smart contracts

- ERC20 - a simple contract that implements the ERC20 standard
- Wrapped JUICE (WJUICE) - an ERC20-compatible, wrapped version of the JUICE native token
- BFS - a simple contract that allows users to store files on the blockchain. It enables data storage & retrieval under the URI format `bfs://<chain-id>/<storage-contract-address>/<user-address>/<file-name>`
- NFT - a simple contract that allows users to mint fully on-chain NFTs

## How to use

Use Hardhat to deploy the contracts and interact with them.

```

### Clone the source code

```bash
git clone https://github.com/bld4666/smart-contract-examples.git
```

### Install dependencies

```bash
cd smart-contract-examples
npm install
npx hardhat compile
```

### Deploy contracts

#### Hardhat configs

- Review your configs in `hardhat.config.ts` - config file for hardhat. The network configs should look like this
```js
  networks: {
    mynw: {
      url: "http://localhost:10002",
      accounts: {
        mnemonic: "<your mnemonic with funds>"
      },
      timeout: 100_000,
    },
    blockscoutVerify: {
    	blockscoutURL: "http://localhost:4000", // your explorer URL
    	...
    }
  }
```

#### Run deploy scripts (using hardhat-deploy)
```bash
# make sure the accounts in hardhat.config.ts are funded
npx hardhat deploy # --reset # use "--reset" to overwrite existing deployments
npx hardhat blockscout-verify contracts/ERC20.sol <your-deployed-address>
npx hardhat blockscout-verify contracts/WETH9.sol <your-deployed-address>
npx hardhat blockscout-verify contracts/Storage.sol <your-deployed-address>
npx hardhat blockscout-verify contracts/ERC721NFT.sol <your-deployed-address>
```

### Interact with contracts

#### ERC20

```bash
npx hardhat balanceERC20
npx hardhat transferERC20 --from <your-address> --amount 0.1 --to <your-address>
```

#### WJUICE

```bash
npx hardhat deposit --amount 0.4
npx hardhat withdraw --amount 0.25
```

#### BFS

```bash
# store data
echo "this is some text" > data.txt
npx hardhat write-storage --filename ./data.txt
npx hardhat read-storage --filename ./data.txt # read data, print it as readable text
```

#### NFT

```bash
# example directory
# ./art1/metadata.json
# ./art1/wp2.jpg
npx hardhat mint-nft --name art1 --img wp2.jpg --tokenid 1234
# output should contain URI, replace it below
npx hardhat get-nft --uri bfs://22213/0xfe94d57c6ef567d26e3524f54dc2772329092ffd/0xd3b0932Dff95a56c6024328162a3040F5e717F76/art1
```

