// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./UpgradeableMultiStakeManagerV2.sol";

/**
 * @title UpgradeableMultiStakeManagerV3
 * @dev Version 3 with Blacklist functionality
 * @notice Adds blacklist management to prevent certain addresses from interacting with the contract
 */
contract UpgradeableMultiStakeManagerV3 is UpgradeableMultiStakeManagerV2 {
    
    // Blacklist mapping
    mapping(address => bool) private _blacklisted;
    
    // Events
    event AddressBlacklisted(address indexed account, address indexed admin);
    event AddressRemovedFromBlacklist(address indexed account, address indexed admin);
    
    // Errors
    error AddressIsBlacklisted(address account);
    
    /**
     * @dev Initialize V3 - only callable once
     */
    function initializeV3() external reinitializer(3) {
        // V3 initialization - blacklist functionality is ready
    }
    
    /**
     * @dev Check if address is blacklisted
     * @param account Address to check
     * @return bool True if blacklisted
     */
    function isBlacklisted(address account) external view returns (bool) {
        return _blacklisted[account];
    }
    
    /**
     * @dev Add address to blacklist (Admin only)
     * @param account Address to blacklist
     */
    function addToBlacklist(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(account != address(0), "Cannot blacklist zero address");
        require(!_blacklisted[account], "Address already blacklisted");
        
        _blacklisted[account] = true;
        emit AddressBlacklisted(account, msg.sender);
    }
    
    /**
     * @dev Remove address from blacklist (Admin only)
     * @param account Address to remove from blacklist
     */
    function removeFromBlacklist(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_blacklisted[account], "Address not blacklisted");
        
        _blacklisted[account] = false;
        emit AddressRemovedFromBlacklist(account, msg.sender);
    }
    
    /**
     * @dev Batch add addresses to blacklist (Admin only)
     * @param accounts Array of addresses to blacklist
     */
    function batchAddToBlacklist(address[] calldata accounts) external onlyRole(DEFAULT_ADMIN_ROLE) {
        for (uint256 i = 0; i < accounts.length; i++) {
            address account = accounts[i];
            if (account != address(0) && !_blacklisted[account]) {
                _blacklisted[account] = true;
                emit AddressBlacklisted(account, msg.sender);
            }
        }
    }
    
    /**
     * @dev Batch remove addresses from blacklist (Admin only)
     * @param accounts Array of addresses to remove from blacklist
     */
    function batchRemoveFromBlacklist(address[] calldata accounts) external onlyRole(DEFAULT_ADMIN_ROLE) {
        for (uint256 i = 0; i < accounts.length; i++) {
            address account = accounts[i];
            if (_blacklisted[account]) {
                _blacklisted[account] = false;
                emit AddressRemovedFromBlacklist(account, msg.sender);
            }
        }
    }
    
    /**
     * @dev Modifier to check if address is not blacklisted
     */
    modifier notBlacklisted(address account) {
        if (_blacklisted[account]) {
            revert AddressIsBlacklisted(account);
        }
        _;
    }
    
    /**
     * @dev Override createPosition to check blacklist
     */
    function createPosition(
        uint256 amount,
        uint256 duration
    ) external override virtual notBlacklisted(msg.sender) {
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
    }
    
    // Note: claimReward, unstake, emergencyUnstake functions will be added in future versions
    // For now, blacklist only affects createPosition function
    
    /**
     * @dev Get blacklist status for multiple addresses
     * @param accounts Array of addresses to check
     * @return statuses Array of blacklist statuses
     */
    function getBlacklistStatus(address[] calldata accounts) external view returns (bool[] memory statuses) {
        statuses = new bool[](accounts.length);
        for (uint256 i = 0; i < accounts.length; i++) {
            statuses[i] = _blacklisted[accounts[i]];
        }
    }
    
    /**
     * @dev Get version of the contract
     * @return string Version string
     */
    function version() external pure override virtual returns (string memory) {
        return "3.0.0";
    }
}
