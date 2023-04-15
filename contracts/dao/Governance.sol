// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/governance/Governor.sol";
import "@openzeppelin/contracts/governance/compatibility/GovernorCompatibilityBravo.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotes.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotesQuorumFraction.sol";
import "./ERC20Vote.sol";

contract GovernorVote is Governor, GovernorCompatibilityBravo, GovernorVotes, GovernorVotesQuorumFraction {
    constructor(IVotes _token)
    Governor("MyGovernor")
    GovernorVotes(_token)
    GovernorVotesQuorumFraction(4)
    {}

    function votingDelay() public pure override returns (uint256) {
        return 20; // 20 blocks
    }

    function votingPeriod() public pure override returns (uint256) {
        return 100; // 100 blocks
    }

    function proposalThreshold() public pure override returns (uint256) {
        return 0;
    }

    // The functions below are overrides required by Solidity.

    function state(uint256 proposalId)
    public
    view
    override(Governor, IGovernor)
    returns (ProposalState)
    {
        return super.state(proposalId);
    }

    function propose(address[] memory targets, uint256[] memory values, bytes[] memory calldatas, string memory description)
    public
    override(Governor, GovernorCompatibilityBravo)
    returns (uint256)
    {
        return super.propose(targets, values, calldatas, description);
    }

    function _execute(uint256 proposalId, address[] memory targets, uint256[] memory values, bytes[] memory calldatas, bytes32 descriptionHash)
    internal
    override(Governor)
    {
        super._execute(proposalId, targets, values, calldatas, descriptionHash);
    }

    function _cancel(address[] memory targets, uint256[] memory values, bytes[] memory calldatas, bytes32 descriptionHash)
    internal
    override(Governor)
    returns (uint256)
    {
        return super._cancel(targets, values, calldatas, descriptionHash);
    }

    function _executor()
    internal
    view
    override(Governor)
    returns (address)
    {
        return super._executor();
    }

    function supportsInterface(bytes4 interfaceId)
    public
    view
    override(Governor, IERC165)
    returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    // override unused functions
    function proposalEta(uint256) public pure override returns (uint256) {
        return 0;
    }

    function timelock() public pure override returns (address) {
        return address(0x0);
    }

    function queue(
        address[] memory,
        uint256[] memory,
        bytes[] memory,
        bytes32
    ) public pure override returns (uint256) {
        return 0;
    }
}

contract DAO is GovernorVote {
    constructor() GovernorVote(new MyERC20VoteToken()) {
        IERC20(address(token)).transfer(msg.sender, 1e22); // 10000 tokens
    }
}