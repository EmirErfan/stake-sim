"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Wallet, AlertCircle, Loader2 } from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ConnectWalletProps {
  onConnect: (connected: boolean, address: string, balance: string) => void;
}

export default function ConnectWallet({ onConnect }: ConnectWalletProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState("");
  const [balance, setBalance] = useState("0");
  const [isTestnet, setIsTestnet] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // Check if MetaMask is installed
    if (typeof window !== 'undefined') {
      const checkInitialConnection = async () => {
        try {
          await checkConnection();
        } catch (error) {
          console.error("Error during initial connection check:", error);
        } finally {
          setIsInitializing(false);
        }
      };
      
      checkInitialConnection();
    } else {
      setIsInitializing(false);
    }
  }, []);

  const checkConnection = async () => {
    try {
      // @ts-ignore - ethereum is injected by MetaMask
      if (window.ethereum) {
        // @ts-ignore
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          const chainId = await getChainId();
          const isTestnet = checkIfTestnet(chainId);
          
          if (isTestnet) {
            setAccount(accounts[0]);
            const currentBalance = await getBalance(accounts[0]);
            setBalance(currentBalance);
            setIsConnected(true);
            setIsTestnet(true);
            onConnect(true, accounts[0], currentBalance);
          } else {
            setIsTestnet(false);
            setError("Please connect to a testnet (Goerli, Sepolia, etc.)");
          }
        }
      }
    } catch (error) {
      console.error("Error checking connection:", error);
    }
  };

  const getChainId = async () => {
    try {
      // @ts-ignore
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      return chainId;
    } catch (error) {
      console.error("Error getting chain ID:", error);
      return null;
    }
  };

  const checkIfTestnet = (chainId: string | null) => {
    if (!chainId) return false;
    
    // Goerli: 0x5, Sepolia: 0xaa36a7, Holesky: 0x4268, etc.
    const testnetIds = ['0x5', '0xaa36a7', '0x4268'];
    return testnetIds.includes(chainId);
  };

  const getBalance = async (address: string) => {
    try {
      // @ts-ignore
      const balanceHex = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [address, 'latest'],
      });
      
      // Convert from wei to ETH
      const balanceWei = parseInt(balanceHex, 16);
      const balanceEth = balanceWei / 1e18;
      return balanceEth.toString();
    } catch (error) {
      console.error("Error getting balance:", error);
      return "0";
    }
  };

  const connectWallet = async () => {
    if (isLoading) return;
    
    setError("");
    setIsLoading(true);
    
    try {
      // @ts-ignore
      if (window.ethereum) {
        // @ts-ignore
        const accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts',
          params: []
        });
        
        const chainId = await getChainId();
        const isTestnet = checkIfTestnet(chainId);
        
        if (isTestnet) {
          setAccount(accounts[0]);
          const ethBalance = await getBalance(accounts[0]);
          setBalance(ethBalance);
          setIsConnected(true);
          setIsTestnet(true);
          onConnect(true, accounts[0], ethBalance);
          setDialogOpen(false);
        } else {
          setIsTestnet(false);
          setError("Please connect to a testnet (Goerli, Sepolia, etc.)");
        }
      } else {
        setError("MetaMask is not installed. Please install MetaMask to continue.");
      }
    } catch (error: any) {
      console.error("Error connecting wallet:", error);
      // Handle specific MetaMask errors
      if (error?.code === -32002) {
        setError("Connection request already pending. Please check your MetaMask extension.");
      } else {
        setError("Failed to connect wallet. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    setAccount("");
    setBalance("0");
    onConnect(false, "", "0");
  };

  const formatAddress = (address: string) => {
    if (!address) return "";
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  // If still initializing, show a subtle loading state
  if (isInitializing) {
    return (
      <Button variant="outline" className="gap-2" disabled>
        <Loader2 className="h-4 w-4 animate-spin" />
        Checking wallet...
      </Button>
    );
  }

  return (
    <>
      {isConnected ? (
        <Button 
          variant="outline" 
          className="gap-2" 
          onClick={disconnectWallet}
        >
          <Wallet className="h-4 w-4" />
          {formatAddress(account)}
        </Button>
      ) : (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" aria-label="Connect Wallet">
              <Wallet className="h-4 w-4" />
              Connect Wallet
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Connect Wallet</DialogTitle>
              <DialogDescription>
                Connect your wallet to start simulating Ethereum staking on testnet.
              </DialogDescription>
            </DialogHeader>
            
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-4">
              <Alert variant="default" className="bg-muted/50">
                <AlertDescription className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Testnet Required</p>
                    <p className="text-sm text-muted-foreground">
                      Please make sure you're connected to an Ethereum testnet (Goerli, Sepolia, or Holesky).
                    </p>
                  </div>
                </AlertDescription>
              </Alert>
              
              <Button 
                className="w-full" 
                size="lg" 
                onClick={connectWallet}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  "Connect with MetaMask"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}