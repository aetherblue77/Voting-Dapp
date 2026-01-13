import { run } from "hardhat"

export const verify = async (contractAddress: string, args: any[]) => {
    console.log("🔍 Starting Verification process...")
    try {
        await run("verify:verify", {
            address: contractAddress,
            constructorArguments: args,
        })
    } catch (e: any) {
        if (e.message.toLowerCase().includes("already verified")) {
            console.log("Checking... Already Verified!")
        } else {
            console.log("❌ Error verifying contract:", e)
        }
    }
}
