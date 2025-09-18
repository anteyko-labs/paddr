// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20PermitUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

/**
 * @title PADTokenV2
 * @dev Upgradeable PAD Token with proxy support
 * @notice BEP-20 compatible token with upgradeability
 */
contract PADTokenV2 is Initializable, ERC20Upgradeable, ERC20PermitUpgradeable, PausableUpgradeable, AccessControlUpgradeable, UUPSUpgradeable {
    
    // Roles
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    
    // State variables
    address public gnosisSafe;
    uint256 public cooldownPeriod;
    mapping(address => uint256) public cooldowns;
    
    // Events
    event GnosisSafeUpdated(address indexed oldSafe, address indexed newSafe);
    event CooldownPeriodUpdated(uint256 oldPeriod, uint256 newPeriod);
    event CooldownSet(address indexed account, uint256 cooldown);
    
    // Errors
    error CooldownNotExpired(address account, uint256 cooldown);
    
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }
    
    /**
     * @dev Initialize the token
     * @param initialSupply Initial token supply (1 billion tokens)
     */
    function initialize(uint256 initialSupply) public initializer {
        __ERC20_init("PAD Token", "PAD");
        __ERC20Permit_init("PAD Token");
        __Pausable_init();
        __AccessControl_init();
        __UUPSUpgradeable_init();
        
        // Set up roles
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        
        // Mint initial supply
        _mint(msg.sender, initialSupply);
        
        // Set default cooldown period (24 hours)
        cooldownPeriod = 24 * 60 * 60;
    }
    
    /**
     * @dev Pause token transfers
     */
    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }
    
    /**
     * @dev Unpause token transfers
     */
    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }
    
    /**
     * @dev Set Gnosis Safe address
     */
    function setGnosisSafe(address _gnosisSafe) external onlyRole(DEFAULT_ADMIN_ROLE) {
        address oldSafe = gnosisSafe;
        gnosisSafe = _gnosisSafe;
        emit GnosisSafeUpdated(oldSafe, _gnosisSafe);
    }
    
    /**
     * @dev Set cooldown period
     */
    function setCooldownPeriod(uint256 _cooldownPeriod) external onlyRole(DEFAULT_ADMIN_ROLE) {
        uint256 oldPeriod = cooldownPeriod;
        cooldownPeriod = _cooldownPeriod;
        emit CooldownPeriodUpdated(oldPeriod, _cooldownPeriod);
    }
    
    /**
     * @dev Set cooldown for an account
     */
    function setCooldown(address account, uint256 cooldown) external onlyRole(DEFAULT_ADMIN_ROLE) {
        cooldowns[account] = cooldown;
        emit CooldownSet(account, cooldown);
    }
    
    /**
     * @dev Batch transfer function
     */
    function batchTransfer(address[] calldata recipients, uint256[] calldata amounts) external {
        require(recipients.length == amounts.length, "Arrays length mismatch");
        
        for (uint256 i = 0; i < recipients.length; i++) {
            _transfer(msg.sender, recipients[i], amounts[i]);
        }
    }
    
    /**
     * @dev Override transfer to check cooldown
     */
    function _update(address from, address to, uint256 value) internal override virtual {
        // Check cooldown for transfers (except minting and burning)
        if (from != address(0) && to != address(0)) {
            if (cooldowns[from] > block.timestamp) {
                revert CooldownNotExpired(from, cooldowns[from]);
            }
        }
        
        super._update(from, to, value);
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
    function version() external pure virtual returns (string memory) {
        return "2.0.0";
    }
}
