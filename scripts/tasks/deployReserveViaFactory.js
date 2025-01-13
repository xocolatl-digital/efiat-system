const {ethers} = require("hardhat");

const deployReserveViaFactory = async (
    reserveFactory,
    oracleFactory,
    reserveAssetAddr,
    depositLimit = ethers.parseUnits("1", 18),
    maxLTV = ethers.parseUnits("0.1", 18),
    liquidationThreshold = ethers.parseUnits("0.15", 18),
    reserveMintFee = 15000,
    pricefeedAddr1 = ethers.ZeroAddress,
    pricefeedAddr2 = ethers.ZeroAddress,
    priceFeedName,
) => {
    if (pricefeedAddr1 == ethers.ZeroAddress) throw "PricefeedAddr1 is required";

    console.log("Deploying reserve via Factory for reserve asset:", reserveAssetAddr);
    console.log("PriceFeed1", pricefeedAddr1);
    console.log("PriceFeed2", pricefeedAddr2);

    let oracleAddrArg = pricefeedAddr1;
    const allowedTimeout = 234000; // Due to market closure on weekends
    if (pricefeedAddr2 !== ethers.ZeroAddress) {
        console.log("ComputedPriceFeed" + ": Deploying...");
        const computedPriceAddr = await oracleFactory.createComputedPriceFeed.staticCall(
            `computed ${priceFeedName}`,
            8,
            pricefeedAddr1,
            pricefeedAddr2,
            allowedTimeout,
        );
        const dtx1 = await oracleFactory.createComputedPriceFeed(
            `computed ${priceFeedName}`,
            8,
            pricefeedAddr1,
            pricefeedAddr2,
            allowedTimeout,
        );
        await dtx1.wait();
        console.log("ComputedPriceFeed" + ": Deployed at", computedPriceAddr);
        oracleAddrArg = computedPriceAddr;
    }
    const erc20 = await ethers.getContractAt("ERC20", reserveAssetAddr);
    const symbol = await erc20.symbol();
    const decimals = await erc20.decimals();

    if (decimals != 18n && depositLimit == ethers.parseUnits("1", 18)) depositLimit = ethers.parseUnits("1", decimals);

    console.log("HouseOfReserve" + symbol + ": Deploying...");
    const reserveAddr = await reserveFactory.deployHouseOfReserve.staticCall(
        reserveAssetAddr,
        oracleAddrArg,
        maxLTV,
        liquidationThreshold,
        depositLimit,
        reserveMintFee,
    );
    const dtx2 = await reserveFactory.deployHouseOfReserve(
        reserveAssetAddr,
        oracleAddrArg,
        maxLTV,
        liquidationThreshold,
        depositLimit,
        reserveMintFee,
    );
    await dtx2.wait();
    console.log("HouseOfReserve" + symbol + ": Deployed at", await reserveAddr);
    const reservehouse = await ethers.getContractAt("HouseOfReserve", reserveAddr);
    return reservehouse;
};

module.exports = {
    deployReserveViaFactory,
};
