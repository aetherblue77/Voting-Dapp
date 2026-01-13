# ⚙️ Voting Dapp - Backend

This directory contains the Smart Contract code, deployment scripts, and test files built with **Hardhat**, **TypeScript**, and **Ethers.js V6**.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
* [Node.js](https://nodejs.org/) (v18 or later recommended)
* [Yarn](https://yarnpkg.com/) (Package Manager)

## 🚀 Getting Started

### 1. Installation
Navigate to the backend folder and install dependencies:

```bash
cd backend
yarn install
```

### 2. Environment Variables
Create a `.env` file in the `backend` root directory. You can copy the structure from a `.env.example` file if created, or simply add these variables:

```bash
SEPOLIA_RPC_URL=your_alchemy_or_infura_url
PRIVATE_KEY=your_metamask_private_key
ETHERSCAN_API_KEY=your_etherscan_api_key
COINMARKETCAP_API_KEY=your_key_optional
```

⚠️ **IMPORTANT**: Never commit your `.env` file to GitHub! It is already added to `.gitignore`.

## 🛠️ Usage

### Compile Contract
To compile the Solidity smart contracts:

```bash
yarn hardhat compile
```

### Run Unit Tests
This project includes comprehensive unit tests (16 tests) covering deployment, voting logic, and time constraints.

```bash
yarn hardhat test
```

### Deploy to Localhost
To deploy and test interactions on a local node:
1. **Open Terminal 1** (Start the local blockchain):

```bash
yarn hardhat node
```

2. **Open Terminal 2** (Deploy the contract):

```bash
yarn hardhat run scripts/deploy.ts --network localhost
```

### Deploy to Sepolia Testnet and Verify Contract
To deploy the contract to the live Sepolia network while verifying it on Etherscan:

```bash
yarn hardhat run scripts/deploy.ts --network sepolia
```

## 📂 Project Structure
- `contracts/`: Contains the Solidity smart contracts (Voting.sol).
- `scripts/`: Scripts for deployment (deploy.ts).
- `test/`: Unit tests to ensure protocol security (voting.test.ts).
- `hardhat.config.ts`: Configuration for networks, compilers, and plugins.
- `helper-hardhat-config.ts`: Helper file for managing network-specific variables.

## 📜 Deployed Contract (Sepolia)
- **Contract Address**: `[PASTE YOUR CONTRACT ADDRESS HERE]`
- **Etherscan Link**: [View on Etherscan](https://sepolia.etherscan.io/)

## 🛠️ Tech Stack Details
- **Framework**: Hardhat
- **Language**: TypeScript
- **Library**: Ethers.js V6
- **Solidity Version**: 0.8.28