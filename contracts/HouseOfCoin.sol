// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

/**
* @title The house Of coin minting contract.
* @author daigaro.eth
* @notice  Allows users with acceptable reserves to mint backedAsset.
* @notice  Allows user to burn their minted asset to release their reserve.
* @dev  Contracts are split into state and functionality.
*/

import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "./interfaces/IERC20Extension.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "./interfaces/IAssetsAccountant.sol";
import "contracts/interfaces/IAssetsAccountantState.Sol";
import "./interfaces/IHouseOfReserveState.sol";
import "redstone-evm-connector/lib/contracts/message-based/PriceAware.sol";

import "hardhat/console.sol";

contract HouseOfCoinState {

    // HouseOfCoinMinting Events
    /**
    * @dev Log when a user is mints coin.
    * @param user Address of user that minted coin.
    * @param backedtokenID Token Id number of asset in {AssetsAccountant}.
    * @param amount minted.
    */
    event CoinMinted(address indexed user, uint indexed backedtokenID, uint amount);

    /**
    * @dev Log when a user paybacks minted coin.
    * @param user Address of user that minted coin.
    * @param backedtokenID Token Id number of asset in {AssetsAccountant}.
    * @param amount payback.
    */
    event CoinPayback(address indexed user, uint indexed backedtokenID, uint amount);

    /**
    * @dev Log when a user is in the danger zone of being liquidated.
    * @param user Address of user that is on margin call. 
    * @param mintedAsset ERC20 address of user's token debt on margin call.
    * @param reserveAsset ERC20 address of user's backing collateral.
    */
    event MarginCall(address indexed user, adddress indexed mintedAsset, address indexed reserveAsset);

    /**
    * @dev Log when a user is liquidated.
    * @param userLiquidated Address of user that is being liquidated.
    * @param liquidator Address of user that liquidates.
    * @param amount payback.
    */
    event Liquidation(address indexed userLiquidated, adddress indexed liquidator, uint amount);

    struct LiquidationParameters{
      uint64 globalBase;
      uint64 marginCallThreshold;
      uint64 liquidationThreshold;
      uint64 liquidationPricePenaltyDiscount;
      uint64 collateralPenalty;
    }

    bytes32 public constant HOUSE_TYPE = keccak256("COIN_HOUSE");

    address public backedAsset;

    uint internal backedAssetDecimals;

    address public assetsAccountant;

    LiquidationParameters public liqParam;
}

contract HouseOfCoin is Initializable, AccessControl, PriceAware, HouseOfCoinState {
    
    /**
    * @dev Initializes this contract by setting:
    * @param _backedAsset ERC20 address of the asset type of coin to be minted in this contract.
    * @param _assetsAccountant Address of the {AssetsAccountant} contract.
    */
    function initialize(
        address _backedAsset,
        address _assetsAccountant
    ) public initializer() 
    {
        backedAsset = _backedAsset;
        backedAssetDecimals = IERC20Extension(backedAsset).decimals();
        assetsAccountant = _assetsAccountant;

        // Defines all LiquidationParameters as base 100 decimal numbers.
        liqParam.globalBase = 100;
        // Margin call when health ratio = 1 or below. This means maxMintPower = mintedDebt, accounting the collateralization factors.
        liqParam.marginCallThreshold = 100;
        // Liquidation starts health ratio = 0.95 or below. 
        liqParam.liquidationThreshold = 95;
        // User's unhealthy position sells collateral at penalty discount of 10%, bring them back to a good HealthRatio.
        liqParam.liquidationPricePenaltyDiscount = 10;
        // Percentage amount of unhealthy user's collateral that will be sold to bring user's to good HealthRatio.
        liqParam.collateralPenalty = 75;

        // Internal function that will transform liqParam, compatible with backedAsset decimals
        _transformToBackAssetDecimalBase();

        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    /**
    * @notice  Function to mint ERC20 'backedAsset' of this HouseOfCoin.
    * @dev  Requires user to have reserves for this backed asset at HouseOfReserves.
    * @param reserveAsset ERC20 address of asset to be used to back the minted coins.
    * @param houseOfReserve Address of the {HouseOfReserves} contract that manages the 'reserveAsset'.
    * @param amount To mint. 
    * Emits a {CoinMinted} event.
    */
    function mintCoin(address reserveAsset, address houseOfReserve, uint amount) public {

        IHouseOfReserveState hOfReserve = IHouseOfReserveState(houseOfReserve);
        IERC20Extension bAsset = IERC20Extension(backedAsset);

        uint reserveTokenID = hOfReserve.reserveTokenID();
        uint backedTokenID = getBackedTokenID(reserveAsset);

        // Validate reserveAsset is active with {AssetsAccountant} and check houseOfReserve inputs.
        require(
            IAssetsAccountantState(assetsAccountant).houseOfReserves(reserveTokenID) != address(0) &&
            hOfReserve.reserveAsset() == reserveAsset,
            "Not valid reserveAsset!"
        );

        // Validate this HouseOfCoin is active with {AssetsAccountant} and can mint backedAsset.
        require(bAsset.hasRole(keccak256("MINTER_ROLE"), address(this)), "houseOfCoin not authorized to mint backedAsset!" );

        // Get inputs for checking minting power, collateralization factor and oracle price
        IHouseOfReserveState.Factor memory collatRatio = hOfReserve.collateralRatio();
        uint price = redstoneGetLastPrice();

        // Checks minting power of msg.sender.
        uint mintingPower = _checkRemainingMintingPower(
            msg.sender,
            reserveTokenID,
            backedTokenID,
            collatRatio,
            price
        );
        require(
            mintingPower > 0 &&
            mintingPower >= amount,
             "No reserves to mint amount!"
        );

        // Update state in AssetAccountant
        IAssetsAccountant(assetsAccountant).mint(
            msg.sender,
            backedTokenID,
            amount,
            ""
        );

        // Mint backedAsset Coins
        bAsset.mint(msg.sender, amount);

        // Emit Event
        emit CoinMinted(msg.sender, backedTokenID, amount);
    }

    /**
    * @notice  Function to payback ERC20 'backedAsset' of this HouseOfCoin.
    * @dev Requires knowledge of the reserve asset used to back the minted coins.
    * @param _backedTokenID Token Id in {AssetsAccountant}, releases the reserve asset used in 'getTokenID'.
    * @param amount To payback. 
    * Emits a {CoinPayback} event.
    */
    function paybackCoin(uint _backedTokenID, uint amount) public {

        IAssetsAccountant accountant = IAssetsAccountant(assetsAccountant);
        IERC20Extension bAsset = IERC20Extension(backedAsset);

        uint userTokenIDBal = accountant.balanceOf(msg.sender, _backedTokenID);

        // Check in {AssetsAccountant} that msg.sender backedAsset was created with assets '_backedTokenID'
        require(userTokenIDBal >= 0, "No _backedTokenID balance!");

        // Check that amount is less than '_backedTokenID' in {Assetsaccountant}
        require(userTokenIDBal >= amount, "amount >  _backedTokenID balance!");

        // Check that msg.sender has the intended backed ERC20 asset.
        require(bAsset.balanceOf(msg.sender) >= amount, "No ERC20 allowance!");

        // Burn amount of ERC20 tokens paybacked.
        bAsset.burn(msg.sender, amount);

        // Burn amount of _backedTokenID in {AssetsAccountant}
        accountant.burn(msg.sender, _backedTokenID, amount);

        emit CoinPayback(msg.sender, _backedTokenID, amount);
    }

    /**
    * @dev Called to liquidate a user or publish margin call event.
    * @param userToLiquidate address to liquidate.
    * @param reserveAsset the reserve asset address user is using to back debt.
    */
    function liquidateUser(address userToLiquidate, address reserveAsset) external {
        // Get all the required inputs.
        IAssetsAccountantState accountant = IAssetsAccountantState(assetsAccountant);
        uint reserveTokenID = accountant.reservesIds(reserveAsset, backedAsset);
        uint backedTokenID = getBackedTokenID(reserveAsset);

        (uint reserveBal, uint mintedCoinBal) =  _checkBalances(
            userToLiquidate,
            reserveTokenID,
            backedTokenID
        );
        require(mintedCoinBal > 0 && reserveBal > 0, "No balance!");

        address hOfReserveAddr = accountant.houseOfReserves(reserveTokenID);
        IHouseOfReserveState hOfReserve = IHouseOfReserveState(hOfReserveAddr);

        IHouseOfReserveState.Factor memory collatRatio = hOfReserve.collateralRatio();

        uint latestPrice = redstoneGetLastPrice();

        uint reserveAssetDecimals = IERC20Extension(reserveAsset).decimals();

        // Get health ratio
        uint healthRatio = _computeUserHealthRatio(
            reserveBal,
            mintedCoinBal,
            collatRatio,
            latestPrice
        );

        // User on marginCall
        if(healthRatio <= liqParam.marginCallThreshold) {
            emit MarginCall(userToLiquidate, backedAsset, reserveAsset);
            // User at liquidation level
            if(healthRatio <= liqParam.liquidationThreshold) {
                // check liquidator ERC20 approval
                (uint approvalReqAmount, uint collateralAtPenalty) = _computeCostOfLiquidation(reserveBal, latestPrice, reserveAssetDecimals);
                require(
                    IERC20Extension(reserveAsset).allowance(msg.sender, address(this)) >= approvalReqAmount,
                    "No allowance!"
                );

                _executeLiquidation(userToLiquidate);
            }
        } else {
            revert("Not liquidatable!")
        }
    }

    /**
    * @notice  Function to get the health ratio of user.
    * @param user address.
    * @param reserveAsset address being used as collateral. 
    */
    function computeUserHealthRatio(
        address user,
        address reserveAsset
    ) public view returns(uint){
        // Get all the required inputs.
        IAssetsAccountantState accountant = IAssetsAccountantState(assetsAccountant);
        uint reserveTokenID = accountant.reservesIds(reserveAsset, backedAsset);
        uint backedTokenID = getBackedTokenID(reserveAsset);

        (uint reserveBal, uint mintedCoinBal) =  _checkBalances(
            userToLiquidate,
            reserveTokenID,
            backedTokenID
        );
        require(mintedCoinBal > 0 && reserveBal > 0, "No balance!");

        address hOfReserveAddr = accountant.houseOfReserves(reserveTokenID);
        IHouseOfReserveState hOfReserve = IHouseOfReserveState(hOfReserveAddr);

        IHouseOfReserveState.Factor memory collatRatio = hOfReserve.collateralRatio();

        uint latestPrice = redstoneGetLastPrice();

        return _computeUserHealthRatio(
            reserveBal,
            mintedCoinBal,
            collatRatio,
            latestPrice
        );
    }

    /**
    * @notice  Function to get the theoretical cost of liquidating a user.
    * @param user address.
    * @param reserveAsset address being used as collateral. 
    */
    function computeCostOfLiquidation(
        address user,
        address reserveAsset
    ) public view returns(uint, uint){

        // Get all the required inputs.
        IAssetsAccountantState accountant = IAssetsAccountantState(assetsAccountant);
        uint reserveTokenID = accountant.reservesIds(reserveAsset, backedAsset);
        uint backedTokenID = getBackedTokenID(reserveAsset);

        (uint reserveBal,) =  _checkBalances(
            user,
            reserveTokenID,
            backedTokenID
        );

        require(mintedCoinBal > 0 && reserveBal > 0, "No balance!");

        uint latestPrice = redstoneGetLastPrice();

        uint reserveAssetDecimals = IERC20Extension(reserveAsset).decimals();

        (uint costAmount, uint collateralAtPenalty) = _computeCostOfLiquidation(
            reserveBal,
            latestPrice,
            reserveAssetDecimals
        );

        return (costAmount, collateralAtPenalty);
    }

    /**
    *
    * @dev  Get backedTokenID to be used in {AssetsAccountant}
    * @param _reserveAsset ERC20 address of the reserve asset used to back coin.
    */
    function getBackedTokenID(address _reserveAsset) public view returns(uint) {
        return uint(keccak256(abi.encodePacked(_reserveAsset, backedAsset, "backedAsset")));
    }

    /**
    * @dev Function to call redstone oracle price.
    * @dev Must be called according to 'redstone-evm-connector' documentation.
    */
    function redstoneGetLastPrice() public view returns (uint) {
        uint usdfiat = getPriceFromMsg(bytes32("MXNUSD=X"));
        uint usdeth = getPriceFromMsg(bytes32("ETH"));
        require(usdfiat != 0 && usdeth != 0, "oracle return zero!");
        uint fiateth = (usdeth * 1e8) / usdfiat;
        return fiateth;
    }

    /**
    * @notice  External function that returns the amount of backed asset coins user can mint with unused reserve asset.
    * @param user to check minting power.
    * @param reserveAsset Address of reserve asset.
    */
    function checkRemainingMintingPower(address user, address reserveAsset) external view returns(uint) {

        // Get all required inputs
        IAssetsAccountantState accountant = IAssetsAccountantState(assetsAccountant);

        uint reserveTokenID = accountant.reservesIds(reserveAsset, backedAsset);

        uint backedTokenID = getBackedTokenID(reserveAsset);

        address hOfReserveAddr = accountant.houseOfReserves(reserveTokenID);

        IHouseOfReserveState hOfReserve = IHouseOfReserveState(hOfReserveAddr);

        IHouseOfReserveState.Factor memory collatRatio = hOfReserve.collateralRatio();

        uint latestPrice = redstoneGetLastPrice();

        return _checkRemainingMintingPower(
            user,
            reserveTokenID,
            backedTokenID,
            collatRatio,
            latestPrice
        );
    }

    /// Internal Functions

    /**
    * @dev  Internal function to query balances in {AssetsAccountant}
    */
    function _checkBalances(
        address user,
        uint _reservesTokenID,
        uint _bAssetRTokenID
    ) internal view returns (uint reserveBal, uint mintedCoinBal) {
        reserveBal = IERC1155(assetsAccountant).balanceOf(user, _reservesTokenID);
        mintedCoinBal = IERC1155(assetsAccountant).balanceOf(user, _bAssetRTokenID);
    }

    /**
    * @dev  Internal function to check user's remaining minting power.
    */
    function _checkRemainingMintingPower(
        address user,
        uint reserveTokenID,
        uint backedTokenID,
        IHouseOfReserveState.Factor memory collatRatio,
        uint price
    ) public view returns(uint) {

        // Need balances for tokenIDs of both reserves and backed asset in {AssetsAccountant}
        (uint reserveBal, uint mintedCoinBal) =  _checkBalances(
            user,
            reserveTokenID,
            backedTokenID
        );

        // Check if msg.sender has reserves
        if (reserveBal == 0) {
            // If msg.sender has NO reserves, minting power = 0.
            return 0;
        } else {
            // Check if user can mint more
            (bool canMintMore, uint remainingMintingPower) = _checkIfUserCanMintMore(
                reserveBal,
                mintedCoinBal,
                collatRatio,
                price
            );
            if(canMintMore) {
                // If msg.sender canMintMore, how much
                return remainingMintingPower;
            } else {
                return 0;
            }
        }
    }

    /**
    * @dev  Internal function to check if user can mint more coin.
    */
    function _checkIfUserCanMintMore(
        uint reserveBal,
        uint mintedCoinBal,
        IHouseOfReserveState.Factor memory collatRatio,
        uint price
    ) internal pure returns (bool canMintMore, uint remainingMintingPower) {

        uint reserveBalreducedByFactor =
            ( reserveBal * collatRatio.denominator) / collatRatio.numerator;
            
        uint maxMintableAmount =
            (reserveBalreducedByFactor * price) / 1e8;

        canMintMore = mintedCoinBal > maxMintableAmount? false : true;

        remainingMintingPower = canMintMore ? (maxMintableAmount - mintedCoinBal) : 0;
    }

    /**
    * @dev  Internal function that transforms liqParams to backedAsset decimal base.
    */
    function _transformToBackAssetDecimalBase() internal {
        require(backedAssetDecimals > 0, "No backedAsset decimals!");
        require(
            liqParam.globalBase > 0 &&
            liqParam.marginCallThreshold > 0 &&
            liqParam.liquidationThreshold > 0 &&
            liqParam.liquidationPricePenaltyDiscount > 0 &&
            liqParam.collateralPenalty > 0,
            "Empty liqParam!"
        );

        LiquidationParameters memory _liqParamTemp;

        _liqParamTemp.globalBase = 10 ** backedAssetDecimals;
        _liqParamTemp.marginCallThreshold = liqParam.marginCallThreshold * _liqParamTemp.globalBase / liqParam.globalBase; 
        _liqParamTemp.liquidationThreshold = liqParam.liquidationThreshold * _liqParamTemp.globalBase / liqParam.globalBase;
        _liqParamTemp.liquidationPricePenaltyDiscount = liqParam.liquidationPricePenaltyDiscount * _liqParamTemp.globalBase / liqParam.globalBase;
        _liqParamTemp.collateralPenalty = liqParam.collateralPenalty * _liqParamTemp.globalBase / liqParam.globalBase;

        liqParam = _liqParamTemp;
    }

    function _computeUserHealthRatio(
        uint reserveBal,
        uint mintedCoinBal,
        IHouseOfReserveState.Factor memory collatRatio,
        uint price
    ) internal returns(uint healthRatio) {
        // Check current maxMintableAmount with current price
        uint reserveBalreducedByFactor =
            (reserveBal * collatRatio.denominator) / collatRatio.numerator;
            
        uint maxMintableAmount =
            (reserveBalreducedByFactor * price) / 1e8;

        // ompute health ratio
        healthRatio = maxMintableAmount * backedAssetDecimals / mintedCoinBal;
    }

    function _computeCostOfLiquidation(
        uint reserveBal,
        uint price,
        uint reserveAssetDecimals
    ) internal view returns(uint costamount, uint collateralAtPenalty){
        uint liqDiscountedPrice = price * liqParam.liquidationPricePenaltyDiscount / liqParam.globalBase;

        collateralAtPenalty = reserveBal * liqParam.collateralPenalty / liqParam.globalBase;

        uint amountTemp = collateralAtPenalty * liqDiscountedPrice / 10 ** 8;

        uint decimalDiff;

        if(reserveAssetDecimals > backedAssetDecimals) {
            decimalDiff = reserveAssetDecimals - backedAssetDecimals;
            amountTemp = amountTemp / 10 ** decimalDiff;
        } else {
            decimalDiff = backedAssetDecimals - reserveAssetDecimals;
            amountTemp = amountTemp * 10 ** decimalDiff;
        }

        costamount = amountTemp
    }

    function _executeLiquidation(address user) internal {
        // Substract user's collateral penalty balance
        // burn the received tokens.

    }
}