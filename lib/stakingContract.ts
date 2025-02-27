// lib/stakingContract.ts

import { ethers } from "ethers";
import DemoStakeSimABI from "./DemoStakeSimABI.json"; // Make sure this file exists with your ABI
import { STAKING_CONTRACT_ADDRESS } from "./constants"; // Create a constants.ts file with your address

async function getStakingContract() {
  if (!window.ethereum) throw new Error("No crypto wallet found");
  // Request wallet connection
  await window.ethereum.request({ method: "eth_requestAccounts" });
  
  // Create provider and signer (using ethers v6 style)
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  
  return new ethers.Contract(STAKING_CONTRACT_ADDRESS, DemoStakeSimABI, signer);
}

export async function stakeETH(amountInEth: string) {
  const contract = await getStakingContract();
  const value = ethers.parseEther(amountInEth);
  const tx = await contract.stake({ value });
  console.log("Stake TX sent:", tx.hash);
  const receipt = await tx.wait();
  console.log("Stake TX confirmed:", receipt.transactionHash);
}

export async function unstakeETH() {
  const contract = await getStakingContract();
  const tx = await contract.unstake();
  console.log("Unstake TX sent:", tx.hash);
  const receipt = await tx.wait();
  console.log("Unstake TX confirmed:", receipt.transactionHash);
}
