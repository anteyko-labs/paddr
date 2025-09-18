// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";

/**
 * @title TierCalculatorV2
 * @dev Upgradeable Tier Calculator with proxy support
 * @notice Calculates staking tiers based on duration
 */
contract TierCalculatorV2 is Initializable, UUPSUpgradeable, AccessControlUpgradeable {
    
    // Tier configuration
    struct TierConfig {
        uint256 minDuration;
        uint256 maxDuration;
        uint8 tier;
    }
    
    TierConfig[] public tierConfigs;
    
    // Events
    event TierConfigUpdated(uint8 indexed tier, uint256 minDuration, uint256 maxDuration);
    event TierConfigAdded(uint8 indexed tier, uint256 minDuration, uint256 maxDuration);
    
    // Errors
    error InvalidDuration(uint256 duration);
    error InvalidTier(uint8 tier);
    
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }
    
    /**
     * @dev Initialize the tier calculator
     */
    function initialize() public initializer {
        __UUPSUpgradeable_init();
        __AccessControl_init();
        
        // Set up roles
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        
        // Initialize default tier configurations
        _initializeDefaultTiers();
    }
    
    /**
     * @dev Initialize default tier configurations
     */
    function _initializeDefaultTiers() internal {
        // Bronze: 1 month (30 days)
        tierConfigs.push(TierConfig({
            minDuration: 30 * 24 * 60 * 60, // 30 days in seconds
            maxDuration: 89 * 24 * 60 * 60, // 89 days in seconds
            tier: 0
        }));
        
        // Silver: 3 months (90 days)
        tierConfigs.push(TierConfig({
            minDuration: 90 * 24 * 60 * 60, // 90 days in seconds
            maxDuration: 179 * 24 * 60 * 60, // 179 days in seconds
            tier: 1
        }));
        
        // Gold: 6 months (180 days)
        tierConfigs.push(TierConfig({
            minDuration: 180 * 24 * 60 * 60, // 180 days in seconds
            maxDuration: 364 * 24 * 60 * 60, // 364 days in seconds
            tier: 2
        }));
        
        // Platinum: 12 months (365 days)
        tierConfigs.push(TierConfig({
            minDuration: 365 * 24 * 60 * 60, // 365 days in seconds
            maxDuration: type(uint256).max, // No upper limit
            tier: 3
        }));
    }
    
    /**
     * @dev Get tier based on duration
     * @param duration Duration in seconds
     * @return tier Tier level (0-3)
     */
    function getTier(uint256 duration) external view returns (uint8) {
        for (uint256 i = 0; i < tierConfigs.length; i++) {
            TierConfig memory config = tierConfigs[i];
            if (duration >= config.minDuration && duration <= config.maxDuration) {
                return config.tier;
            }
        }
        revert InvalidDuration(duration);
    }
    
    /**
     * @dev Get tier configuration
     * @param tier Tier level (0-3)
     * @return minDuration Minimum duration for tier
     * @return maxDuration Maximum duration for tier
     */
    function getTierConfig(uint8 tier) external view returns (uint256 minDuration, uint256 maxDuration) {
        if (tier >= tierConfigs.length) {
            revert InvalidTier(tier);
        }
        
        TierConfig memory config = tierConfigs[tier];
        return (config.minDuration, config.maxDuration);
    }
    
    /**
     * @dev Update tier configuration
     * @param tier Tier level to update
     * @param minDuration New minimum duration
     * @param maxDuration New maximum duration
     */
    function updateTierConfig(uint8 tier, uint256 minDuration, uint256 maxDuration) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (tier >= tierConfigs.length) {
            revert InvalidTier(tier);
        }
        
        tierConfigs[tier] = TierConfig({
            minDuration: minDuration,
            maxDuration: maxDuration,
            tier: tier
        });
        
        emit TierConfigUpdated(tier, minDuration, maxDuration);
    }
    
    /**
     * @dev Add new tier configuration
     * @param minDuration Minimum duration for tier
     * @param maxDuration Maximum duration for tier
     * @return tier New tier level
     */
    function addTierConfig(uint256 minDuration, uint256 maxDuration) external onlyRole(DEFAULT_ADMIN_ROLE) returns (uint8) {
        uint8 newTier = uint8(tierConfigs.length);
        
        tierConfigs.push(TierConfig({
            minDuration: minDuration,
            maxDuration: maxDuration,
            tier: newTier
        }));
        
        emit TierConfigAdded(newTier, minDuration, maxDuration);
        return newTier;
    }
    
    /**
     * @dev Get total number of tiers
     * @return count Number of tier configurations
     */
    function getTierCount() external view returns (uint256) {
        return tierConfigs.length;
    }
    
    /**
     * @dev Authorize upgrade (only admin)
     */
    function _authorizeUpgrade(address newImplementation) internal override onlyRole(DEFAULT_ADMIN_ROLE) {
        // Only admin can authorize upgrades
    }
    
    /**
     * @dev Get version
     */
    function version() external pure returns (string memory) {
        return "2.0.0";
    }
}
