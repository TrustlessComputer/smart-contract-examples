// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract BNS is ERC721 {

        using Counters for Counters.Counter;
        Counters.Counter private _tokenIds;

        mapping(bytes => uint256) public registry;
        mapping(bytes => bool) public registered;

        mapping(uint256 => address) public resolver;

        constructor() ERC721("Bitcoin Name System", "BNS") {}

        function register(address owner, bytes memory name) 
                public 
                returns (uint256) 
        {
                require(!registered[name]);

                uint256 id = _tokenIds.current();
                _mint(owner, id);
                registry[name] = id;
                registered[name] = true;
                resolver[id] = owner;

                _tokenIds.increment();
                return id;
        }

        function map(uint256 tokenId, address to) public {
                require(msg.sender == ownerOf(tokenId));
                resolver[tokenId] = to;
        }
}
