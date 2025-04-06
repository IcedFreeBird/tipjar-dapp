const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
module.exports = buildModule("TipJarModule", (m) => {
    const tipJar = m.contract("TipJar");
    return { tipJar };
  });