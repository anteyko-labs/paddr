// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title VoucherManager
 * @dev Manages vouchers for staking positions
 */
contract VoucherManager is AccessControl, ReentrancyGuard {
    using Strings for uint256;

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant REDEEMER_ROLE = keccak256("REDEEMER_ROLE");

    // Voucher types
    enum VoucherType {
        SINGLE_USE,    // 0: Одноразовый
        MULTI_USE,     // 1: Многоразовый
        DURATION       // 2: На период стейкинга
    }

    struct Voucher {
        uint256 id;
        address owner;
        VoucherType voucherType;
        string name;
        string description;
        string value;
        uint256 maxUses;
        uint256 currentUses;
        uint256 expiresAt;
        bool isActive;
        string qrCode;
        uint256 positionId; // Связь с позицией стейкинга
    }

    uint256 private _nextVoucherId = 1;
    
    // Mappings
    mapping(uint256 => Voucher) public vouchers;
    mapping(address => uint256[]) public userVouchers;
    mapping(uint256 => bool) public usedVouchers; // Для одноразовых
    mapping(uint256 => uint256) public voucherUses; // Для многоразовых
    mapping(string => bool) public qrCodeUsed; // Проверка QR-кодов

    // Events
    event VoucherCreated(uint256 indexed voucherId, address indexed owner, VoucherType voucherType, string name);
    event VoucherRedeemed(uint256 indexed voucherId, address indexed redeemer, string qrCode);
    event VoucherDeactivated(uint256 indexed voucherId);
    event QRCodeGenerated(uint256 indexed voucherId, string qrCode);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(REDEEMER_ROLE, msg.sender);
    }

    /**
     * @dev Create vouchers for a staking position
     * @param owner Address of the voucher owner
     * @param positionId ID of the staking position
     * @param tier Tier level (0: Bronze, 1: Silver, 2: Gold, 3: Platinum)
     */
    function createVouchersForPosition(
        address owner,
        uint256 positionId,
        uint8 tier
    ) external onlyRole(ADMIN_ROLE) returns (uint256[] memory) {
        require(owner != address(0), "Invalid owner");
        
        uint256[] memory voucherIds;
        
        // Создаем ваучеры в зависимости от тира согласно таблице
        if (tier == 0) { // Bronze - 4 ваучера
            voucherIds = new uint256[](4);
            voucherIds[0] = _createVoucher(owner, positionId, VoucherType.SINGLE_USE, "5% Discount", "5% discount when paying for car rental with PADD-R tokens", "5%", 1, 0);
            voucherIds[1] = _createVoucher(owner, positionId, VoucherType.SINGLE_USE, "Free Rental Hour", "1 hour free rental when renting for 1 day or more", "1 hour", 1, 0);
            voucherIds[2] = _createVoucher(owner, positionId, VoucherType.SINGLE_USE, "Rental Coupon", "1x $50 car rental coupon", "$50", 1, 0);
            voucherIds[3] = _createVoucher(owner, positionId, VoucherType.DURATION, "Restaurant Discount", "10% discount at restaurant", "10%", 0, 0);
        } else if (tier == 1) { // Silver - 9 ваучеров
            voucherIds = new uint256[](9);
            voucherIds[0] = _createVoucher(owner, positionId, VoucherType.SINGLE_USE, "5% Discount", "5% discount when paying for car rental with PADD-R tokens", "5%", 1, 0);
            voucherIds[1] = _createVoucher(owner, positionId, VoucherType.SINGLE_USE, "Free Rental Hours", "2 hours free rental when renting for 1 day or more", "2 hours", 1, 0);
            voucherIds[2] = _createVoucher(owner, positionId, VoucherType.MULTI_USE, "Rental Coupons", "3x $150 car rental coupons", "$150", 3, 0);
            voucherIds[3] = _createVoucher(owner, positionId, VoucherType.DURATION, "Auto Service Discount", "15% discount at auto service", "15%", 0, 0);
            voucherIds[4] = _createVoucher(owner, positionId, VoucherType.DURATION, "Restaurant Discount", "10% discount at restaurant", "10%", 0, 0);
            voucherIds[5] = _createVoucher(owner, positionId, VoucherType.SINGLE_USE, "Car Wash", "Free car wash", "Free", 1, 0);
            voucherIds[6] = _createVoucher(owner, positionId, VoucherType.DURATION, "Priority Booking", "Priority booking for rentals", "Priority", 0, 0);
            voucherIds[7] = _createVoucher(owner, positionId, VoucherType.SINGLE_USE, "Car Upgrade", "Free car upgrade", "Upgrade", 1, 0);
            voucherIds[8] = _createVoucher(owner, positionId, VoucherType.SINGLE_USE, "Lamborghini Rental", "1 day rental of Lamborghini Huracan EVO", "1 day", 1, 0);
        } else if (tier == 2) { // Gold - 11 ваучеров
            voucherIds = new uint256[](11);
            voucherIds[0] = _createVoucher(owner, positionId, VoucherType.SINGLE_USE, "5% Discount", "5% discount when paying for car rental with PADD-R tokens", "5%", 1, 0);
            voucherIds[1] = _createVoucher(owner, positionId, VoucherType.SINGLE_USE, "Free Rental Hours", "3 hours free rental when renting for 1 day or more", "3 hours", 1, 0);
            voucherIds[2] = _createVoucher(owner, positionId, VoucherType.MULTI_USE, "Rental Coupons", "6x $600 car rental coupons", "$600", 6, 0);
            voucherIds[3] = _createVoucher(owner, positionId, VoucherType.DURATION, "Auto Service Discount", "20% discount at auto service", "20%", 0, 0);
            voucherIds[4] = _createVoucher(owner, positionId, VoucherType.DURATION, "Restaurant Discount", "15% discount at restaurant", "15%", 0, 0);
            voucherIds[5] = _createVoucher(owner, positionId, VoucherType.DURATION, "Unlimited Mileage", "Unlimited mileage on rentals", "Unlimited", 0, 0);
            voucherIds[6] = _createVoucher(owner, positionId, VoucherType.DURATION, "Premium Protection", "Premium protection included", "Premium", 0, 0);
            voucherIds[7] = _createVoucher(owner, positionId, VoucherType.DURATION, "Priority Booking", "Priority booking for rentals", "Priority", 0, 0);
            voucherIds[8] = _createVoucher(owner, positionId, VoucherType.SINGLE_USE, "Car Upgrade", "Free car upgrade", "Upgrade", 1, 0);
            voucherIds[9] = _createVoucher(owner, positionId, VoucherType.SINGLE_USE, "Lamborghini Rental", "1 day rental of Lamborghini Huracan EVO", "1 day", 1, 0);
            voucherIds[10] = _createVoucher(owner, positionId, VoucherType.SINGLE_USE, "Weekend Package", "Weekend with car and 5-star hotel stay", "Weekend", 1, 0);
        } else if (tier == 3) { // Platinum - 14 ваучеров
            voucherIds = new uint256[](14);
            voucherIds[0] = _createVoucher(owner, positionId, VoucherType.SINGLE_USE, "5% Discount", "5% discount when paying for car rental with PADD-R tokens", "5%", 1, 0);
            voucherIds[1] = _createVoucher(owner, positionId, VoucherType.SINGLE_USE, "Free Rental Hours", "5 hours free rental when renting for 1 day or more", "5 hours", 1, 0);
            voucherIds[2] = _createVoucher(owner, positionId, VoucherType.MULTI_USE, "Rental Coupons", "12x $1250 car rental coupons", "$1250", 12, 0);
            voucherIds[3] = _createVoucher(owner, positionId, VoucherType.DURATION, "Auto Service Discount", "30% discount at auto service", "30%", 0, 0);
            voucherIds[4] = _createVoucher(owner, positionId, VoucherType.DURATION, "Restaurant Discount", "20% discount at restaurant", "20%", 0, 0);
            voucherIds[5] = _createVoucher(owner, positionId, VoucherType.DURATION, "Unlimited Mileage", "Unlimited mileage on rentals", "Unlimited", 0, 0);
            voucherIds[6] = _createVoucher(owner, positionId, VoucherType.DURATION, "Premium Protection", "Premium protection included", "Premium", 0, 0);
            voucherIds[7] = _createVoucher(owner, positionId, VoucherType.DURATION, "Priority Booking", "Priority booking for rentals", "Priority", 0, 0);
            voucherIds[8] = _createVoucher(owner, positionId, VoucherType.SINGLE_USE, "Car Upgrade", "Free car upgrade", "Upgrade", 1, 0);
            voucherIds[9] = _createVoucher(owner, positionId, VoucherType.SINGLE_USE, "Chauffeur Service", "6 hours chauffeur service", "6 hours", 1, 0);
            voucherIds[10] = _createVoucher(owner, positionId, VoucherType.SINGLE_USE, "Free Delivery UAE", "Free delivery in UAE", "Free", 1, 0);
            voucherIds[11] = _createVoucher(owner, positionId, VoucherType.SINGLE_USE, "Lamborghini Rental", "1 day rental of Lamborghini Huracan EVO", "1 day", 1, 0);
            voucherIds[12] = _createVoucher(owner, positionId, VoucherType.SINGLE_USE, "Weekend Package", "Weekend with car and 5-star hotel stay", "Weekend", 1, 0);
            voucherIds[13] = _createVoucher(owner, positionId, VoucherType.SINGLE_USE, "Yacht Trip", "Yacht trip or private tour of the Emirates", "Yacht/Tour", 1, 0);
        }

        return voucherIds;
    }

    /**
     * @dev Create a single voucher
     */
    function _createVoucher(
        address owner,
        uint256 positionId,
        VoucherType voucherType,
        string memory name,
        string memory description,
        string memory value,
        uint256 maxUses,
        uint256 currentUses
    ) internal returns (uint256) {
        uint256 voucherId = _nextVoucherId++;
        
        // Генерируем QR-код
        string memory qrCode = _generateQRCode(voucherId, owner, positionId);
        
        // Устанавливаем время истечения для DURATION ваучеров (на период стейкинга)
        uint256 expiresAt = 0;
        if (voucherType == VoucherType.DURATION) {
            // Для мейннета: DURATION ваучеры действуют на весь период стейкинга
            // Время истечения будет установлено при создании позиции
            expiresAt = 0; // Будет установлено позже через setVoucherExpiration
        }

        vouchers[voucherId] = Voucher({
            id: voucherId,
            owner: owner,
            voucherType: voucherType,
            name: name,
            description: description,
            value: value,
            maxUses: maxUses,
            currentUses: currentUses,
            expiresAt: expiresAt,
            isActive: true,
            qrCode: qrCode,
            positionId: positionId
        });

        userVouchers[owner].push(voucherId);
        
        emit VoucherCreated(voucherId, owner, voucherType, name);
        emit QRCodeGenerated(voucherId, qrCode);
        
        return voucherId;
    }

    /**
     * @dev Generate QR code for voucher
     */
    function _generateQRCode(
        uint256 voucherId,
        address owner,
        uint256 positionId
    ) internal view returns (string memory) {
        // Используем более уникальный формат с timestamp
        return string(abi.encodePacked(
            "PADD_VOUCHER_",
            voucherId.toString(),
            "_",
            _addressToString(owner),
            "_",
            positionId.toString(),
            "_",
            block.timestamp.toString()
        ));
    }

    /**
     * @dev Convert address to string
     */
    function _addressToString(address addr) internal pure returns (string memory) {
        return string(abi.encodePacked(addr));
    }

    /**
     * @dev Redeem voucher using QR code
     * @param qrCode QR code of the voucher
     * @param redeemer Address redeeming the voucher
     */
    function redeemVoucher(
        string memory qrCode,
        address redeemer
    ) external onlyRole(REDEEMER_ROLE) nonReentrant returns (bool) {
        require(!qrCodeUsed[qrCode], "QR code already used");
        require(redeemer != address(0), "Invalid redeemer");

        // Находим ваучер по QR-коду
        uint256 voucherId = _findVoucherByQRCode(qrCode);
        require(voucherId != 0, "Voucher not found");

        Voucher storage voucher = vouchers[voucherId];
        require(voucher.isActive, "Voucher not active");
        require(voucher.owner != address(0), "Invalid voucher");

        // Проверяем тип ваучера и лимиты
        if (voucher.voucherType == VoucherType.SINGLE_USE) {
            require(!usedVouchers[voucherId], "Voucher already used");
            usedVouchers[voucherId] = true;
            voucher.isActive = false;
        } else if (voucher.voucherType == VoucherType.MULTI_USE) {
            require(voucher.currentUses < voucher.maxUses, "Voucher usage limit reached");
            voucher.currentUses++;
            if (voucher.currentUses >= voucher.maxUses) {
                voucher.isActive = false;
            }
        } else if (voucher.voucherType == VoucherType.DURATION) {
            require(block.timestamp <= voucher.expiresAt, "Voucher expired");
        }

        // Помечаем QR-код как использованный
        qrCodeUsed[qrCode] = true;

        emit VoucherRedeemed(voucherId, redeemer, qrCode);
        
        return true;
    }

    /**
     * @dev Find voucher by QR code
     */
    function _findVoucherByQRCode(string memory qrCode) internal view returns (uint256) {
        // Простая реализация - в реальном проекте может потребоваться более сложная логика
        for (uint256 i = 1; i < _nextVoucherId; i++) {
            if (keccak256(bytes(vouchers[i].qrCode)) == keccak256(bytes(qrCode))) {
                return i;
            }
        }
        return 0;
    }

    /**
     * @dev Find voucher by QR code (public function for admin)
     */
    function findVoucherByQRCode(string memory qrCode) external view returns (Voucher memory) {
        uint256 voucherId = _findVoucherByQRCode(qrCode);
        require(voucherId != 0, "Voucher not found");
        return vouchers[voucherId];
    }

    /**
     * @dev Get user vouchers
     */
    function getUserVouchers(address user) external view returns (uint256[] memory) {
        return userVouchers[user];
    }

    /**
     * @dev Get voucher details
     */
    function getVoucher(uint256 voucherId) external view returns (Voucher memory) {
        return vouchers[voucherId];
    }

    /**
     * @dev Check if voucher is valid
     */
    function isVoucherValid(uint256 voucherId) external view returns (bool) {
        Voucher storage voucher = vouchers[voucherId];
        
        if (!voucher.isActive) return false;
        if (voucher.owner == address(0)) return false;
        
        if (voucher.voucherType == VoucherType.SINGLE_USE) {
            return !usedVouchers[voucherId];
        } else if (voucher.voucherType == VoucherType.MULTI_USE) {
            return voucher.currentUses < voucher.maxUses;
        } else if (voucher.voucherType == VoucherType.DURATION) {
            return block.timestamp <= voucher.expiresAt;
        }
        
        return false;
    }

    /**
     * @dev Deactivate voucher (admin only)
     */
    function deactivateVoucher(uint256 voucherId) external onlyRole(ADMIN_ROLE) {
        require(vouchers[voucherId].id != 0, "Voucher not found");
        vouchers[voucherId].isActive = false;
        emit VoucherDeactivated(voucherId);
    }

    /**
     * @dev Redeem voucher by ID (admin/redeemer only)
     */
    function redeemVoucherById(uint256 voucherId) external onlyRole(REDEEMER_ROLE) nonReentrant returns (bool) {
        require(vouchers[voucherId].id != 0, "Voucher not found");
        
        Voucher storage voucher = vouchers[voucherId];
        require(voucher.isActive, "Voucher not active");
        require(voucher.owner != address(0), "Invalid voucher");

        // Проверяем тип ваучера и лимиты
        if (voucher.voucherType == VoucherType.SINGLE_USE) {
            require(!usedVouchers[voucherId], "Voucher already used");
            usedVouchers[voucherId] = true;
            voucher.isActive = false;
        } else if (voucher.voucherType == VoucherType.MULTI_USE) {
            require(voucher.currentUses < voucher.maxUses, "Voucher usage limit reached");
            voucher.currentUses++;
            if (voucher.currentUses >= voucher.maxUses) {
                voucher.isActive = false;
            }
        } else if (voucher.voucherType == VoucherType.DURATION) {
            require(block.timestamp <= voucher.expiresAt, "Voucher expired");
        }

        emit VoucherRedeemed(voucherId, msg.sender, voucher.qrCode);
        return true;
    }

    /**
     * @dev Add redeemer role
     */
    function addRedeemer(address redeemer) external onlyRole(ADMIN_ROLE) {
        _grantRole(REDEEMER_ROLE, redeemer);
    }

    /**
     * @dev Remove redeemer role
     */
    function removeRedeemer(address redeemer) external onlyRole(ADMIN_ROLE) {
        _revokeRole(REDEEMER_ROLE, redeemer);
    }

    /**
     * @dev Set expiration time for DURATION vouchers (called by stake manager)
     */
    function setVoucherExpiration(uint256 voucherId, uint256 expirationTime) external onlyRole(ADMIN_ROLE) {
        require(vouchers[voucherId].id != 0, "Voucher not found");
        require(vouchers[voucherId].voucherType == VoucherType.DURATION, "Not a DURATION voucher");
        vouchers[voucherId].expiresAt = expirationTime;
    }
}
