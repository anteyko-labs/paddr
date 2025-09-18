// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Оставляем только контракт TierCalculator

contract TierCalculator {
    enum Tier {
        Bronze,  // ≥ 1 месяц
        Silver,  // ≥ 3 месяца
        Gold,    // ≥ 6 месяцев
        Platinum // ≥ 12 месяцев
    }

    uint256 private constant ONE_MONTH = 30 days;
    uint256 private constant THREE_MONTHS = 90 days;
    uint256 private constant SIX_MONTHS = 180 days;
    uint256 private constant TWELVE_MONTHS = 365 days;

    function getTier(uint256 duration) external pure returns (uint8) {
        if (duration >= TWELVE_MONTHS) {
            return uint8(Tier.Platinum);
        } else if (duration >= SIX_MONTHS) {
            return uint8(Tier.Gold);
        } else if (duration >= THREE_MONTHS) {
            return uint8(Tier.Silver);
        } else if (duration >= ONE_MONTH) {
            return uint8(Tier.Bronze);
        } else {
            revert("Duration too short");
        }
    }
} 