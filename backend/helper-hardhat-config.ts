export interface NetworkConfigItem {
    name: string
    ethUsdPriceFeed?: string
    // vrfCoordinatorV2?: string
    gasLane?: string
    // mintFee: string
    callbackGasLimit?: string
    subscriptionId?: string
    candidateNames?: string[]
    votingDurationInMinutes?: number
}

export interface NetworkConfigInfo {
    [key: number]: NetworkConfigItem
}

export const networkConfig: NetworkConfigInfo = {
    31337: {
        name: "localhost",
        ethUsdPriceFeed: "0x694AA1769357215DE4FAC081bf1f309aDC325306",
        gasLane: "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c", // 30 gwei
        callbackGasLimit: "500000", // 500,000 gas
        candidateNames: ["Nathan", "Jane", "John"],
        votingDurationInMinutes: 5 // 5 minutes
    },
    11155111: {
        name: "sepolia",
        ethUsdPriceFeed: "0x694AA1769357215DE4FAC081bf1f309aDC325306",
        gasLane: "0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae", // VRF V2.5 Key Hash
        callbackGasLimit: "500000", // 500,000 gas
        subscriptionId: "72232460736917468856557922861862219231861494924548713121460096639181555670149",
        candidateNames: ["Nathan", "Jane", "John"],
        votingDurationInMinutes: 5 // 5 minutes
    },
}

export const DECIMALS = "18"
export const INITIAL_PRICE = "200000000000000000000"

export const developmentChains: string[] = ["hardhat", "localhost"]
