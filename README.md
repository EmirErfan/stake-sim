# StakeSim - Ethereum Staking Reward Simulator

StakeSim is a staking reward simulator that lets users experience Ethereum staking on the Sepolia testnet with real-time rewards simulation. This project is built with Next.js.

## Getting Started

To use StakeSim, follow these steps:  

### 1. Setup Smart Contract  
- Open [Remix IDE](https://remix.ethereum.org/).  
- Load the `DemoStakeSim.sol` smart contract.  
- Compile and deploy the contract using the **Sepolia testnet**.  
- Once deployed, use the `depositReward` function to deposit at least **1 ETH** as the initial reward pool.

### 2. Configure Frontend  
- Copy the deployed contract address.  
- In your project directory, navigate to:  
  ```
  lib/constants.ts
  ```
- Update the contract address with your newly deployed address.

### 3. Connect Wallets  
- To use StakeSim, connect with a second wallet that:  
  - Is on the **Sepolia testnet**.  
  - Has at least **35 ETH** for staking.  

## Features  
- Real-time staking rewards simulation.  
- Experience Ethereum staking without risking real assets.  

## Tech Stack  
- **Next.js** - Frontend framework.  
- **Solidity** - Smart contract development.  

## Installation  
1. Clone the repository:  
    ```bash
    git clone https://github.com/EmirErfan/StakeSim.git
    cd StakeSim
    ```
2. Install dependencies:  
    ```bash
    npm install
    ```
3. Start the development server:  
    ```bash
    npm run dev
    ```

## Contributing  
Contributions are welcome! Feel free to submit issues or pull requests.  

## License  
This project is licensed under the MIT License.  
