// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/governance/GovernorUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/cryptography/EIP712Upgradeable.sol";

contract GovernanceHelper is EIP712Upgradeable {

    constructor() initializer {
        __EIP712_init("TCDAO", "1");
    }

    bytes32 public constant BALLOT_TYPEHASH = keccak256("Ballot(uint256 proposalId,uint8 support)");
    bytes32 public constant PROPOSAL_HASH = keccak256("proposal");

    function _buildSignProposal(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        string memory description
    ) view public returns (bytes32) {
        // do nothing
        return _hashTypedDataV4(keccak256(abi.encode(PROPOSAL_HASH, targets, values, calldatas, description)));
    }

    function _buildSignProposalEncodeAbi(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        string memory description
    ) pure public returns (bytes memory) {
        // do nothing
        return abi.encode(PROPOSAL_HASH, targets, values, calldatas, description);
    }

    function _buildSignVoteEncodeAbi(
        uint256 proposalId,
        uint8 support
    ) pure public returns (bytes memory) {
        // do nothing
        return abi.encode(BALLOT_TYPEHASH, proposalId, support);
    }

    function _buildSignProposalEncodeAbi(
        bytes32 hash,
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        string memory description
    ) pure public returns (bytes memory) {
        // do nothing
        return abi.encode(hash, targets, values, calldatas, description);
    }
}