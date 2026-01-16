import { ethers, network, artifacts } from "hardhat"
import * as fs from "fs"
import * as path from "path"
import { networkConfig } from "../helper-hardhat-config"

// Configuration Location Frontend File
const FRONTEND_CONSTANTS_DIR = path.resolve(__dirname, "../../frontend/constants")
const FRONTEND_ADDRESS_FILE = path.join(FRONTEND_CONSTANTS_DIR, "contractAddress.json")
const FRONTEND_ABI_FILE = path.join(FRONTEND_CONSTANTS_DIR, "abi.json")

async function main() {
    console.log("🚀 Starting deployment to network:", network.name)

    // 1. Deploy Contract
    // (this is standard method hardhat, not hardhat-deploy)
    const chainId = network.config.chainId

    if (!chainId) {
        throw new Error("Chain ID not found")
    }

    const candidateNames = networkConfig[chainId].candidateNames
    const durationInMinutes = networkConfig[chainId].votingDurationInMinutes

    if (!candidateNames || !durationInMinutes) {
        throw new Error("Candidate names or duration in minutes not found")
    }

    const votingFactory = await ethers.getContractFactory("Voting")
    const voting = await votingFactory.deploy(candidateNames, durationInMinutes)
    await voting.waitForDeployment()

    const contractAddress = await voting.getAddress()
    console.log("✅ Voting contract deployed to:", contractAddress)

    // 2. Update Frontend
    if (process.env.UPDATE_FRONTEND === "true") {
        console.log("📦 Updating Frontend...")
        await updateContractAddresses(contractAddress)
        await updateAbi()
    }
}

// Function 1: Update Address (Typescript & JSON Version)
async function updateContractAddresses(contractAddress: string) {
    // Make sure the code is exists
    if (!fs.existsSync(FRONTEND_CONSTANTS_DIR)) {
        fs.mkdirSync(FRONTEND_CONSTANTS_DIR, { recursive: true })
    }

    // Read old file if exists
    let currentAddresses: any = {}
    if (fs.existsSync(FRONTEND_ADDRESS_FILE)) {
        const fileContent = fs.readFileSync(FRONTEND_ADDRESS_FILE, "utf8")
        if (fileContent) {
            currentAddresses = JSON.parse(fileContent)
        }
    }

    const chainId = network.config.chainId?.toString()
    if (!chainId) {
        throw new Error("Chain ID not found")
    }

    // Logic: Keep address of ChainId
    if (chainId in currentAddresses) {
        if (!currentAddresses[chainId].includes(contractAddress)) {
            currentAddresses[chainId].push(contractAddress)
        }
    } else {
        currentAddresses[chainId] = [contractAddress]
    }

    fs.writeFileSync(FRONTEND_ADDRESS_FILE, JSON.stringify(currentAddresses, null, 2))
    console.log(`   - Address saved to ${FRONTEND_ADDRESS_FILE}`)
}

// Function 2: Update ABI
async function updateAbi() {
    // Take ABI from artifacts
    // this is more preferred than ethers.until.FormatTypes in Ethers V6
    const artifact = artifacts.readArtifactSync("Voting")

    fs.writeFileSync(FRONTEND_ABI_FILE, JSON.stringify(artifact.abi, null, 2))
    console.log(`   - ABI saved to ${FRONTEND_ABI_FILE}`)
}

main().catch((error) => {
    console.error(error)
    process.exitCode = 1
})
