# 🗳️ Decentralized Voting Dapp

A transparent, secure, and verifiable voting system built on the Ethereum Blockchain.

This project demonstrates how to build a trustless application where votes are recorded on-chain, ensuring that results cannot be tampered with or manipulated.

---

## 🚧 Project Status

This project is currently under active development. The **Backend** (Smart Contract) is fully completed and deployed, while the **Frontend** integration is currently in progress.

| Component | Status | Description |
| :--- | :---: | :--- |
| **Backend** | ✅ **Completed** | Smart Contract deployed to **Sepolia Testnet**, Verified, and Tested (100% coverage). |
| **Frontend** | 🚧 **In Progress** | User Interface development and Web3 integration are ongoing. |

---

## 🛠️ Tech Stack

I am using a modern, strict tech stack to ensure security and code quality:

* **Language:** [TypeScript](https://www.typescriptlang.org/) (Strict typing for safety)
* **Blockchain Framework:** [Hardhat](https://hardhat.org/)
* **Library:** [Ethers.js V6](https://docs.ethers.org/v6/)
* **Smart Contract:** Solidity ^0.8.28
* **Network:** Sepolia Testnet

---

## 📂 Repository Structure

This repository is divided into two main folders:

### 1. [`/backend`](./backend)
Contains the Smart Contract logic, deployment scripts, and unit tests.
* **Status:** ✅ Finished.
* **Features:**
    * Secure voting logic (1 person = 1 vote).
    * Time-based voting duration.
    * Deployment scripts for Localhost and Sepolia.
    * 16 Unit Tests (Passing).
* 👉 **[Read Backend Documentation](./backend/README.md)** *(Go here to see how to run the tests)*

### 2. [`/frontend`](./frontend)
Contains the User Interface (UI) code to interact with the Smart Contract.
* **Status:** 🚧 Ongoing / Coming Soon.
* **Goal:** To provide a user-friendly website for voters.

---

## 🚀 Key Features (Smart Contract)

* **Candidate Management:** The owner can set a list of candidates.
* **Time-Limited:** Voting is only allowed within a specific duration (For example is 60 minutes).
* **Anti-Double Voting:** A wallet address can only vote once.
* **Transparent Results:** Anyone can check the vote count and the remaining time directly from the blockchain.

---

## 👨‍💻 Author

**Aether Blue (Jonathan Evan)**
* Passionate Web3 & Blockchain Developer.
* Always learning and building in public.

Feel free to explore the code! If you have any feedback, please open an issue or reach out to me.