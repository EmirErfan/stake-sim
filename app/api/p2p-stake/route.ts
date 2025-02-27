// app/api/p2p-stake/route.ts
import { NextRequest, NextResponse } from "next/server";
import { stakeProcess } from "@/p2p/stake";  // adjust this path if needed

export async function POST(req: NextRequest) {
  try {
    // If your front-end sends a JSON body like { amount: 1.0 }, you can parse it:
    // const { amount } = await req.json();

    // For now, we’ll ignore the amount, or you can pass it into stakeProcess(amount).
    const txHash = await stakeProcess();

    return NextResponse.json({
      success: true,
      txHash,
    });
  } catch (error: any) {
    console.error("Error in /api/p2p-stake:", error);
    return NextResponse.json({
      success: false,
      error: error.message,
    });
  }
}
