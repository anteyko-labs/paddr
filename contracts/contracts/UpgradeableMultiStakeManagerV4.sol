// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./UpgradeableMultiStakeManagerV3.sol";

/**
 * @title UpgradeableMultiStakeManagerV4
 * @dev Version 4 with additional features
 * @notice Adds emergency functions, statistics, and enhanced blacklist management
 */
contract UpgradeableMultiStakeManagerV4 is UpgradeableMultiStakeManagerV3 {
    
    // New state variables
    uint256 public totalStakedAmount;
    uint256 public totalPositionsCreated;
    uint256 public emergencyPauseTimestamp;
    bool public emergencyPaused;
    
    // New events
    event EmergencyPaused(address indexed admin, uint256 timestamp);
    event EmergencyUnpaused(address indexed admin, uint256 timestamp);
    event StatisticsUpdated(uint256 totalStaked, uint256 totalPositions);
    
    // New errors
    error ContractEmergencyPaused();
    error NotEmergencyPaused();
    
    /**
     * @dev Initialize V4 - only callable once
     */
    function initializeV4() external reinitializer(4) {
        // V4 initialization
        totalStakedAmount = 0;
        totalPositionsCreated = 0;
        emergencyPaused = false;
    }
    
    /**
     * @dev Emergency pause function (Admin only)
     */
    function emergencyPause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(!emergencyPaused, "Already paused");
        emergencyPaused = true;
        emergencyPauseTimestamp = block.timestamp;
        emit EmergencyPaused(msg.sender, block.timestamp);
    }
    
    /**
     * @dev Emergency unpause function (Admin only)
     */
    function emergencyUnpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(emergencyPaused, "Not paused");
        emergencyPaused = false;
        emit EmergencyUnpaused(msg.sender, block.timestamp);
    }
    
    /**
     * @dev Enhanced createPosition with emergency check and statistics
     */
    function createPosition(
        uint256 amount,
        uint256 duration
    ) external override notBlacklisted(msg.sender) {
        if (emergencyPaused) {
            revert ContractEmergencyPaused();
        }
        
        // Call parent function logic (copy from V3)
        require(amount > 0, "Amount must be greater than 0");
        require(duration > 0, "Duration must be greater than 0");
        
        // Определяем тир на основе длительности
        uint8 tier = uint8(tierCalculator.getTier(duration));
        
        // Проверяем минимальную сумму для тира
        require(amount >= tierMinAmounts[tier], "Amount below minimum for tier");
        
        // Переводим токены на контракт
        require(stakingToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        
        // Создаем позицию
        uint256 positionId = nextPositionId++;
        positions[positionId] = StakingPosition({
            id: positionId,
            owner: msg.sender,
            amount: amount,
            startTime: block.timestamp,
            duration: duration,
            tier: tier,
            isActive: true,
            lastClaimTime: 0,
            totalClaimed: 0,
            nextMintAt: block.timestamp + (30 * 24 * 60 * 60), // 30 дней
            monthIndex: 0
        });
        
        userPositions[msg.sender].push(positionId);
        
        emit PositionCreated(positionId, msg.sender, amount, tier);
        
        // Update statistics
        totalStakedAmount += amount;
        totalPositionsCreated++;
        
        emit StatisticsUpdated(totalStakedAmount, totalPositionsCreated);
    }
    
    /**
     * @dev Get contract statistics
     */
    function getStatistics() external view returns (
        uint256 _totalStakedAmount,
        uint256 _totalPositionsCreated,
        bool _emergencyPaused,
        uint256 _emergencyPauseTimestamp
    ) {
        return (
            totalStakedAmount,
            totalPositionsCreated,
            emergencyPaused,
            emergencyPauseTimestamp
        );
    }
    
    /**
     * @dev Enhanced blacklist with reason tracking
     */
    mapping(address => string) private blacklistReasons;
    
    event AddressBlacklistedWithReason(address indexed account, address indexed admin, string reason);
    
    function addToBlacklistWithReason(address account, string memory reason) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(account != address(0), "Cannot blacklist zero address");
        
        // Check if already blacklisted using public function
        bool isAlreadyBlacklisted = this.isBlacklisted(account);
        require(!isAlreadyBlacklisted, "Address already blacklisted");
        
        // Add to blacklist using parent function
        this.addToBlacklist(account);
        blacklistReasons[account] = reason;
        emit AddressBlacklistedWithReason(account, msg.sender, reason);
    }
    
    function getBlacklistReason(address account) external view returns (string memory) {
        return blacklistReasons[account];
    }
    
    /**
     * @dev Batch operations with gas optimization
     */
    function batchAddToBlacklistWithReasons(
        address[] calldata accounts,
        string[] calldata reasons
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(accounts.length == reasons.length, "Arrays length mismatch");
        
        for (uint256 i = 0; i < accounts.length; i++) {
            address account = accounts[i];
            if (account != address(0)) {
                bool isAlreadyBlacklisted = this.isBlacklisted(account);
                if (!isAlreadyBlacklisted) {
                    this.addToBlacklist(account);
                    blacklistReasons[account] = reasons[i];
                    emit AddressBlacklistedWithReason(account, msg.sender, reasons[i]);
                }
            }
        }
    }
    
    /**
     * @dev Get version of the contract
     */
    function version() external pure override returns (string memory) {
        return "4.0.0";
    }
}
