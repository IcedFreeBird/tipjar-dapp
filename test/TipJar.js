const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TipJar Contract", function () {
  let TipJar, tipJar, owner, addr1, addr2;

  beforeEach(async () => {
    [owner, addr1, addr2] = await ethers.getSigners(); // 获取测试账户

    TipJar = await ethers.getContractFactory("TipJar");
    tipJar = await TipJar.deploy(); // 部署合约
    await tipJar.waitForDeployment(); // 等待部署完成
  });

  it("部署时设置合约拥有者", async () => {
    expect(await tipJar.owner()).to.equal(owner.address);
  });

  it("允许用户打赏 ETH", async () => {
    const tipAmount = ethers.parseEther("0.1");
    await expect(
      tipJar.connect(addr1).tip({ value: tipAmount })
    ).to.changeEtherBalance(tipJar, tipAmount);

    const balance = await tipJar.getBalance();
    expect(balance).to.equal(tipAmount);
  });

  it("只有 owner 可以提现", async () => {
    const tipAmount = ethers.parseEther("0.2");
    await tipJar.connect(addr1).tip({ value: tipAmount });

    await expect(tipJar.connect(addr1).withdraw()).to.be.revertedWith(
      "You are not owner"
    );

    await expect(() =>
      tipJar.connect(owner).withdraw()
    ).to.changeEtherBalances(
      [tipJar, owner],
      [ethers.parseEther("-0.2"), ethers.parseEther("0.2")]
    );
  });

  it("不能打赏 0 ETH", async () => {
    await expect(tipJar.connect(addr1).tip({ value: 0 })).to.be.revertedWith(
      "You should send a tip to use this function"
    );
  });

  it("不能提现空余额", async () => {
    await expect(tipJar.connect(owner).withdraw()).to.be.revertedWith(
      "There are no tips to withdraw"
    );
  });
});
