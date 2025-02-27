"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Wallet, AlertCircle, ArrowRight, BarChart3 } from "lucide-react";
import ConnectWallet from "./ConnectWallet";
import { stakeETH, unstakeETH } from "../lib/stakingContract"; // on-chain helper functions

export default function StakingSimulator() {
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState("");
  const [balance, setBalance] = useState("0");
  const [stakeAmount, setStakeAmount] = useState("32");
  const [isStaking, setIsStaking] = useState(false);
  const [rewards, setRewards] = useState(0);
  const [activeTab, setActiveTab] = useState("stake");
  const [apr, setApr] = useState(3.75); // Current ETH staking APR
  const [timeStaked, setTimeStaked] = useState(0);
  const [loading, setLoading] = useState(false);

  // Simulate rewards accumulation (for UI display only)
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isStaking) {
      interval = setInterval(() => {
        // This logic is purely local and simulates "Hourly update"
        const ethAmount = parseFloat(stakeAmount);
        const dailyRate = apr / 365 / 100; // e.g. 3.75% => 0.0375 / 365
        const newRewards = rewards + (ethAmount * dailyRate) / 24; // "Hourly" portion
        setRewards(newRewards);
        setTimeStaked((prev) => prev + 5); // we update every 5 seconds, so let's add 5 to represent real seconds
      }, 5000); // update every 5 real seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isStaking, stakeAmount, apr]);

  const handleConnect = (connected: boolean, address: string, ethBalance: string) => {
    setIsConnected(connected);
    setAccount(address);
    setBalance(ethBalance);
  };

  // Updated handleStake: calls the blockchain helper function instead of the old simulation-only approach
  const handleStake = async () => {
    if (parseFloat(stakeAmount) < 32) {
      alert("Minimum staking amount is 32 ETH");
      return;
    }

    try {
      setLoading(true);
      // Call the on-chain staking function
      await stakeETH(stakeAmount);
      alert("Stake successful!");

      // Now update local state so we see the "Rewards" tab and start the simulation
      setIsStaking(true);
      setActiveTab("rewards");

    } catch (error: any) {
      console.error("Stake error:", error);
      alert("Stake failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Updated handleUnstake: calls the helper function to trigger unstake on-chain
  const handleUnstake = async () => {
    try {
      setLoading(true);
      await unstakeETH();
      alert("Unstake successful!");

      // Reset local simulation states
      setIsStaking(false);
      setRewards(0);
      setTimeStaked(0);
      setActiveTab("stake");
    } catch (error: any) {
      console.error("Unstake error:", error);
      alert("Unstake failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatAddress = (address: string) => {
    if (!address) return "";
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const formatEth = (value: number | string) => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    return num.toFixed(6);
  };

  return (
    <Card className="w-full shadow-lg border-2">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-center">
          <CardTitle className="text-2xl flex items-center gap-2">
            <Wallet className="h-6 w-6 text-blue-500" />
            Staking Reward Simulator
          </CardTitle>
          <ConnectWallet onConnect={handleConnect} />
        </div>
        <CardDescription>
          Experience Ethereum staking on testnet with real-time reward simulation
        </CardDescription>
      </CardHeader>

      <Separator />

      {!isConnected ? (
        // If wallet isn't connected, show prompt
        <CardContent className="pt-6 pb-8 flex flex-col items-center justify-center min-h-[300px]">
          <AlertCircle className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">Connect Your Wallet</h3>
          <p className="text-muted-foreground text-center max-w-md mb-6">
            Connect your wallet to start simulating Ethereum staking rewards on testnet.
          </p>
          <Button
            size="lg"
            className="gap-2"
            onClick={() => document.querySelector<HTMLButtonElement>('[aria-label="Connect Wallet"]')?.click()}
          >
            Connect Wallet <ArrowRight className="h-4 w-4" />
          </Button>
        </CardContent>
      ) : (
        <>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <p className="text-sm text-muted-foreground">Connected as</p>
                <p className="font-medium">{formatAddress(account)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Balance</p>
                <p className="font-medium">{formatEth(balance)} ETH</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current APR</p>
                <p className="font-medium">{apr}%</p>
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="stake">Stake</TabsTrigger>
                <TabsTrigger value="rewards">Rewards</TabsTrigger>
              </TabsList>

              {/* STAKE TAB */}
              <TabsContent value="stake" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="stake-amount" className="text-sm font-medium mb-2 block">
                      Amount to Stake (min. 32 ETH)
                    </label>
                    <div className="flex gap-2">
                      <Input
                        id="stake-amount"
                        type="number"
                        min="32"
                        value={stakeAmount}
                        onChange={(e) => setStakeAmount(e.target.value)}
                        className="flex-1"
                      />
                      <Button variant="outline" onClick={() => setStakeAmount("32")}>
                        Min (32)
                      </Button>
                    </div>
                  </div>

                  <Alert variant="default" className="bg-muted/50">
                    <AlertDescription className="flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">This is a simulation</p>
                        <p className="text-sm text-muted-foreground">
                          No actual ETH will be staked. This is for educational purposes only.
                        </p>
                      </div>
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Estimated Annual Rewards</span>
                      <span className="font-medium">
                      1.21449 ETH
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Estimated Monthly Rewards</span>
                      <span className="font-medium">
                      0.099821  ETH
                      </span>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* REWARDS TAB */}
              <TabsContent value="rewards" className="space-y-6">
                {isStaking ? (
                  <>
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold">Currently Staking</h3>
                        <p className="text-2xl font-bold">{stakeAmount} ETH</p>
                      </div>
                      <div className="text-right">
                        <h3 className="font-semibold">Rewards Earned</h3>
                        <p className="text-2xl font-bold text-green-500">{formatEth(rewards)} ETH</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Time Elapsed</span>
                        <span className="text-sm font-medium">{timeStaked} seconds, every 20 seconds is equal to 1 day</span>
                      </div>
                      <Progress value={Math.min(timeStaked / 60, 100)} className="h-2" />
                    </div>

                    <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm">Annual Percentage Rate</span>
                        <span className="text-sm font-medium">{apr}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Total Value</span>
                        <span className="text-sm font-medium">
                          {formatEth(parseFloat(stakeAmount) + rewards)} ETH
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Rewards per Day</span>
                        <span className="text-sm font-medium">
                          {formatEth((parseFloat(stakeAmount) * apr) / 100 / 365)} ETH
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-center">
                      <BarChart3 className="h-5 w-5 text-muted-foreground mr-2" />
                      <span className="text-sm text-muted-foreground">
                        Rewards are simulated and updated every 5 seconds
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">You are not staking any ETH yet</p>
                    <Button onClick={() => setActiveTab("stake")}>Start Staking</Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>

          <CardFooter className="flex justify-end gap-2 pt-2">
            {/* Show STAKE button if we are on the 'stake' tab and not currently staking */}
            {activeTab === "stake" && !isStaking && (
              <Button size="lg" onClick={handleStake} disabled={parseFloat(stakeAmount) < 32 || loading}>
                {loading ? "Staking..." : "Stake ETH"}
              </Button>
            )}
            {/* Show UNSTAKE button if we are on the 'rewards' tab and currently staking */}
            {activeTab === "rewards" && isStaking && (
              <Button size="lg" variant="destructive" onClick={handleUnstake} disabled={loading}>
                {loading ? "Unstaking..." : "Unstake ETH"}
              </Button>
            )}
          </CardFooter>
        </>
      )}
    </Card>
  );
}
