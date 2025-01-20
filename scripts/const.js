const LADAO_MULTISIGS = {
    mainnet: "0xaaE1A89e827Ac63d92f3633Be2e0dDd6edafd34a",
    polygon: "0x707C5E55277A0C2f598f191b269c9e773516052A",
    arbitrum: "0x80Ea762B09883Bddf09d3F7E4142ca6E1e697490",
    optimism: "0x71672Aa7f7406D822492EcacA1d614405c87c4A2",
    gnosis: "0x2CBe215Eae3e926f11291560be0e4cda9556DCBb",
    binance: "0xD14F02ad072238d5D58671bcfE07FcBf9a17d5f7",
    sepolia: "0xbd9e84Da78228039867E1687F824a106310c029D",
    base: "0x571131167e1A16D9879FA605319944Ba6E993Dd7",
    linea: "",
    polygonzkevm: "",
    scroll: "0x840A6f02e31eBa9761Ceb18471524B71B506E7F4",
    optimismSepolia: "0x5B2aE816E92bE1b8022dC13eAB9fd77e3232e9C8",
};

const CONTRACT_DEPLOYER_FACTORY = "0xF8faF9319e5CDDfda173B0a6461f19765AAAbf03";
const PYTH_MXN_USD_FEED_ID = "0xe13b1c1ffb32f34e1be9545583f01ef385fde7f42ee66049d30570dc866b77ca";

const ASSETS = {
    mainnet: {
        weth: {
            address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
            storageSlots: {
                balanceOf: 3,
            },
        },
    },
    arbitrum: {
        weth: {
            address: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
            storageSlots: {
                balanceOf: 3,
            },
        },
    },
    optimism: {
        weth: {
            address: "0x4200000000000000000000000000000000000006",
            storageSlots: {
                balanceOf: 3,
            },
        },
    },
    binance: {
        weth: {
            address: "0x2170Ed0880ac9A755fd29B2688956BD959F933F8", // binance pegged eth
            storageSlots: {
                balanceOf: 1,
            },
        },
        wbnb: {
            address: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
            storageSlots: {
                balanceOf: 3,
            },
        },
    },
    polygon: {
        wsteth: {
            address: "0x03b54A6e9a984069379fae1a4fC4dBAE93B3bCCD",
            storageSlots: {
                balanceOf: 0,
            },
        },
        weth: {
            address: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
            storageSlots: {
                balanceOf: 0,
            },
        },
        wmatic: {
            address: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
            storageSlots: {
                balanceOf: 3,
            },
        },
        maticx: {
            address: "0xfa68FB4628DFF1028CFEc22b4162FCcd0d45efb6",
            storageSlots: {
                balanceOf: 0,
            },
        },
        wbtc: {
            address: "0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6",
            storageSlots: {
                balanceOf: 0,
            },
        },
    },
    polygonzkevm: {
        weth: {
            address: "0x4F9A0e7FD2Bf6067db6994CF12E4495Df938E6e9",
            storageSlots: {
                balanceOf: 3,
            },
        },
    },
    linea: {
        weth: {
            address: "0xe5D7C2a44FfDDf6b295A15c148167daaAf5Cf34f",
            storageSlots: {
                balanceOf: 3,
            },
        },
    },
    base: {
        weth: {
            address: "0x4200000000000000000000000000000000000006",
            storageSlots: {
                balanceOf: 3,
            },
        },
        cbeth: {
            address: "0x2Ae3F1Ec7F1F5012CFEab0185bfc7aa3cf0DEc22",
            storageSlots: {
                balanceOf: 51,
            },
        },
    },
    gnosis: {
        weth: {
            address: "0x6A023CCd1ff6F2045C3309768eAd9E68F978f6e1",
            storageSlots: {
                balanceOf: 0,
            },
        },
        gno: {
            address: "0x9C58BAcC331c9aa871AFD802DB6379a98e80CEdb",
            storageSlots: {
                balanceOf: 0,
            },
        },
        wxdai: {
            address: "0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d",
            storageSlots: {
                balanceOf: 0,
            },
        },
    },
    goerli: {
        weth: {
            address: "0xCCB14936C2E000ED8393A571D15A2672537838Ad",
            storageSlots: {
                balanceOf: 3,
            },
        },
        wbtc: {
            address: "0x45AC379F019E48ca5dAC02E54F406F99F5088099",
            storageSlots: {
                balanceOf: 0,
            },
        },
    },
    sepolia: {
        weth: {
            address: "0xD0dF82dE051244f04BfF3A8bB1f62E1cD39eED92",
            storageSlots: {
                balanceOf: 3,
            },
        },
        wbtc: {
            address: "0xf864F011C5A97fD8Da79baEd78ba77b47112935a",
            storageSlots: {
                balanceOf: 0,
            },
        },
    },
    mumbai: {
        wmatic: {
            address: "0xf237dE5664D3c2D2545684E76fef02A3A58A364c",
            storageSlots: {
                balanceOf: 3,
            },
        },
        weth: {
            address: "0xD087ff96281dcf722AEa82aCA57E8545EA9e6C96",
            storageSlots: {
                balanceOf: 0,
            },
        },
        wbtc: {
            address: "0x97e8dE167322a3bCA28E8A49BC46F6Ce128FEC68",
            storageSlots: {
                balanceOf: 0,
            },
        },
    },
    scroll: {
        weth: {
            address: "0x5300000000000000000000000000000000000004",
            storageSlots: {
                balanceOf: 0,
            },
        },
    },
    optimismSepolia: {
        weth: {
            address: "0x4200000000000000000000000000000000000006",
            storageSlots: {
                balanceOf: 3,
            },
        },
    },
};

const ORACLE_CONTRACTS = {
    polygon: {
        pyth: "0xff1a0f4744e8582DF1aE09D5611b887B6a12925C",
        wstetheth: "0x10f964234cae09cB6a9854B56FF7D4F38Cda5E6a",
        wstethusd: "0xe5cfb421281169305F8B162d292FcA211C13CfeC",
        ethusd: "0xf9680d99d6c9589e2a93a78a04a279e509205945",
        wbtcusd: "0xDE31F8bFBD8c84b5360CFACCa3539B938dd78ae6",
        maticusd: "0xAB594600376Ec9fD91F8e885dADF0CE036862dE0",
        maticxusd: "0x5d37E4b374E6907de8Fc7fb33EE3b0af403C7403",
        usdcusd: "0xfE4A8cc5b5B2366C1B58Bea3858e81843581b2F7",
        mxnusd: "0x171b16562EA3476F5C61d1b8dad031DbA0768545",
    },
    binance: {
        pyth: "0x4D7E825f80bDf85e913E0DD2A2D54927e9dE1594",
        ethusd: "0x2A3796273d47c4eD363b361D3AEFb7F7E2A13782", // binance pegged eth
        bnbusd: "0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE",
        mxnusd: "0x16c0C1f971b1780F952572670A9d5ce4123582a1",
    },
    sepolia: {
        pyth: "0xDd24F84d36BF92C65F92307595335bdFab5Bbd21",
        ethusd: "0x694AA1769357215DE4FAC081bf1f309aDC325306",
        btcusd: "0x1b44F3514812d835EB1BDB0acB33d3fA3351Ee43",
        mxnusd: "0x480f3c11381824E9EEbEEdbB6398dB86e38bAEA0",
    },
    arbitrum: {
        sequencer: "0xFdB631F5EE196F0ed6FAa767959853A9F217697D",
        pyth: "0xff1a0f4744e8582DF1aE09D5611b887B6a12925C",
        ethusd: "0x639Fe6ab55C921f74e7fac1ee960C0B6293ba612",
    },
    optimism: {
        sequencer: "0x371EAD81c9102C9BF4874A9075FFFf170F2Ee389",
        pyth: "0xff1a0f4744e8582DF1aE09D5611b887B6a12925C",
        ethusd: "0x13e3Ee699D1909E989722E753853AE30b17e08c5",
    },
    base: {
        sequencer: "0xBCF85224fc0756B9Fa45aA7892530B47e10b6433",
        pyth: "0x8250f4aF4B972684F7b336503E2D6dFeDeB1487a",
        ethusd: "0x71041dddad3595F9CEd3DcCFBe3D1F4b0a16Bb70",
        cbethusd: "0xd7818272B9e248357d13057AAb0B417aF31E817d",
    },
    gnosis: {
        pyth: "0x2880aB155794e7179c9eE2e38200202908C17B43",
        ethusd: "0xa767f745331D267c7751297D982b050c93985627",
        gnousd: "0x22441d81416430A54336aB28765abd31a792Ad37",
        mxnusd: "0xe9cea51a7b1b9B32E057ff62762a2066dA933cD2",
    },
    mainnet: {
        pyth: "0x4305FB66699C3B2702D4d05CF36551390A4c69C6",
        ethusd: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
    },
    linea: {
        pyth: "0xA2aa501b19aff244D90cc15a4Cf739D2725B5729",
        ethusd: "0x3c6Cd9Cc7c7a4c2Cf5a82734CD249D7D593354dA",
    },
    scroll: {
        sequencer: "0x45c2b8C204568A03Dc7A2E32B71D67Fe97F908A9",
        pyth: "0xA2aa501b19aff244D90cc15a4Cf739D2725B5729",
        ethusd: "0x6bF14CB0A831078629D993FDeBcB182b21A8774C",
    },
    optimismSepolia: {
        sequencer: "0xAaa227BEC672216a007755878f6b5bB8776f52CC", // mock sequencer uptime contract
        pyth: "0x0708325268dF9F66270F1401206434524814508b",
        ethusd: "0x61Ec26aA57019C486B10502285c5A3D4A4750AD7",
    },
};

const TLATLALIANI_CONTRACTS = {
    polygon: {
        mxnusd: "0x996d7b03d1537524bb20273713385c23944ff2ec",
    },
    gnosis: {
        mxnusd: "0xada8c0eaba7ad722f4b5555b216f8f11a81593d8",
    },
    binance: {
        mxnusd: "0xada8c0eaba7ad722f4b5555b216f8f11a81593d8",
    },
    goerli: {
        mxnusd: "0xada8c0eaba7ad722f4b5555b216f8f11a81593d8",
    },
    sepolia: {
        mxnusd: "0xada8c0eaba7ad722f4b5555b216f8f11a81593d8",
    },
};

module.exports = {
    LADAO_MULTISIGS,
    ASSETS,
    ORACLE_CONTRACTS,
    CONTRACT_DEPLOYER_FACTORY,
    TLATLALIANI_CONTRACTS,
    PYTH_MXN_USD_FEED_ID,
};
