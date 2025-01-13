const {ethers} = require("hardhat");
const {ASSETS, LADAO_MULTISIGS} = require("../const");

const VERSION = "0.0";

const RESERVE_CAPS = {
    weth: {
        defaultInitialLimit: ethers.parseUnits("5", 18),
    },
    wsteth: {
        defaultInitialLimit: ethers.parseUnits("5", 18),
    },
    op: {
        defaultInitialLimit: ethers.parseUnits("5000", 18),
    },
};

const WNATIVE = ASSETS.optimismSepolia.weth.address;
const TREASURY = LADAO_MULTISIGS.optimismSepolia;

module.exports = {
    VERSION,
    WNATIVE,
    RESERVE_CAPS,
    ASSETS,
    TREASURY,
};
