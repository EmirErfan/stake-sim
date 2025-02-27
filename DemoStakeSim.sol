// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract DemoStakeSim {
    uint256 public constant MIN_STAKE = 32 ether;
    uint256 public constant APR_BASIS = 375; // 3.75% APR

    struct StakeInfo {
        uint256 amount;
        uint256 depositTime;
    }

    mapping(address => StakeInfo) public stakers;

    // Stake at least 32 ETH
    function stake() external payable {
        require(msg.value >= MIN_STAKE, "Minimum stake is 32 ETH");
        require(stakers[msg.sender].amount == 0, "Already staked");
        stakers[msg.sender] = StakeInfo(msg.value, block.timestamp);
    }

    // Unstake: calculates rewards based on "5 seconds = 1 hour"
    function unstake() external {
        StakeInfo memory info = stakers[msg.sender];
        require(info.amount > 0, "No stake found");

        // T = real seconds staked
        uint256 T = block.timestamp - info.depositTime;

        // dailyRateScaled = (APR_BASIS * 1e18) / (100 * 365)
        uint256 dailyRateScaled = (APR_BASIS * 1e18) / (100 * 365);

        // hourlyRewardScaled = (stake * dailyRateScaled) / 24
        uint256 hourlyRewardScaled = (info.amount * dailyRateScaled) / 24;

        // scaledT = T * 1e18 / 5 => how many "hours" have passed in your simulation
        uint256 scaledT = (T * 1e18) / 5;

        // totalRewardScaled = (hourlyRewardScaled * scaledT) / 1e18
        uint256 totalRewardScaled = (hourlyRewardScaled * scaledT) / 1e18;

        // reward = totalRewardScaled / 1e18
        uint256 reward = totalRewardScaled / 1e18;

        // Clear staker record
        stakers[msg.sender] = StakeInfo(0, 0);

        // Contract must have enough ETH to pay principal + reward
        require(address(this).balance >= info.amount + reward, "Insufficient balance");

        payable(msg.sender).transfer(info.amount + reward);
    }

    // Let anyone deposit extra ETH for paying rewards
    function depositRewards() external payable {}

    // Check contract balance
    function contractBalance() external view returns (uint256) {
        return address(this).balance;
    }

    // Optional: see how much reward you'd get if you unstake now
    function pendingReward(address staker) external view returns (uint256) {
        StakeInfo memory info = stakers[staker];
        if (info.amount == 0) return 0;

        uint256 T = block.timestamp - info.depositTime;
        uint256 dailyRateScaled = (APR_BASIS * 1e18) / (100 * 365);
        uint256 hourlyRewardScaled = (info.amount * dailyRateScaled) / 24;
        uint256 scaledT = (T * 1e18) / 5;
        uint256 totalRewardScaled = (hourlyRewardScaled * scaledT) / 1e18;
        return totalRewardScaled / 1e18;
    }
}