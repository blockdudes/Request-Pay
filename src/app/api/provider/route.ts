import { ethers } from "ethers";

export async function GET() {
    try {
        const provider = new ethers.providers.JsonRpcProvider("https://eth-sepolia.g.alchemy.com/v2/demo");
        return Response.json({ provider: provider });
    } catch {
        return Response.error();
    }
}