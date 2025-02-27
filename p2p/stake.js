// p2p/stake.js

import { signAndBroadcast } from "./sign.js";
import axios from "axios";
import { readFileSync } from "fs";
import { v4 as uuidv4 } from "uuid";
import { setTimeout as wait } from "timers/promises";

const config = JSON.parse(readFileSync("./config.json", "utf-8"));
const API_BASE_URL = config.url;
const AUTH_TOKEN = config.token;
const STAKER_ADDRESS = config.stakerAddress;

// ... all your helper functions remain the same (createEigenPod, etc.) ...

export async function stakeProcess() {
  try {
    console.log("Starting staking process...");

    // Step 1: Create EigenPod
    const podResponse = await createEigenPod();
    // Sign & broadcast...
    const signedPodTx = await signAndBroadcast(
      podResponse.serializeTx,
      podResponse.gasLimit,
      podResponse.maxFeePerGas,
      podResponse.maxPriorityFeePerGas,
      podResponse.value
    );

    // Step 2: Create Restake Request
    const { uuid, result: restakeRequest } = await createRestakeRequest();

    // Step 3: Check Restake Status
    const restakeStatus = await getRestakeStatusWithRetry(uuid);

    // Step 4: Create Deposit Transaction
    const depositTxResponse = await createDepositTx(restakeStatus);

    // Step 5: Wait 30 seconds
    await wait(30000);

    // Step 6: Sign & Broadcast Deposit Transaction
    const signedDepositTx = await signAndBroadcast(
      depositTxResponse.serializeTx,
      depositTxResponse.gasLimit,
      depositTxResponse.maxFeePerGas,
      depositTxResponse.maxPriorityFeePerGas,
      depositTxResponse.value
    );

    console.log("Staking Complete! TX Hash:", signedDepositTx.hash);
    return signedDepositTx.hash;
  } catch (error) {
    console.error("Staking process failed:", error.message);
    throw error;
  }
}
