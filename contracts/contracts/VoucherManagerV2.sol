// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";

/**
 * @title VoucherManagerV2
 * @dev Upgradeable Voucher Manager with proxy support
 * @notice Manages vouchers for staking rewards
 */
contract VoucherManagerV2 is Initializable, AccessControlUpgradeable, UUPSUpgradeable, ReentrancyGuardUpgradeable {
    
    // Voucher structure
    struct Voucher {
        uint256 id;
        string name;
        string description;
        uint256 value;
        string tier;
        string type_;
        uint256 maxUses;
        uint256 currentUses;
        bool isActive;
        address creator;
        uint256 createdAt;
    }
    
    // State variables
    mapping(uint256 => Voucher) public vouchers;
    mapping(address => uint256[]) public userVouchers;
    mapping(string => uint256) public qrCodeToVoucherId;
    uint256 public nextVoucherId;
    
    // Events
    event VoucherCreated(uint256 indexed voucherId, address indexed creator, string name);
    event VoucherUsed(uint256 indexed voucherId, address indexed user, uint256 remainingUses);
    event VoucherDeactivated(uint256 indexed voucherId, address indexed admin);
    event QRCodeUpdated(uint256 indexed voucherId, string qrCode);
    
    // Errors
    error VoucherNotFound(uint256 voucherId);
    error VoucherInactive(uint256 voucherId);
    error VoucherExhausted(uint256 voucherId);
    error InvalidQRCode(string qrCode);
    error Unauthorized();
    
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }
    
    /**
     * @dev Initialize the voucher manager
     */
    function initialize() public initializer {
        __AccessControl_init();
        __UUPSUpgradeable_init();
        __ReentrancyGuard_init();
        
        // Set up roles
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        
        // Start voucher ID from 1
        nextVoucherId = 1;
    }
    
    /**
     * @dev Create a new voucher
     */
    function createVoucher(
        string memory name,
        string memory description,
        uint256 value,
        string memory tier,
        string memory type_,
        uint256 maxUses,
        string memory qrCode
    ) external onlyRole(DEFAULT_ADMIN_ROLE) returns (uint256) {
        uint256 voucherId = nextVoucherId++;
        
        vouchers[voucherId] = Voucher({
            id: voucherId,
            name: name,
            description: description,
            value: value,
            tier: tier,
            type_: type_,
            maxUses: maxUses,
            currentUses: 0,
            isActive: true,
            creator: msg.sender,
            createdAt: block.timestamp
        });
        
        if (bytes(qrCode).length > 0) {
            qrCodeToVoucherId[qrCode] = voucherId;
            emit QRCodeUpdated(voucherId, qrCode);
        }
        
        emit VoucherCreated(voucherId, msg.sender, name);
        return voucherId;
    }
    
    /**
     * @dev Use a voucher
     */
    function useVoucher(uint256 voucherId) external nonReentrant {
        Voucher storage voucher = vouchers[voucherId];
        
        if (voucher.id == 0) {
            revert VoucherNotFound(voucherId);
        }
        
        if (!voucher.isActive) {
            revert VoucherInactive(voucherId);
        }
        
        if (voucher.currentUses >= voucher.maxUses) {
            revert VoucherExhausted(voucherId);
        }
        
        voucher.currentUses++;
        userVouchers[msg.sender].push(voucherId);
        
        emit VoucherUsed(voucherId, msg.sender, voucher.maxUses - voucher.currentUses);
    }
    
    /**
     * @dev Use voucher by QR code
     */
    function useVoucherByQRCode(string memory qrCode) external nonReentrant {
        uint256 voucherId = qrCodeToVoucherId[qrCode];
        
        if (voucherId == 0) {
            revert InvalidQRCode(qrCode);
        }
        
        // Use voucher directly (copy logic from useVoucher)
        Voucher storage voucher = vouchers[voucherId];
        
        if (voucher.id == 0) {
            revert VoucherNotFound(voucherId);
        }
        
        if (!voucher.isActive) {
            revert VoucherInactive(voucherId);
        }
        
        if (voucher.currentUses >= voucher.maxUses) {
            revert VoucherExhausted(voucherId);
        }
        
        voucher.currentUses++;
        userVouchers[msg.sender].push(voucherId);
        
        emit VoucherUsed(voucherId, msg.sender, voucher.maxUses - voucher.currentUses);
    }
    
    /**
     * @dev Deactivate a voucher
     */
    function deactivateVoucher(uint256 voucherId) external onlyRole(DEFAULT_ADMIN_ROLE) {
        Voucher storage voucher = vouchers[voucherId];
        
        if (voucher.id == 0) {
            revert VoucherNotFound(voucherId);
        }
        
        voucher.isActive = false;
        emit VoucherDeactivated(voucherId, msg.sender);
    }
    
    /**
     * @dev Get voucher details
     */
    function getVoucher(uint256 voucherId) external view returns (Voucher memory) {
        if (vouchers[voucherId].id == 0) {
            revert VoucherNotFound(voucherId);
        }
        return vouchers[voucherId];
    }
    
    /**
     * @dev Get user vouchers
     */
    function getUserVouchers(address user) external view returns (uint256[] memory) {
        return userVouchers[user];
    }
    
    /**
     * @dev Get voucher by QR code
     */
    function getVoucherByQRCode(string memory qrCode) external view returns (Voucher memory) {
        uint256 voucherId = qrCodeToVoucherId[qrCode];
        
        if (voucherId == 0) {
            revert InvalidQRCode(qrCode);
        }
        
        return vouchers[voucherId];
    }
    
    /**
     * @dev Check if voucher is valid
     */
    function isVoucherValid(uint256 voucherId) external view returns (bool) {
        Voucher memory voucher = vouchers[voucherId];
        return voucher.id != 0 && voucher.isActive && voucher.currentUses < voucher.maxUses;
    }
    
    /**
     * @dev Get total number of vouchers
     */
    function getTotalVouchers() external view returns (uint256) {
        return nextVoucherId - 1;
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
