// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

// Beinhaltet Standard-Implementierung von ERC721 (NFT) und Ownable aus OpenZeppelin
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract MyNFT is ERC721, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdTracker;

    constructor() ERC721("MyNFT", "MNFT") {
        // Der Besitzer des Contracts ist automatisch der Ersteller des Contracts
    }

    /**
     * Mintet ein neues NFT. Nur der Contract-Besitzer kann diese Funktion aufrufen.
     */
    function mint(address to) public onlyOwner {
        // Erhöht den Token-Counter um 1
        _tokenIdTracker.increment();
        uint256 newItemId = _tokenIdTracker.current();

        // Ruft die interne _mint-Funktion des ERC721-Standards auf
        _mint(to, newItemId);
    }
}
