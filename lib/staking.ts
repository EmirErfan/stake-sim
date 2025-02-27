"use client";

import config from './config.json';

export interface StakingConfig {
  networks: {
    [key: string]: {
      depositContract: string;
      beaconChainApiUrl: string;
      etherscanUrl: string;
    }
  };
  stakingParameters: {
    minStake: number;
    apr: number;
    validatorActivationTime: number;
    exitDelay: number;
  };
}

export interface StakingStats {
  totalStaked: number;
  activeValidators: number;
  averageApr: number;
  networkName: string;
}

// Get the current network name based on chainId
export const getNetworkName = (chainId: string): string => {
  switch (chainId) {
    case '0x5':
      return 'goerli';
    case '0xaa36a7':
      return 'sepolia';
    case '0x4268':
      return 'holesky';
    default:
      return 'unknown';
  }
};

// Get staking contract address for the current network
export const getStakingContractAddress = (networkName: string): string => {
  const typedConfig = config as StakingConfig;
  return typedConfig.networks[networkName]?.depositContract || '';
};

// Calculate estimated rewards based on amount and time
export const calculateRewards = (
  amount: number, 
  days: number, 
  apr: number = (config as StakingConfig).stakingParameters.apr
): number => {
  // Daily rate = APR / 365
  const dailyRate = apr / 365 / 100;
  return amount * dailyRate * days;
};

// Simulate staking process
export const simulateStaking = async (
  amount: number,
  account: string,
  networkName: string
): Promise<boolean> => {
  // This is a simulation, so we're not actually staking anything
  // In a real implementation, this would interact with the staking contract
  
  if (amount < (config as StakingConfig).stakingParameters.minStake) {
    throw new Error(`Minimum staking amount is ${(config as StakingConfig).stakingParameters.minStake} ETH`);
  }
  
  // Simulate a delay to mimic blockchain transaction
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  return true;
};

// Get network statistics (simulated for testnet)
export const getNetworkStats = async (networkName: string): Promise<StakingStats> => {
  // In a real implementation, this would fetch data from the beacon chain API
  // For the simulator, we'll return mock data
  
  return {
    totalStaked: 10245678, // ETH
    activeValidators: 320180,
    averageApr: (config as StakingConfig).stakingParameters.apr,
    networkName
  };
};

// Format ETH amount with proper decimals
export const formatEth = (value: number): string => {
  return value.toFixed(6);
};

// Format large numbers with commas
export const formatNumber = (value: number): string => {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};