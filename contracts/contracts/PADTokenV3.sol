// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./PADTokenV2.sol";

/**
 * @title PADTokenV3
 * @dev Version 3 with Blacklist functionality for token transfers
 * @notice Adds blacklist management to prevent certain addresses from transferring tokens
 */
contract PADTokenV3 is PADTokenV2 {
    
    // Blacklist mapping
    mapping(address => bool) private _blacklisted;
    
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }
    
    // Events
    event AddressBlacklisted(address indexed account, address indexed admin);
    event AddressRemovedFromBlacklist(address indexed account, address indexed admin);
    
    // Errors
    error AddressIsBlacklisted(address account);
    
    /**
     * @dev Initialize V3
     * @custom:oz-upgrades-validate-as-initializer
     */
    function initializeV3() external reinitializer(3) {
        // V3 initialization - blacklist functionality is ready
        // Parent contracts are already initialized, no need to call their initializers
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
     * @dev Override _update to check blacklist for transfers
     */
    function _update(address from, address to, uint256 value) internal override notBlacklisted(from) notBlacklisted(to) {
        // Check cooldown for transfers (except minting and burning)
        if (from != address(0) && to != address(0)) {
            if (cooldowns[from] > block.timestamp) {
                revert CooldownNotExpired(from, cooldowns[from]);
            }
        }
        
        super._update(from, to, value);
    }
    
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
    function version() external pure override returns (string memory) {
        return "3.0.0";
    }
}
