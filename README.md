# 🗳️ Decentralized Voting Dapp

> **A transparent, secure, and verifiable voting system built on the Ethereum Blockchain.**

This project demonstrates a full-stack Web3 application where votes are recorded on-chain, ensuring that results are immutable, transparent, and tamper-proof. Unlike traditional voting systems, this DApp removes the need for a trusted third party—Code is Law.

---

## 🚧 Project Status

| Component | Status | Description |
| :--- | :---: | :--- |
| **Backend** | ✅ **Completed** | Smart Contract deployed to **Sepolia Testnet**, Verified, and Tested (100% coverage). |
| **Frontend** | ✅ **Completed** | Fully interactive UI built with Next.js, featuring real-time voting & wallet integration. |

---

## 💡 Why Blockchain Voting? (Web2 vs. Web3)

In a traditional (Web2) voting system, data is stored in a centralized database controlled by an administrator. This creates a single point of failure and requires voters to "trust" that the admin won't manipulate the data.

**This project solves that trust issue.**

| Feature | 🕸️ Traditional Web2 Voting | ⛓️ This Web3 DApp |
| :--- | :--- | :--- |
| **Data Storage** | Centralized Database (SQL/NoSQL). | **Decentralized Blockchain (Ethereum/Sepolia).** |
| **Transparency** | Opaque. Only admins see real-time data. | **Transparent.** Anyone can verify votes on Etherscan. |
| **Security** | Admin can modify/delete votes in the DB. | **Immutable.** Once a vote is cast, it cannot be changed. |
| **Trust** | Trust in *People/Authority*. | Trust in **Code & Cryptography**. |
| **Availability** | Server can go down or be hacked. | **Always On.** The blockchain never sleeps. |

---

## ✨ Key Features & Functions

This application is designed not just to be functional, but to provide a premium User Experience (UX) that bridges the gap between complex blockchain tech and everyday users.

### 🧠 Smart Contract Logic (The Brain)
* **One Person, One Vote:** Uses a strictly mapped tracking system to ensure a wallet address can only vote once.
* **Time-Locked Voting:** The contract enforces a strict start and end time. No votes are accepted after the deadline (Timestamp-based).
* **Public Verification:** Vote counts are public variables, allowing anyone to audit the results in real-time without needing an API key.

### 🎨 Frontend Experience (The Interface)
* **Smart "Anti-Draw" Logic:** Unlike basic tutorials, this DApp correctly handles tie results. If multiple candidates share the highest vote count, the system declares **all of them** as winners (Shared Title), ensuring fairness.
* **Suspense Reveal Animation:** To mimic the excitement of real-world election counts, the interface features a "Calculating..." suspense phase before revealing the winner.
* **Connection Guards:** The UI intelligently adapts based on the user's wallet status (Connected vs Disconnected) and loading states, preventing UI flickering or errors.
* **Real-Time Feedback:** Users get instant visual feedback (Toast notifications, button state changes) during the blockchain transaction process.

---

## 📂 Repository Structure

This repository acts as a monorepo containing both the Smart Contract and the User Interface.

### 1. [`/backend`](./backend)
Contains the Solidity Smart Contract, deployment scripts (Hardhat), and extensive Unit Tests.
* **Go here if you want to:** Run the Smart Contract, run tests, or deploy to a network.
* 👉 **[Read Backend Instructions & Documentation](./backend/README.md)**

### 2. [`/frontend`](./frontend)
Contains the Next.js User Interface, Tailwind styling, and Wagmi Web3 integration.
* **Go here if you want to:** Run the website locally (`npm run dev`) or check the UI code.
* 👉 **[Read Frontend Instructions & Documentation](./frontend/README.md)**

---

## 🛠️ Tech Stack

I used a modern, strict tech stack to ensure security, scalability, and code quality:

* **Blockchain Framework:** [Hardhat](https://hardhat.org/)
* **Smart Contract:** Solidity ^0.8.28
* **Frontend Framework:** [Next.js 14](https://nextjs.org/) (App Router)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/)
* **Web3 Integration:** [Wagmi](https://wagmi.sh/) & [Viem](https://viem.sh/)
* **Language:** TypeScript (Strict Typing)

---

## 👨‍💻 Author

**Aether Blue (Jonathan Evan)**
* Passionate Web3 & Blockchain Developer.
* Always learning and building in public.

Feel free to explore the code! If you have any feedback or suggestions, please open an issue or reach out to me.