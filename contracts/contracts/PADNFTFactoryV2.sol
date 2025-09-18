// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title PADNFTFactoryV2
 * @dev Upgradeable NFT Factory with proxy support
 * @notice ERC721A compatible NFT contract with upgradeability
 */
contract PADNFTFactoryV2 is Initializable, ERC721Upgradeable, AccessControlUpgradeable, UUPSUpgradeable {
    using Strings for uint256;
    
    // State variables
    uint256 private _tokenIdCounter;
    string private _baseTokenURI;
    address public stakeManager;
    address public tierCalculator;
    
    // Events
    event NFTMinted(address indexed to, uint256 indexed tokenId, uint256 positionId, uint256 tier);
    event BaseURIUpdated(string oldURI, string newURI);
    event StakeManagerUpdated(address indexed oldManager, address indexed newManager);
    event TierCalculatorUpdated(address indexed oldCalculator, address indexed newCalculator);
    
    // Errors
    error OnlyStakeManager();
    error InvalidTier();
    
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }
    
    /**
     * @dev Initialize the NFT Factory
     * @param _stakeManager Address of the stake manager
     * @param _tierCalc Address of the tier calculator
     */
    function initialize(address _stakeManager, address _tierCalc) public initializer {
        __ERC721_init("PAD NFT", "PADNFT");
        __AccessControl_init();
        __UUPSUpgradeable_init();
        
        // Set up roles
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        
        // Set addresses
        stakeManager = _stakeManager;
        tierCalculator = _tierCalc;
        
        // Start token ID from 1
        _tokenIdCounter = 1;
    }
    
    /**
     * @dev Mint NFT (only stake manager)
     */
    function mintNFT(
        address to,
        uint256 positionId,
        uint256 amountStaked,
        uint256 lockDurationHours,
        uint256 startTimestamp,
        uint8 tierLevel,
        uint256 hourIndex
    ) external {
        if (msg.sender != stakeManager) {
            revert OnlyStakeManager();
        }
        
        if (tierLevel > 3) {
            revert InvalidTier();
        }
        
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        
        _safeMint(to, tokenId);
        
        emit NFTMinted(to, tokenId, positionId, tierLevel);
    }
    
    /**
     * @dev Set base URI
     */
    function setBaseURI(string memory newBaseURI) external onlyRole(DEFAULT_ADMIN_ROLE) {
        string memory oldURI = _baseTokenURI;
        _baseTokenURI = newBaseURI;
        emit BaseURIUpdated(oldURI, newBaseURI);
    }
    
    /**
     * @dev Set stake manager
     */
    function setStakeManager(address _stakeManager) external onlyRole(DEFAULT_ADMIN_ROLE) {
        address oldManager = stakeManager;
        stakeManager = _stakeManager;
        emit StakeManagerUpdated(oldManager, _stakeManager);
    }
    
    /**
     * @dev Set tier calculator
     */
    function setTierCalculator(address _tierCalculator) external onlyRole(DEFAULT_ADMIN_ROLE) {
        address oldCalculator = tierCalculator;
        tierCalculator = _tierCalculator;
        emit TierCalculatorUpdated(oldCalculator, _tierCalculator);
    }
    
    /**
     * @dev Get base URI
     */
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }
    
    /**
     * @dev Get token URI
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "ERC721Metadata: URI query for nonexistent token");
        string memory base = _baseURI();
        return bytes(base).length > 0 ? string(abi.encodePacked(base, tokenId.toString(), ".json")) : "";
    }
    
    /**
     * @dev Get current token ID
     */
    function getCurrentTokenId() external view returns (uint256) {
        return _tokenIdCounter;
    }
    
    /**
     * @dev Authorize upgrade (only admin)
     */
    function _authorizeUpgrade(address newImplementation) internal override onlyRole(DEFAULT_ADMIN_ROLE) {
        // Only admin can authorize upgrades
    }
    
    /**
     * @dev Override supportsInterface
     */
    function supportsInterface(bytes4 interfaceId) public view override(ERC721Upgradeable, AccessControlUpgradeable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
    
    /**
     * @dev Get version
     */
    function version() external pure returns (string memory) {
        return "2.0.0";
    }
}
