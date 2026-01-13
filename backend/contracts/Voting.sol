// SPDX-License-Identifier: MIT

pragma solidity ^0.8.28;

error Voting__AlreadyVoted();
error Voting__InvalidCandidate();
error Voting__NotOwner();
error Voting__ElectionEnded();
error Voting__ElectionStillOngoing();
error Voting__NoVoteCast();

contract Voting {
    event Voted(address indexed voter, uint256 indexed candidateIndex);
    event CandidateAdded(string name);

    struct Candidate {
        string name;
        uint256 voteCount;
    }

    Candidate[] public s_candidates;
    mapping(address => bool) public s_alreadyVoted;

    address public immutable i_owner;
    uint256 public s_endTime;

    modifier onlyOwner() {
        if (msg.sender != i_owner) {
            revert Voting__NotOwner();
        }
        _;
    }

    modifier electionActive() {
        if (block.timestamp >= s_endTime) {
            revert Voting__ElectionEnded();
        }
        _;
    }

    // Constructor receive duration in Minutes
    constructor(string[] memory _candidateNames, uint256 _durationInMinutes) {
        i_owner = msg.sender;
        s_endTime = block.timestamp + (_durationInMinutes * 1 minutes);

        for (uint256 i = 0; i < _candidateNames.length; i++) {
            s_candidates.push(Candidate({name: _candidateNames[i], voteCount: 0}));
        }
    }

    function addCandidate(string memory _name) public onlyOwner electionActive {
        s_candidates.push(Candidate({name: _name, voteCount: 0}));
        emit CandidateAdded(_name);
    }

    function vote(uint256 _candidateIndex) public electionActive {
        if (s_alreadyVoted[msg.sender]) {
            revert Voting__AlreadyVoted();
        }
        if (_candidateIndex >= s_candidates.length) {
            revert Voting__InvalidCandidate();
        }
        s_candidates[_candidateIndex].voteCount++;
        s_alreadyVoted[msg.sender] = true;

        emit Voted(msg.sender, _candidateIndex);
    }

    function getWinner() public view returns (Candidate[] memory) {
        if (block.timestamp < s_endTime) {
            revert Voting__ElectionStillOngoing();
        }

        // Step 1: Find the highest voteCount
        uint256 highestVoteCount = 0;
        for(uint256 i = 0; i< s_candidates.length; i++) {
            if(s_candidates[i].voteCount > highestVoteCount) {
                highestVoteCount = s_candidates[i].voteCount;
            }
        }

        // If all of Candidate's voteCount is 0 
        if(highestVoteCount == 0) {
            revert Voting__NoVoteCast();
        }

        // Step 2: Find all candidates with the highest voteCount
        uint256 winnerCount = 0;
        for(uint256 i = 0; i < s_candidates.length; i++) {
            if(s_candidates[i].voteCount == highestVoteCount) {
                winnerCount++;
            }
        }

        // Step 3: Return all candidates with the highest voteCount
        Candidate[] memory winners = new Candidate[](winnerCount);
        uint256 index = 0;
        for(uint256 i = 0; i < s_candidates.length; i++) {
            if(s_candidates[i].voteCount == highestVoteCount) {
                winners[index] = s_candidates[i];
                index++;
            }
        }

        return winners;
    }

    function getAllCandidates() public view returns (Candidate[] memory) {
        return s_candidates;
    }

    function getRemainingTime() public view returns (uint256) {
        if(block.timestamp >= s_endTime) {
            return 0; // Time is over
        }
        return s_endTime - block.timestamp;
    }
}
