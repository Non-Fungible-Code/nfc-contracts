const { expect } = require('chai');
const { ethers, upgrades } = require('hardhat');

describe('NFC', function () {
  let nfc;
  let admin;
  let treasury;
  let signer;
  let author;

  beforeEach(async function () {
    [admin, treasury, signer, author] = await ethers.getSigners();

    const NFC = await ethers.getContractFactory('NFC');
    nfc = await upgrades.deployProxy(NFC, [
      'Non-Fungible Code Test',
      'NFCT',
      'ipfs://',
      await treasury.getAddress(),
      '1000',
    ]);
    await nfc.deployed();
  });

  const createProject = async () => {
    const res = await nfc
      .connect(author)
      .createProject(
        author.address,
        'https://example.com',
        'PCID',
        'Name',
        'Description',
        'NIFTY License',
        '1000000000000000000',
        '2',
        'CID0',
        { value: '1000000000000000000' },
      );
    return res;
  };

  describe('createProject', function () {
    it('Should emit ProjectCreated event', async function () {
      await expect(createProject())
        .to.emit(nfc, 'ProjectCreated')
        .withArgs(author.address, '0');
    });
  });

  describe('mint', function () {
    it('Should revert if the project does not exist', async function () {
      await expect(
        nfc.connect(signer).mint(signer.address, '0', 'CID1', {
          value: '1000000000000000000',
        }),
      ).to.be.reverted;
    });
    it('Should revert if the amount of ETH sent is insufficient', async function () {
      await createProject();

      await expect(
        nfc
          .connect(signer)
          .mint(signer.address, '0', 'CID1', { value: '999999999999999999' }),
      ).to.be.reverted;
    });
    it('Should revert if the project has reached its edition limit', async function () {
      await createProject();

      await nfc
        .connect(signer)
        .mint(signer.address, '0', 'CID1', { value: '1000000000000000000' });

      await expect(
        nfc
          .connect(signer)
          .mint(signer.address, '0', 'CID2', { value: '1000000000000000000' }),
      ).to.be.reverted;
    });
    it('Should emit Minted event', async function () {
      await createProject();

      await expect(
        nfc
          .connect(signer)
          .mint(signer.address, '0', 'CID1', { value: '1000000000000000000' }),
      )
        .to.emit(nfc, 'Minted')
        .withArgs(signer.address, '1');
    });
    it('Should transfer ETH to the author, charge fee based on _feeInBp, and refund the sender if ETH sent is higher than the price', async function () {
      await createProject();

      const feeInBp = await nfc.feeInBp();

      await expect(
        await nfc
          .connect(signer)
          .mint(signer.address, '0', 'CID1', { value: '1000000000000000001' }),
      ).to.changeEtherBalances(
        [treasury, author, signer],
        [
          ethers.BigNumber.from('1000000000000000000').mul(feeInBp).div(10000),
          ethers.BigNumber.from('1000000000000000000').sub(
            ethers.BigNumber.from('1000000000000000000')
              .mul(feeInBp)
              .div(10000),
          ),
          ethers.BigNumber.from('-1000000000000000000'),
        ],
      );
    });
  });

  describe('pause/unpause', function () {
    it('Should revert if the caller is not the admin', async function () {
      await createProject();

      await expect(nfc.connect(signer).pause()).to.be.reverted;

      await nfc.connect(admin).pause();

      await expect(nfc.connect(signer).unpause()).to.be.reverted;
    });
    it('Should emit Paused/Unpaused event', async function () {
      await createProject();

      await expect(nfc.connect(admin).pause())
        .to.emit(nfc, 'Paused')
        .withArgs(admin.address);
      await expect(nfc.connect(admin).unpause())
        .to.emit(nfc, 'Unpaused')
        .withArgs(admin.address);
    });
  });

  describe('pauseProject/unpauseProject', function () {
    it('Should revert if the caller is not the author of the project', async function () {
      await createProject();

      await expect(nfc.connect(signer).pauseProject('0')).to.be.reverted;
      await expect(nfc.connect(admin).pauseProject('0')).to.be.reverted;

      await nfc.connect(author).pauseProject('0');

      await expect(nfc.connect(signer).unpauseProject('0')).to.be.reverted;
      await expect(nfc.connect(admin).unpauseProject('0')).to.be.reverted;
    });
    it('Should emit ProjectPaused/ProjectUnpaused event', async function () {
      await createProject();

      await expect(nfc.connect(author).pauseProject('0'))
        .to.emit(nfc, 'ProjectPaused')
        .withArgs(author.address, '0');
      await expect(nfc.connect(author).unpauseProject('0'))
        .to.emit(nfc, 'ProjectUnpaused')
        .withArgs(author.address, '0');
    });
  });

  describe('setTreasury', function () {
    it('Should revert if the caller is not the admin', async function () {
      await expect(
        nfc
          .connect(signer)
          .setTreasury('0xbCF4832efF0AC4b832CA6e3A47Dc7dab70189a07'),
      ).to.be.reverted;
    });
    it('Should emit TreasuryUpdated event', async function () {
      await expect(
        nfc
          .connect(admin)
          .setTreasury('0xbCF4832efF0AC4b832CA6e3A47Dc7dab70189a07'),
      )
        .to.emit(nfc, 'TreasuryUpdated')
        .withArgs(admin.address, '0xbCF4832efF0AC4b832CA6e3A47Dc7dab70189a07');
    });
  });

  describe('setFeeInBp', function () {
    it('Should revert if the caller is not the admin', async function () {
      await expect(nfc.connect(signer).setFeeInBp('100')).to.be.reverted;
    });
    it('Should revert if the fee BP is not smaller than 10000', async function () {
      await expect(nfc.connect(signer).setFeeInBp('10000')).to.be.reverted;
    });
    it('Should emit FeeUpdated event', async function () {
      await expect(nfc.connect(admin).setFeeInBp('0'))
        .to.emit(nfc, 'FeeUpdated')
        .withArgs(admin.address, '0');
    });
  });
});
