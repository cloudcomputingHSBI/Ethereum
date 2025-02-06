// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract MultiElectionNFTVoting is ERC721, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdTracker;

    // **NFT Verwaltung**
    mapping(uint256 => uint256) private tokenToElection;
    mapping(uint256 => uint256[]) private electionToTokens;
    mapping(uint256 => bool) private electionMinted;

    // **Wahl Verwaltung**
    struct Candidate {
        string name;
        uint256 voteCount;
    }

    struct Election {
        string name;
        Candidate[] candidates;
        mapping(uint256 => bool) hasVoted;
        uint256 startTime;
        uint256 endTime;
        bool exists;
    }

    mapping(uint256 => Election) public elections;

    uint256 public electionCount;

    event ElectionCreated(uint256 electionId, string name);
    event Voted(uint256 electionId, uint256 tokenId, string candidateName);
    event NFTsMinted(uint256 electionId, address[] recipients);

    constructor() ERC721("ElectionNFT", "ENFT") {}

    /**
     * **Erstellt eine neue Wahl und mintet NFTs für die Wähler**
     */
    function createElection(
        string memory _name,
        string[] memory _candidateNames,
        uint256 _startTime,
        uint256 _endTime,
        address[] memory _recipients
    ) external onlyOwner returns (uint256) {
        require(_startTime < _endTime, "Start time must be before end time");
        require(_endTime > block.timestamp, "End time must be in the future");
        require(_recipients.length > 0, "Recipients list cannot be empty");

        electionCount++;
        uint256 electionId = electionCount;

        Election storage newElection = elections[electionId];
        newElection.name = _name;
        newElection.startTime = _startTime;
        newElection.endTime = _endTime;
        newElection.exists = true;

        for (uint256 i = 0; i < _candidateNames.length; i++) {
            newElection.candidates.push(
                Candidate({name: _candidateNames[i], voteCount: 0})
            );
        }

        emit ElectionCreated(electionId, _name);

        // NFTs minten (jetzt direkt innerhalb des Contracts)
        mintBatch(_recipients, electionId);

        return electionId; // Wahl-ID zurückgeben
    }

    /**
     * **Mintet mehrere NFTs für eine Wahl**
     * Wird automatisch bei `createElection` aufgerufen.
     */
    function mintBatch(
        address[] memory recipients,
        uint256 electionId
    ) private {
        require(
            !electionMinted[electionId],
            "NFTs for this election have already been minted"
        );

        electionMinted[electionId] = true;
        for (uint256 i = 0; i < recipients.length; i++) {
            _tokenIdTracker.increment();
            uint256 newItemId = _tokenIdTracker.current();
            tokenToElection[newItemId] = electionId;
            electionToTokens[electionId].push(newItemId);
            _mint(recipients[i], newItemId);
        }

        emit NFTsMinted(electionId, recipients);
    }

    /**
     * **Wähler gibt seine Stimme mit NFT-Token ab**
     */
    function vote(uint256 electionId, uint256 candidateIndex) external {
        Election storage election = elections[electionId];
        require(election.exists, "Election does not exist");
        require(
            block.timestamp >= election.startTime,
            "Voting has not started yet"
        );
        require(block.timestamp <= election.endTime, "Voting has ended");

        // Suche die Token-ID, die msg.sender für diese Wahl besitzt
        uint256 tokenId = getValidTokenForElection(msg.sender, electionId);
        require(tokenId != 0, "You do not have a valid NFT for this election");

        require(
            !election.hasVoted[tokenId],
            "This token has already voted in this election"
        );
        require(
            candidateIndex < election.candidates.length,
            "Invalid candidate index"
        );

        election.hasVoted[tokenId] = true;

        // **WICHTIG: Richtiger Zugriff auf das `storage`-Array**
        Candidate storage candidate = election.candidates[candidateIndex];
        candidate.voteCount++; // Jetzt wird die Änderung in `storage` gespeichert

        emit Voted(electionId, tokenId, candidate.name);
    }

    /**
     * **Ermittelt die gültige Token-ID einer Wallet für eine Wahl**
     * @param voter Die Wallet-Adresse des Wählers
     * @param electionId Die Wahl-ID
     * @return Die gültige Token-ID oder 0, falls keine gefunden wurde
     */
    function getValidTokenForElection(
        address voter,
        uint256 electionId
    ) public view returns (uint256) {
        uint256[] storage electionTokens = electionToTokens[electionId]; // Nur NFTs dieser Wahl prüfen

        for (uint256 i = 0; i < electionTokens.length; i++) {
            uint256 tokenId = electionTokens[i];
            if (ownerOf(tokenId) == voter) {
                return tokenId; // Erstes gültiges NFT zurückgeben
            }
        }
        return 0; // Falls kein passendes NFT gefunden wurde
    }

    /**
     * **Gibt die Wahl-ID eines NFTs zurück**
     */
    function getElectionId(uint256 tokenId) public view returns (uint256) {
        require(_exists(tokenId), "Token does not exist");
        return tokenToElection[tokenId];
    }

    /**
     * **Gibt Kandidaten für eine Wahl zurück**
     */
    function getCandidates(
        uint256 electionId
    ) external view returns (Candidate[] memory) {
        Election storage election = elections[electionId];
        require(election.exists, "Election does not exist");
        return election.candidates;
    }

    /**
     * **Gibt Start- & Endzeit der Wahl zurück**
     */
    function getElectionTimes(
        uint256 electionId
    ) external view returns (uint256, uint256) {
        Election storage election = elections[electionId];
        require(election.exists, "Election does not exist");
        return (election.startTime, election.endTime);
    }

    /**
     * **Gibt vollständige Wahldetails zurück**
     */
    function getElectionDetails(
        uint256 electionId
    )
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
        return (
            election.name,
            election.startTime,
            election.endTime,
            election.candidates
        );
    }
}
