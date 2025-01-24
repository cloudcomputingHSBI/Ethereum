// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * Minimal-Interface eines ERC721-Contracts (NFT),
 * um 'ownerOf' und 'getElectionId' abzufragen.
 */
interface IERC721 {
    function ownerOf(uint256 tokenId) external view returns (address);
    function getElectionId(uint256 tokenId) external view returns (uint256);
}

contract MultiElectionNFTVoting {
    struct Candidate {
        string name;
        uint256 voteCount;
    }

    struct Election {
        string name;
        Candidate[] candidates;
        mapping(uint256 => bool) hasVoted; // Mapping, ob ein Token abgestimmt hat
        uint256 startTime;
        uint256 endTime;
        bool exists;
    }

    mapping(uint256 => Election) public elections;
    uint256 public electionCount;

    IERC721 public nftContract;

    event ElectionCreated(uint256 electionId, string name);
    event Voted(uint256 electionId, uint256 tokenId, string candidateName);

    constructor(address _nftContract) {
        nftContract = IERC721(_nftContract);
    }

    function createElection(
        string memory _name,
        string[] memory _candidateNames,
        uint256 _startTime,
        uint256 _endTime
    ) external {
        require(_startTime < _endTime, "Start time must be before end time");
        require(_endTime > block.timestamp, "End time must be in the future");

        electionCount++;
        Election storage newElection = elections[electionCount];
        newElection.name = _name;
        newElection.startTime = _startTime;
        newElection.endTime = _endTime;
        newElection.exists = true;

        for (uint256 i = 0; i < _candidateNames.length; i++) {
            newElection.candidates.push(Candidate({
                name: _candidateNames[i],
                voteCount: 0
            }));
        }

        emit ElectionCreated(electionCount, _name);
    }

    function vote(uint256 electionId, uint256 candidateIndex, uint256 tokenId) external {
        Election storage election = elections[electionId];
        require(election.exists, "Election does not exist");
        require(block.timestamp >= election.startTime, "Voting has not started yet");
        require(block.timestamp <= election.endTime, "Voting has ended");

        // Überprüfen, ob der Absender der Besitzer des Tokens ist
        require(nftContract.ownerOf(tokenId) == msg.sender, "You do not own this token");

        // Überprüfen, ob der Token für diese Wahl gültig ist
        require(nftContract.getElectionId(tokenId) == electionId, "This token is not valid for this election");

        // Überprüfen, ob der Token bereits abgestimmt hat
        require(!election.hasVoted[tokenId], "This token has already voted in this election");
        require(candidateIndex < election.candidates.length, "Invalid candidate index");

        // Markiere den Token als abgestimmt
        election.hasVoted[tokenId] = true;
        election.candidates[candidateIndex].voteCount++;

        emit Voted(electionId, tokenId, election.candidates[candidateIndex].name);
    }

    function getCandidates(uint256 electionId) external view returns (Candidate[] memory) {
        Election storage election = elections[electionId];
        require(election.exists, "Election does not exist");
        return election.candidates;
    }

    function getElectionTimes(uint256 electionId) external view returns (uint256, uint256) {
        Election storage election = elections[electionId];
        require(election.exists, "Election does not exist");
        return (election.startTime, election.endTime);
    }

    function getElectionDetails(uint256 electionId)
        external
        view
        returns (
            string memory name,
            uint256 startTime,
            uint256 endTime,
            Candidate[] memory candidates
        )
    {
        Election storage election = elections[electionId];
        require(election.exists, "Election does not exist");
        return (election.name, election.startTime, election.endTime, election.candidates);
    }
}
