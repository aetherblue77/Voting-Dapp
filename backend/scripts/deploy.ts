import { ethers, network } from "hardhat"
import { verify } from "../utils/verify"
import { networkConfig, developmentChains } from "../helper-hardhat-config"

async function main() {
    console.log("------------------------------------------------")
    console.log("📡 Deploying to Network:", network.name)
    console.log("------------------------------------------------")

    const chainId = network.config.chainId

    if (!chainId) {
        throw new Error("Chain ID not found!")
    }

    const candidateNames = networkConfig[chainId].candidateNames
    const durationInMinutes = networkConfig[chainId].votingDurationInMinutes

    if (!candidateNames || !durationInMinutes) {
        throw new Error("Missing candidate names or voting duration in configuration")
    }

    const votingFactory = await ethers.getContractFactory("Voting")

    const voting = await votingFactory.deploy(candidateNames, durationInMinutes)

    // Put transaction data
    const deployTx = voting.deploymentTransaction()
    if (deployTx) {
        console.log(`🔨 Deploying "Voting" (tx: ${deployTx.hash})...`)
    }

    // Wait for block confirmation
    const waitBlockConfirmations = developmentChains.includes(network.name) ? 1 : 6
    console.log(`⏳ Waiting for ${waitBlockConfirmations} block confirmations...`)

    // Wait deployment
    const receipt = await deployTx?.wait(waitBlockConfirmations)

    console.log("------------------------------------------------")
    console.log("✅ Deployed at:", voting.target)
    console.log("⛽ Gas Used:", receipt?.gasUsed.toString())
    console.log("------------------------------------------------")

    // Verification (especially for Sepolia)
    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        await verify(voting.target.toString(), [candidateNames, durationInMinutes])
    }
}

main().catch((error) => {
    console.error(error)
    process.exitCode = 1
})
