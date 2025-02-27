import StakingSimulator from '@/components/StakingSimulator';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-secondary/20 flex flex-col items-center justify-center p-4">
      <div className="max-w-5xl w-full">
        <h1 className="text-4xl font-bold text-center mb-2">StakeSim</h1>
        <p className="text-muted-foreground text-center mb-8">Experience Ethereum staking on testnet</p>
        <StakingSimulator />
      </div>
    </main>
  );
}