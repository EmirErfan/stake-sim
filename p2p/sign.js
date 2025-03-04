import { ethers } from "ethers";
import { readFileSync } from "fs";

async function signAndBroadcast(
  txHex,
  gasLimit,
  maxFeeGas,
  maxPriorityFeeGas,
  amount
) {
  console.log("Started signing transaction");

  // Load configuration
  const config = JSON.parse(readFileSync("./config.json", "utf-8"));
  const privateKey = config.privateKey;
  const rpcURL = config.rpc;

  if (!privateKey) {
    throw new Error("Private key is missing in config.json");
  }

  // Initialize provider and wallet
  const provider = new ethers.JsonRpcProvider(rpcURL);
  const wallet = new ethers.Wallet(privateKey, provider);

  // Parse the transaction from hex format
  const tx = ethers.Transaction.from(txHex);

  // Get current nonce and network details
  const { chainId } = await provider.getNetwork();
  const nonce = await provider.getTransactionCount(wallet.address);

  // Prepare the transaction object
  const txData = {
    to: tx.to,
    data: tx.data,
    chainId: tx.chainId,
    value: amount,
    gasLimit: gasLimit,
    type: 2,
    nonce: nonce,
    maxFeePerGas: ethers.parseUnits(maxFeeGas, "wei"),
    maxPriorityFeePerGas: ethers.parseUnits(maxPriorityFeeGas, "wei"),
  };

  // Sign the transaction
  const signedTransaction = await wallet.signTransaction(txData);

  // Broadcast the signed transaction
  const transactionResponse = await provider.broadcastTransaction(signedTransaction);
  console.log("Transaction broadcasted, hash:", transactionResponse.hash);
  
  return transactionResponse;
}

export { signAndBroadcast };
