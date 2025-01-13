require("@nomicfoundation/hardhat-toolbox");
require("@openzeppelin/hardhat-upgrades");
require("hardhat-contract-sizer");
require("dotenv").config();
const fs = require("fs");

const DEBUG = false;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: {
        settings: {
            outputSelection: {
                "*": {
                    "*": ["storageLayout"],
                },
            },
            metadata: {
                useLiteralContent: true,
            },
        },
        compilers: [
            {
                version: "0.8.17",
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 10000,
                        details: {
                            yul: true,
                        },
                    },
                },
            },
        ],
    },
    networks: {
        localhost: {
            url: "http://127.0.0.1:8545/",
            timeout: 2000000,
        },
        localhostWithPKey: {
            url: "http://127.0.0.1:8545/",
            timeout: 2000000,
            accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : {mnemonic: mnemonic()},
            /*
        no mnemonic here? it will just use account 0 of the hardhat node to deploy
        (add mnemonic() here to set the deployer locally)
      */
        },
        mainnet: {
            chainId: 1,
            url: `https://mainnet.infura.io/v3/${process.env.INFURA_ID}`,
            accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : {mnemonic: mnemonic()},
        },
        polygon: {
            chainId: 137,
            url: `https://polygon-mainnet.infura.io/v3/${process.env.INFURA_ID}`,
            accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : {mnemonic: mnemonic()},
        },
        polygonzkevm: {
            chainId: 1101,
            url: `https://zkevm-rpc.com`,
            accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : {mnemonic: mnemonic()},
        },
        arbitrum: {
            chainId: 42161,
            url: `https://arbitrum-mainnet.infura.io/v3/${process.env.INFURA_ID}`,
            accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : {mnemonic: mnemonic()},
        },
        optimism: {
            chainId: 10,
            url: `https://optimism-mainnet.infura.io/v3/${process.env.INFURA_ID}`,
            accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : {mnemonic: mnemonic()},
        },
        gnosis: {
            chainId: 100,
            url: `https://rpc.ankr.com/gnosis`,
            accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : {mnemonic: mnemonic()},
        },
        binance: {
            chainId: 56,
            url: `https://bsc-dataseed1.binance.org`,
            accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : {mnemonic: mnemonic()},
        },
        linea: {
            chainId: 59144,
            url: `https://linea-mainnet.infura.io/v3/${process.env.INFURA_ID}`,
            accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : {mnemonic: mnemonic()},
        },
        base: {
            chainId: 8453,
            url: `https://base-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_ID}`,
            accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : {mnemonic: mnemonic()},
        },
        sepolia: {
            chainId: 11155111,
            url: `https://sepolia.infura.io/v3/${process.env.INFURA_ID}`,
            accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : {mnemonic: mnemonic()},
        },
        mumbai: {
            chainId: 80001,
            url: `https://polygon-mumbai.infura.io/v3/${process.env.INFURA_ID}`,
            accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : {mnemonic: mnemonic()},
        },
        scroll: {
            chainId: 534352,
            url: `https://rpc.scroll.io/`,
            accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : {mnemonic: mnemonic()},
        },
        optimism_sepolia: {
            url: "https://sepolia.optimism.io",
            accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : {mnemonic: mnemonic()},
            chainId: 11155420,
        },
    },
    sourcify: {
        enabled: true,
    },
    etherscan: {
        apiKey: process.env.ETHERSCAN_API_KEY,
        customChains: [
            {
                network: "polygonzkevm",
                chainId: 1101,
                urls: {
                    apiURL: "https://api-zkevm.polygonscan.com/api",
                    browserURL: "https://zkevm.polygonscan.com/",
                },
            },
            {
                network: "linea",
                chainId: 59144,
                urls: {
                    apiURL: "https://api.lineascan.build/api",
                    browserURL: "https://lineascan.build/",
                },
            },
            {
                network: "base",
                chainId: 8453,
                urls: {
                    apiURL: "https://api.basescan.org/api",
                    browserURL: "https://basescan.org/",
                },
            },
        ],
    },
};
