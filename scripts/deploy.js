const { ethers, upgrades } = require('hardhat');

(async () => {
  console.log('Deploying...');
  const NFC = await ethers.getContractFactory('NFC');
  const nfc = await upgrades.deployProxy(NFC, [
    'Non-Fungible Code',
    'NFC',
    'ipfs://',
    '0x40301310d0364555abF68EED390C6B03f838F868',
    '1000',
  ]);

  await nfc.deployed();
  console.log(`Deployed to: ${nfc.address}`);
})();
