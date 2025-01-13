const {NETWORK, setDeploymentsPath, setPublishPath, publishUpdates} = require("../utils");
const {VERSION} = require("./utils_base");

const {deployXocolatl} = require("../tasks/deployXocolatl");
const {handOverDefaultAdmin} = require("../tasks/rolesHandOver");

const deployBackedAsset = async () => {
    console.log("\n\n 📡 Deploying...\n");
    const xoc = await deployXocolatl();
    await handOverDefaultAdmin(xoc);
};

const main = async () => {
    if (NETWORK !== "base") {
        throw new Error("Set 'NETWORK=base' in .env file");
    }
    await setDeploymentsPath(VERSION);
    await setPublishPath(VERSION);
    await deployBackedAsset();
    await publishUpdates();
};

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(`\n${error}\n`);
        process.exit(1);
    });
