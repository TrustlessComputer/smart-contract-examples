// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract Ordinals is ERC721 {

        using Counters for Counters.Counter;
        Counters.Counter private _inscriptionNumbers;

        mapping(uint256 => bytes) public inscriptions;

        constructor() ERC721("Ordinals", "ORD") {}

        function inscribe(address owner, bytes memory inscription) 
                public 
                returns (uint256) 
        {
                uint256 num = _inscriptionNumbers.current();
                _mint(owner, num);
                inscriptions[num] = inscription;

                _inscriptionNumbers.increment();
                return num;
        }
}
