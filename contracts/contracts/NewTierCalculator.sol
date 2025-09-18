// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title NewTierCalculator
 * @dev Обновленный калькулятор тиров с новыми требованиями
 */
contract NewTierCalculator {
    
    /**
     * @dev Определяет тир на основе длительности стейкинга
     * @param duration Длительность стейкинга в секундах
     * @return tier Номер тира (0-3)
     */
    function getTier(uint256 duration) external pure returns (uint8) {
        // Новые требования:
        // Tier 0 (Bronze): 2 часа (7200 секунд)
        // Tier 1 (Silver): 4 часа (14400 секунд)  
        // Tier 2 (Gold): 6 часов (21600 секунд)
        // Tier 3 (Platinum): 8 часов (28800 секунд)
        
        if (duration >= 28800) {  // 8+ часов
            return 3; // Platinum
        } else if (duration >= 21600) {  // 6+ часов
            return 2; // Gold
        } else if (duration >= 14400) {  // 4+ часов
            return 1; // Silver
        } else if (duration >= 7200) {   // 2+ часов
            return 0; // Bronze
        } else {
            return 0; // По умолчанию Bronze для коротких периодов
        }
    }
    
    /**
     * @dev Получает минимальную сумму для тира
     * @param tier Номер тира
     * @return minAmount Минимальная сумма в wei
     */
    function getTierMinAmount(uint8 tier) external pure returns (uint256) {
        // Новые требования по сумме:
        if (tier == 0) {  // Bronze
            return 1000 * 10**18;  // 1000 токенов
        } else if (tier == 1) {  // Silver
            return 2000 * 10**18;  // 2000 токенов
        } else if (tier == 2) {  // Gold
            return 5000 * 10**18;  // 5000 токенов
        } else if (tier == 3) {  // Platinum
            return 10000 * 10**18; // 10000 токенов
        } else {
            return 1000 * 10**18;  // По умолчанию Bronze
        }
    }
    
    /**
     * @dev Получает длительность для тира
     * @param tier Номер тира
     * @return duration Длительность в секундах
     */
    function getTierDuration(uint8 tier) external pure returns (uint256) {
        if (tier == 0) {  // Bronze
            return 7200;   // 2 часа
        } else if (tier == 1) {  // Silver
            return 14400;  // 4 часа
        } else if (tier == 2) {  // Gold
            return 21600;  // 6 часов
        } else if (tier == 3) {  // Platinum
            return 28800;  // 8 часов
        } else {
            return 7200;   // По умолчанию Bronze
        }
    }
    
    /**
     * @dev Получает название тира
     * @param tier Номер тира
     * @return name Название тира
     */
    function getTierName(uint8 tier) external pure returns (string memory) {
        if (tier == 0) {
            return "Bronze";
        } else if (tier == 1) {
            return "Silver";
        } else if (tier == 2) {
            return "Gold";
        } else if (tier == 3) {
            return "Platinum";
        } else {
            return "Unknown";
        }
    }
}
