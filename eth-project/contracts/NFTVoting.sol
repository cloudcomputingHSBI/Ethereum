// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * Minimal-Interface eines ERC721-Contracts (NFT),
 * um nur 'balanceOf' abzufragen.
 */
interface IERC721 {
    function balanceOf(address owner) external view returns (uint256);
}

contract NFTVoting {
    // Informationen zu einem Kandidaten
    struct Candidate {
        string name;      // z.B. "Alice"
        uint256 voteCount;
    }

    // Array von Kandidaten
    Candidate[] public candidates;

    // Mapping, das speichert, ob eine gehashte Adresse schon gewählt hat
    mapping(bytes32 => bool) public hasVoted;

    // Contract-Adresse des NFTs (z.B. dein MyNFT)
    IERC721 public nftContract;

    // Start- und Endzeit der Abstimmung (in Unix-Timestamps)
    uint256 public startTime;
    uint256 public endTime;

    // Event, um Abstimmungen zu protokollieren
    event Voted(address voter, string candidateName);

    /**
     * @param _candidateNames  Liste der Kandidatennamen als Strings.
     * @param _nftContract     Adresse eines deployed NFT-Contracts (ERC721).
     * @param _startTime       Startzeit der Abstimmung (Unix-Timestamp).
     * @param _endTime         Endzeit der Abstimmung (Unix-Timestamp).
     */
    constructor(string[] memory _candidateNames, address _nftContract, uint256 _startTime, uint256 _endTime) {
        require(_startTime < _endTime, "Start time must be before end time");
        require(_endTime > block.timestamp, "End time must be in the future");

        nftContract = IERC721(_nftContract);
        startTime = _startTime;
        endTime = _endTime;

        for (uint256 i = 0; i < _candidateNames.length; i++) {
            candidates.push(Candidate({
                name: _candidateNames[i],
                voteCount: 0
            }));
        }
    }

    /**
     * Abgeben einer Stimme für einen Kandidaten.
     * - Das aufrufende Wallet muss ein NFT besitzen,
     * - Darf noch nicht gewählt haben (gehashte Adresse),
     * - Die Abstimmung muss innerhalb des festgelegten Zeitraums sein,
     * - Index des Kandidaten muss gültig sein.
     */
    function vote(uint256 candidateIndex) external {
        require(block.timestamp >= startTime, "Voting has not started yet");
        require(block.timestamp <= endTime, "Voting has ended");
        require(nftContract.balanceOf(msg.sender) > 0, "You do not own the required NFT");
        
        // Berechne den Hash der Adresse
        bytes32 voterHash = keccak256(abi.encodePacked(msg.sender));
        require(!hasVoted[voterHash], "You have already voted");
        require(candidateIndex < candidates.length, "Invalid candidate index");

        // Speichere, dass der Hash dieser Adresse gewählt hat
        hasVoted[voterHash] = true;
        candidates[candidateIndex].voteCount++;

        emit Voted(msg.sender, candidates[candidateIndex].name);
    }

    /**
     * Liefert (Name, Stimmenanzahl) aller Kandidaten zurück.
     * Kann zum Beispiel in deinem UI angezeigt werden.
     */
    function getCandidates() external view returns (Candidate[] memory) {
        return candidates;
    }
}
