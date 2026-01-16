# 🗳️ Voting Dapp - Frontend

This directory contains the **User Interface (UI)** for the Decentralized Voting Application. It is built using the latest web technologies to ensure a fast, responsive, and seamless Web3 experience.

The application connects directly to the **Sepolia Testnet** via the user's wallet (MetaMask, etc.) to read voting data and submit transactions in real-time.

---

## 🛠️ Tech Stack & Tools

We used a strict, modern stack to ensure type safety and performance:

| Category | Technology | Why we used it? |
| :--- | :--- | :--- |
| **Framework** | **[Next.js 14](https://nextjs.org/)** | Used the **App Router** structure for better performance and SEO. |
| **Language** | **[TypeScript](https://www.typescriptlang.org/)** | Ensures type safety, preventing "undefined" errors before they happen. |
| **Styling** | **[Tailwind CSS](https://tailwindcss.com/)** | Rapid UI development with utility-first classes and responsive design. |
| **Web3 Hooks** | **[Wagmi](https://wagmi.sh/)** | React Hooks for Ethereum. Handles wallet connection, state, and contract interaction. |
| **Blockchain Library** | **[Viem](https://viem.sh/)** | A lightweight, low-level alternative to Ethers.js, used internally by Wagmi for speed. |
| **Wallet Connection** | **[Reown AppKit](https://reown.com/)** | (Formerly Web3Modal) Provides the polished "Connect Wallet" UI and QR code support. |

---

## ✨ Key Features & UX Decisions

This is not just a basic voting form. It includes several **Premium User Experience (UX)** features:

### 1. 🔐 Connection Guards
The UI intelligently adapts based on the user's status.
* **Disconnected:** Hides sensitive voting data and timers. Shows a prompt to connect.
* **Loading:** Shows a "Fetching Data..." skeleton to prevent UI flickering.
* **Connected:** Reveals the full dashboard and real-time timer.

### 2. ⏳ Suspense Reveal Animation
Instead of abruptly showing the winner when the timer hits 0:00, the app triggers a **3-second "Calculating Results..." animation**. This mimics the suspense of a real election count before revealing the final verdict.

### 3. ⚖️ Fair "Anti-Draw" Logic
Most basic tutorials fail to handle ties (draws). This DApp includes smart logic to detect if multiple candidates share the highest vote count.
* **Scenario:** If Nathan and Jane both have 5 votes.
* **Result:** The app declares **"It's a Tie!"** and displays **both names** as winners, rather than arbitrarily picking the first one in the array.

### 4. ⚡ Real-Time Feedback
* **Toast Notifications:** Alerts users when a transaction is submitted and confirmed.
* **Dynamic Timer:** Counts down continuously and switches to "Time's Up" state automatically.

---

## 🚀 Getting Started

Follow these instructions to run the Frontend locally.

### 1. Prerequisites
* **Node.js** (v18 or newer)
* **MetaMask** (or any Web3 Wallet) installed in your browser.
* A **Project ID** from [Reown Cloud](https://cloud.reown.com/) (Free).

### 2. Installation
Navigate to the frontend folder and install dependencies:

```bash
cd frontend
yarn install
```
### 3. Environment Setup (Crucial!)
Create a file named `.env` in the root of the `frontend` folder. Do not commit this file to GitHub.

```bash
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID="YOUR_PROJECT_ID_HERE"
```

### 4. Run the App
Start the development server:

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📂 Project Structure

```bash
frontend/
├── app/
│   ├── layout.tsx       # Main layout & Web3 Providers wrapper
│   ├── page.tsx         # The Core Logic (Voting, Timer, Winner View)
│   └── globals.css      # Tailwind imports
├── components/
│   ├── ui/              # Reusable UI components (Cards, Buttons)
│   └── Providers.tsx    # Wagmi & QueryClient Configuration
├── constants/
│   └── abi.ts           # Smart Contract ABI (Interface)
├── public/              # Static assets (Icons, Images)
├── .env.local           # Environment Variables (Ignored by Git)
└── ...
```

---

## 🐛 Troubleshooting
- **"Project ID is not defined"**: Make sure you created the `.env` file and restarted the server (`yarn dev`).
- **"Contract not found"**: Ensure your MetaMask is connected to the Sepolia Testnet (or the network where you deployed the contract).
- **"Hydration Error"**: This usually happens if `Date` or `Timer` logic runs on the server differently than the client. We handled this by using `useEffect` for all timer logic.