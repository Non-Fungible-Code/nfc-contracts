const { ethers, upgrades } = require('hardhat');

const { NFC_ADDRESS } = process.env;

(async () => {
  const NFC = await ethers.getContractFactory('NFC');
  const nfc = await upgrades.upgradeProxy(NFC_ADDRESS, NFC);
  console.log('NFC upgraded');
})();
