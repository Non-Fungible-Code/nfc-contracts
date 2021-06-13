require('@nomiclabs/hardhat-waffle');
require('@nomiclabs/hardhat-solhint');
require('@nomiclabs/hardhat-etherscan');
require('hardhat-contract-sizer');
require('@openzeppelin/hardhat-upgrades');

require('dotenv').config();

const { MAINNET_URL, RINKEBY_URL, ETHERSCAN_API_KEY, PRIVATE_KEY } =
  process.env;

task('accounts', 'Prints the list of accounts', async () => {
  const accounts = await ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

module.exports = {
  solidity: {
    version: '0.8.4',
    settings: {
      optimizer: {
        enabled: true,
        // runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      forking: {
        url: MAINNET_URL,
        blockNumber: 11095000,
      },
    },
    rinkeby: {
      url: RINKEBY_URL,
      accounts: [PRIVATE_KEY],
    },
    mainnet: {
      url: MAINNET_URL,
      accounts: [PRIVATE_KEY],
    },
  },
  contractSizer: {
    alphaSort: true,
    runOnCompile: true,
    disambiguatePaths: false,
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
};
