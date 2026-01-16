"use client"

import { ConnectButton, connectorsForWallets } from "@rainbow-me/rainbowkit"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card" // Import Shadcn Component
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

// Import from WAGMI
import {
    useReadContract,
    useChainId,
    useAccount,
    useBalance,
    useWriteContract,
    useWaitForTransactionReceipt,
} from "wagmi"
import { useEffect, useState } from "react" // Need this to refresh data after voting

// Import from Viem
import { parseEther } from "viem"

// Import JSON from Backend
// Make sure the path is correct with the your file location
import votingAbi from "@/constants/abi.json"
import contractAddresses from "@/constants/contractAddress.json"

// Interface for Typescript
interface ContractAddresses {
    [key: string]: string[]
}

export default function Home() {
    //////////////////////////
    // READ CONTRACT /////////
    /////////////////////////

    // READ ADDRESS ACOUNT USER
    const { address } = useAccount()

    // READ BALANCE USER
    const { data: userBalance } = useBalance({
        address: address,
    })

    // CHECK CHAIN ID USER
    const chainId = useChainId()

    // 2. TAKE ADDRESS BASE ON CHAIN ID
    const chainString = chainId?.toString() || ""
    const addresses = (contractAddresses as ContractAddresses)[chainString]
    const votingAddress = addresses
        ? addresses[addresses.length - 1]
        : undefined

    // DEBUG: Cek at the console, is the address correct?
    console.log("Current Chain ID:", chainString)
    console.log("Voting Address:", votingAddress)

    // READ 1: DATA CANDIDATES
    const {
        data: candidatesRaw,
        isLoading: isLoadingCandidates,
        refetch: refetchCandidates, // Change data voteCount without refresh the page
    } = useReadContract({
        address: votingAddress as `0x${string}`, // Typecasting to address format
        abi: votingAbi,
        functionName: "getAllCandidates", // public variable name from smart Contract
        query: {
            enabled: !!votingAddress, // Only read if there is an address
        },
    })

    // READ 2: USER STATUS (Have you ever voted?)
    const { data: alreadyVoted, refetch: refetchStatus } = useReadContract({
        address: votingAddress as `0x${string}`,
        abi: votingAbi,
        functionName: "s_alreadyVoted", // Mapping name in contract
        args: [address], // Check status for this address
        query: {
            enabled: !!votingAddress && !!address, // Only read if the address exist
        },
    })

    // READ 3: TAKE REMAINING TIME
    const { data: remainingTime } = useReadContract({
        address: votingAddress as `0x${string}`,
        abi: votingAbi,
        functionName: "getRemainingTime",
        query: {
            enabled: !!votingAddress,
        },
    })

    // MERGING DATA (Merge data from Blockchain and data from Metadata local)
    const displayCandidates = (candidatesRaw as any[])?.map(
        (candidate, index) => {
            // Usually, candidate is an array of objects: [name, voteCount]
            // Make sure the order is same as the contract/solidity
            return {
                id: index,
                name: candidate.name,
                voteCount: Number(candidate.voteCount),
            }
        },
    )
    console.log("Realtime Data:", displayCandidates)

    //////////////////////////
    // FOR COUNTDOWN /////////
    //////////////////////////

    // State to save time running backwards on the screen
    const [timeLeft, setTimeLeft] = useState<number>(0)

    // EFFECT 1: Set the initial time when data from the blockchain comes in
    useEffect(() => {
        if (remainingTime) {
            setTimeLeft(Number(remainingTime))
        }
    }, [remainingTime])

    // EFFECT 2: Run Countdown Timer every 1 second
    useEffect(() => {
        if (timeLeft <= 0) return

        const timerId = setInterval(() => {
            setTimeLeft((prevTime) => prevTime - 1)
        }, 1000) // 1000ms = 1 second

        return () => clearInterval(timerId) // Clean timer when switch page
    }, [timeLeft])

    // HELPER FOR FORMAT SECOND TO MINUTES:SECONDS (MM:SS)
    const formatTime = (seconds: number) => {
        if (seconds <= 0) return "Time's Up"
        const m = Math.floor(seconds / 60)
        const s = seconds % 60
        return `${m}:${s < 10 ? "0" : ""}${s}` // so that 09, 08, etc.
    }

    //////////////////////////
    // WRITE CONTRACT ///////
    ////////////////////////

    // SETUP HOOK
    const {
        data: hash,
        mutateAsync: writeContractAsync,
        isPending: isWritePending,
    } = useWriteContract()

    // WAIT FOR TRANSACTION (WAIT FOR MINING)
    const { isLoading: isConfirming, isSuccess: isConfirmed } =
        useWaitForTransactionReceipt({
            hash,
        })

    // HANDLE VOTE FUNCTION (USE ASYNC/WAIT)
    const handleVote = async (id: number) => {
        if (!votingAddress) return

        // Check user has connect to wallet
        if (!address) {
            toast.error("Please connect to your wallet first!", {
                duration: 5000,
            })
            return
        }

        // LOGIC: SAFE BALANCE TO VOTE, YOU MUST HAVE 0.005 ETH ATLEAST
        const minBalance = parseEther("0.005")

        // Check if there is the balance less than minBalance?
        const isBalanceInsufficient =
            userBalance && userBalance.value < minBalance

        // Check if time is up AND Check Balance of user
        if (timeLeft <= 0) {
            if (alreadyVoted) {
                // Chase: Time's up AND already voted
                toast.error("Time's up & You already voted! 🏁✅", {
                    description:
                        "Thankyou for your participation, but the time is up.",
                    duration: 5000,
                })
            } else {
                // Chase: Time's up AND (not already voted OR balance is zero)
                toast.error("You late! Time's Up 🏁🚫", {
                    description: isBalanceInsufficient
                        ? "Your balance is critically low, don't forget to top up for the next event. 💡" // Chase: Time's up AND balance is zero
                        : "Thankyou for your participation, but the time is up.", // Chase: Time's up AND not already voted
                    duration: 5000,
                })
            }
            return
        }

        // If already Voted
        if (alreadyVoted) {
            toast.error("STOP! You already voted! 🚫", {
                description: "1 wallet only vote once.",
                duration: 5000,
            })
            return // STOP AT THIS. Metamask will not open.
        }

        // Check if balance of account is Zero
        if (isBalanceInsufficient) {
            toast.error("Your balance is not enough to vote! 💸", {
                description:
                    "Minimum 0.005 ETH required. Please top up your balance to pay gas fee.",
                duration: 5000,
            })
            return
        }

        console.log(`Voting for candidate #${id}...`)

        // Show Toast Loading
        const loadingToast = toast.loading(
            "Requesting a signature in Wallet...",
        )

        try {
            // Wait for user to sign the transaction
            await writeContractAsync({
                address: votingAddress as `0x${string}`,
                abi: votingAbi,
                functionName: "vote",
                args: [BigInt(id)],
            })

            // Code below will run if transaction is successful
            toast.dismiss(loadingToast) // Delete Loading
            toast.info(
                "Transaction sent! Wait for Blockchain Confirmation... ⏳",
            )
        } catch (error: any) {
            toast.dismiss(loadingToast) // Delete Loading

            console.error("Failed to vote:", error)

            // LOGIC DETECTION SPESIFIC ERROR
            // Change error object to string
            const errorMessage = error.message || JSON.stringify(error)

            if (errorMessage.includes("User rejected")) {
                toast.warning("You rejected the transaction 😅", {
                    duration: 5000,
                })
            } else {
                toast.error("Failed to vote! ❌", {
                    description:
                        "Something went wrong at the network or contract.",
                    duration: 5000,
                })
            }
        }
    }

    // REFRESH PAGE (CHANGE VOTECOUNT DATA)
    useEffect(() => {
        if (isConfirmed) {
            toast.success("Vote Success Entered to Blockchain! 🎉", {
                description: "Thankyou for your participation.",
                duration: 5000, // 3 seconds
            })
            console.log("Take the new data...")
            refetchCandidates() // Change data VoteCount without refresh page
            refetchStatus() // Update "alreadyVoted" status to true
        }
    }, [isConfirmed, refetchCandidates, refetchStatus])

    // NEW STATE: FOR COUNT EFFECT TRANSITION
    const [isCalculating, setIsCalculating] = useState(false)

    // Trigger count animation when time's up
    useEffect(() => {
        if (timeLeft <= 0 && candidatesRaw) {
            setIsCalculating(true)
            // Let it Loading 3 seconds
            const timer = setTimeout(() => setIsCalculating(false), 3000)
            return () => clearTimeout(timer)
        }
    }, [timeLeft, candidatesRaw])

    // FINALLY: LOGIC FOR WINNER SORTING & DRAW CHECKER
    // Copy paste for array candidates so that array not messy
    // And then sort of voteCount (Descending)
    const sortedCandidates = [...((candidatesRaw as any[]) || [])].sort(
        (a, b) => {
            return Number(b.voteCount) - Number(a.voteCount)
        },
    )

    // Find out who is at the top (Highest Vote)
    const maxVotes =
        sortedCandidates.length > 0 ? sortedCandidates[0].voteCount : BigInt(0)

    // Filter: Who has the vote == maxVotes?
    const topWinners = sortedCandidates.filter((c) => c.voteCount === maxVotes)

    // Check if there is draw (multiple winners)
    const isDraw = topWinners.length > 1

    // For winner name string. Example: "Nathan" or "Nathan & Jane"
    const winnerNames = topWinners.map((c) => c.name).join(" & ")

    console.log("Status Data:", { candidatesRaw, sortedCandidates, timeLeft })

    const { isConnected } = useAccount()
    return (
        <main className="min-h-screen bg-slate-50 text-slate-900">
            <nav className="flex items-center justify-between border-b border-slate-200 bg-white px-8 py-6">
                <h1 className="text-2xl font-bold tracking-tighter text-blue-700">
                    🗳️ Voting Dapp
                </h1>
                <ConnectButton accountStatus="address" showBalance={false} />
            </nav>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-12">
                <div className="mb-12 text-center">
                    <h2 className="mb-4 text-4xl font-extrabold text-slate-800">
                        Choose Your Leader for the Future
                    </h2>
                    <p className="text-lg text-slate-500">
                        Use your voting rights transparently through Blockchain.
                    </p>

                    {/* Countdown Timer - ONLY SHOW IF WALLET HAS CONNECTED */}
                    {isConnected && (
                        <div className="mt-6 inline-block rounded-full border border-blue-200 bg-blue-50 px-6 py-3">
                            <span className="mr-2 font-semibold text-slate-600">
                                Time Left:
                            </span>
                            <span
                                className={`font-mono text-xl font-bold ${timeLeft <= 10 ? "animate-pulse text-red-600" : "text-blue-700"}`}
                            >
                                {formatTime(timeLeft)}
                            </span>
                        </div>
                    )}
                </div>

                {/* LOADING */}
                {isLoadingCandidates && (
                    <p className="animate-pulse text-center text-blue-500">
                        Fetching candidates from Blockchain...
                    </p>
                )}

                {/* Show message if there are not candidates yet */}
                {!isLoadingCandidates && displayCandidates?.length === 0 && (
                    <p className="text-center text-slate-400">
                        No candidates found. Please add candidates via Smart
                        Contract.
                    </p>
                )}

                {!isConnected ? (
                    // PHASE 0: NOT CONNECTED WALLET YET
                    // Show Message to Connect Wallet, Don't show Winner/Voting
                    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50 py-20">
                        <div className="mb-4 text-6xl">🔌</div>
                        <h2 className="text-2xl font-bold text-slate-700">
                            Wallet Not Connected
                        </h2>
                        <p className="mt-2 max-w-md text-center text-slate-500">
                            Please connect your wallet to view candidates and
                            participate in the voting process.
                        </p>
                    </div>
                ) : !candidatesRaw || (candidatesRaw as any[]).length === 0 ? (
                    // PHASE 0.5: CONNECTED, BUT STILL LOADING FOR BLOCKCHAIN SENT DATA TO FRONTEND/WAGMI
                    // This is "Guard" to prevent error blinking
                    <div className="flex animate-pulse flex-col items-center justify-center py-20">
                        <div className="mb-4 text-4xl">🔗</div>
                        <h2 className="text-xl font-bold text-slate-600">
                            Fetching Data from Blockchain...
                        </h2>
                        <p className="text-sm text-slate-400">
                            Synchronizing with Blockchain
                        </p>
                    </div>
                ) : timeLeft > 0 ? (
                    // PHASE 1: VOTING CONDITION
                    // GRID CANDIDATE CARD
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                        {displayCandidates?.map((candidate) => (
                            <Card
                                key={candidate.id}
                                className="flex-col justify-between border-slate-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                            >
                                <CardHeader className="bg-slate-100/50 p-4 text-center">
                                    <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-lg font-bold text-blue-700">
                                        #{candidate.id + 1}
                                    </div>
                                    <CardTitle className="text-2xl text-blue-900">
                                        {candidate.name}
                                    </CardTitle>
                                    <CardDescription>
                                        Official Candidate
                                    </CardDescription>
                                </CardHeader>

                                <CardContent className="pt-8 text-center">
                                    <div className="text-5xl font-extrabold text-slate-800">
                                        {candidate.voteCount}
                                    </div>
                                    <div className="mt-2 font-medium text-slate-400">
                                        Total Votes
                                    </div>
                                </CardContent>

                                <CardFooter className="pt-6">
                                    <Button
                                        className="h-12 w-full bg-blue-600 text-lg text-white hover:bg-blue-700"
                                        onClick={() => handleVote(candidate.id)}
                                        // Turn off the button when:
                                        // 1. Wait for sign transaction (isWritePending)
                                        // 2. Wait for mining (isConfirming)
                                        disabled={
                                            isWritePending || isConfirming
                                        }
                                    >
                                        Vote {candidate.name} ✋
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                ) : isCalculating ? (
                    // PHASE 2: TRANSITION (COUNTING VOTECOUNT)
                    // This is solution for the transition is not feel stiff
                    <div className="animate-in fade-in zoom-in flex flex-col items-center justify-center py-20 duration-500">
                        <div className="mb-6 animate-bounce text-6xl">🗳️</div>
                        <h2 className="animate-pulse text-3xl font-bold text-slate-700">
                            Calculating Results...
                        </h2>
                        <p className="mt-2 text-slate-500">
                            Verifying votes on Blockchain
                        </p>
                    </div>
                ) : (
                    // PHASE 3: THE FINAL RESULT (WINNER / DRAW VIEW)
                    <div className="mx-auto max-w-2xl">
                        <div className="animate-in fade-in zoom-in overflow-hidden rounded-3xl border-2 border-yellow-400 bg-white shadow-2xl duration-700">
                            {/* WINNER HEADER: CHANGE COLOR IF DRAW */}
                            <div
                                className={`bg-linear-to-r p-8 text-center text-white ${isDraw ? "from-purple-500 to-pink-500" : "from-yellow-500 to-orange-500"}`}
                            >
                                <div className="mb-4 animate-bounce text-6xl">
                                    {isDraw ? "🤝" : "🏆"}
                                </div>
                                <h2 className="mb-2 text-3xl font-bold">
                                    {isDraw
                                        ? "It's a Draw!"
                                        : "Voting Finished!"}
                                </h2>
                                <p
                                    className={`text-lg ${isDraw ? "text-purple-100" : "text-yellow-100"}`}
                                >
                                    {isDraw
                                        ? "The winner are"
                                        : "The winner is"}
                                </p>
                                <h1 className="mt-2 text-4xl leading-tight font-extrabold tracking-wide text-white uppercase drop-shadow-md">
                                    {winnerNames}
                                </h1>
                            </div>

                            {/* List Leaderboard */}
                            <div className="p-6">
                                <h3 className="mb-4 text-center text-sm font-bold tracking-wider text-slate-500 uppercase">
                                    Final Leaderboard
                                </h3>
                                <div className="space-y-4">
                                    {sortedCandidates.map(
                                        (candidate, index) => {
                                            // Check if this candidate is a winner (in case of Draw)
                                            const isWinner =
                                                candidate.voteCount === maxVotes
                                            return (
                                                <div
                                                    key={candidate.id ? candidate.id.toString() : index}
                                                    className={`item-center flex justify-between rounded-xl p-4 transition-all hover:scale-[1.02] ${isWinner ? `border ${isDraw ? "border-purple-200 bg-purple-50" : "border-yellow-200 bg-yellow-50"} shadow-md` : "border border-transparent bg-slate-50"}`}
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div
                                                            className={`flex h-10 w-10 items-center justify-center rounded-full text-lg font-bold shadow-sm ${isWinner ? (isDraw ? "bg-purple-500 text-white" : "bg-yellow-400 text-white") : "bg-slate-200 text-slate-500"}`}
                                                        >
                                                            {isWinner
                                                                ? isDraw
                                                                    ? "="
                                                                    : index + 1
                                                                : index + 1}
                                                        </div>
                                                        <div>
                                                            <h4
                                                                className={`text-lg font-bold ${isWinner ? "text-slate-800" : "text-slate-600"}`}
                                                            >
                                                                {candidate.name}
                                                            </h4>
                                                            {isWinner && (
                                                                <span
                                                                    className={`rounded-full px-2 py-0.5 text-xs font-bold ${isDraw ? "bg-purple-100 text-purple-600" : "bg-yellow-100 text-yellow-600"}`}
                                                                >
                                                                    {isDraw
                                                                        ? "🤝 DRAW"
                                                                        : "👑 WINNER"}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="block text-2xl font-bold text-slate-800">
                                                            {candidate.voteCount.toString()}
                                                        </span>
                                                        <span className="text-xs font-medium text-slate-400 uppercase">
                                                            Votes
                                                        </span>
                                                    </div>
                                                </div>
                                            )
                                        },
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </main>
    )
}
