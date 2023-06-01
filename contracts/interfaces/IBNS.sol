// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

// interface for BNS contract 
interface IBNS is IERC721 {
    event NameRegistered(bytes name, uint256 indexed id);
    function register(address owner, bytes memory name) external payable returns (uint256);
    function registerBatch(address owner, bytes[] memory names) external;
    function map(uint256 tokenId, address to) external;
    function minRegistrationFee() external view returns (uint256);
    function registry(bytes memory name) external view returns (uint256);
    function registered(bytes memory name) external view returns (bool);
    function resolver(uint256 tokenId) external view returns (address);
}

