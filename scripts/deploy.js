const { ethers, upgrades } = require('hardhat');

(async () => {
  console.log('Deploying...');
  const NFC = await ethers.getContractFactory('NFC');
  const nfc = await upgrades.deployProxy(NFC, [
    'Non-Fungible Code',
    'NFC',
    'ipfs://',
    'ipfs://QmP33nhfy2hrERr3eGqAG3uRM2w479QZLx31ZrfCTHZpLi',
    '0x40301310d0364555abF68EED390C6B03f838F868',
    '1000',
  ]);

  await nfc.deployed();
  console.log(`Deployed to: ${nfc.address}`);
})();
