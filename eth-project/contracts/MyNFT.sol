// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract MyNFT is ERC721, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdTracker;

    // Mapping: Token-ID -> Wahl-ID
    mapping(uint256 => uint256) private tokenToElection;

    constructor() ERC721("MyNFT", "MNFT") {}

    /**
     * Mintet ein neues NFT und ordnet es einer Wahl zu.
     * Nur der Contract-Besitzer kann diese Funktion aufrufen.
     * @param to Adresse, die das NFT erhalten soll.
     * @param electionId ID der Wahl, zu der dieses NFT gehört.
     */
    function mint(address to, uint256 electionId) public onlyOwner {
        // Erhöht den Token-Counter um 1
        _tokenIdTracker.increment();
        uint256 newItemId = _tokenIdTracker.current();

        // Weist dem neuen Token eine Wahl-ID zu
        tokenToElection[newItemId] = electionId;

        // Mintet das NFT
        _mint(to, newItemId);
    }

    /**
     * Gibt die Wahl-ID zurück, zu der ein spezifisches NFT gehört.
     * @param tokenId Die ID des Tokens.
     * @return Die zugeordnete Wahl-ID.
     */
    function getElectionId(uint256 tokenId) public view returns (uint256) {
        require(_exists(tokenId), "Token does not exist");
        return tokenToElection[tokenId];
    }
}
