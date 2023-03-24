// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract BFS {
	mapping(address => mapping(string => mapping(uint256 => bytes))) public dataStorage;
	mapping(address => mapping(string => uint256)) public chunks; // max chunk index

	function store(string memory filename, uint256 chunkIndex, bytes memory _data) external {
		dataStorage[msg.sender][filename][chunkIndex] = _data;
		if (chunks[msg.sender][filename] < chunkIndex) {
			chunks[msg.sender][filename] = chunkIndex;
		}
	}

	function load(address addr, string memory filename, uint256 chunkIndex) public view returns (bytes memory, int256) {
		uint256 temp = chunkIndex + 1;
		int256 nextChunk = (temp > chunks[addr][filename]) ? -1 : int256(temp);
		return (dataStorage[addr][filename][chunkIndex], nextChunk);
	}

	function count(address addr, string memory filename) public view returns (uint256) {
		return chunks[addr][filename];
	}

}
