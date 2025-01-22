// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

// Beinhaltet Standard-Implementierung von ERC721 (NFT) aus OpenZeppelin
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract MyNFT is ERC721 {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdTracker;

    constructor() ERC721("MyNFT", "MNFT") {
        // Name = "MyNFT", Symbol = "MNFT"
    }

    /**
     * Einfaches Minten eines neuen NFTs an 'to'.
     */
    function mint(address to) public {
        // Erhöht den Token-Counter um 1
        _tokenIdTracker.increment();
        uint256 newItemId = _tokenIdTracker.current();

        // Ruft die interne _mint-Funktion des ERC721-Standards auf
        _mint(to, newItemId);
    }
}
