// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/governance/GovernorUpgradeable.sol";
import "./GovernorCompatibilityBravoUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/governance/extensions/GovernorVotesUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/governance/extensions/GovernorVotesQuorumFractionUpgradeable.sol";

error ZeroValue();

contract TCDAO is GovernorUpgradeable, GovernorCompatibilityBravoUpgradeable, GovernorVotesUpgradeable, GovernorVotesQuorumFractionUpgradeable {
    bytes32 public constant PROPOSAL_HASH = keccak256("proposal");

    function deposit() external payable {
        if (msg.value == 0) revert ZeroValue();

        // do nothing
    }


    function initialize(IVotesUpgradeable _token) external initializer {
        __Governor_init("TCDAO");
        __GovernorVotes_init(_token);
        __GovernorVotesQuorumFraction_init(50);
    }

    function votingDelay() public pure override returns (uint256) {
        return 1008; // 7 days
    }

    function votingPeriod() public pure override returns (uint256) {
        return 144; // 1 day
    }

    function proposalThreshold() public pure override returns (uint256) {
        return 1e26 * 25 / 10000; // 0.25% of 10M TC
    }

    function quorumVotes() public pure override returns (uint256) {
        return 1e26 * 2 / 100; // 2% of 10M TC
    }

    // The functions below are overrides required by Solidity.

    function quorum(uint256 blockNumber)
    public
    view
    override(IGovernorUpgradeable, GovernorVotesQuorumFractionUpgradeable)
    returns (uint256)
    {
        return super.quorum(blockNumber);
    }

    function state(uint256 proposalId)
    public
    view
    override(GovernorUpgradeable, IGovernorUpgradeable)
    returns (ProposalState)
    {
        return super.state(proposalId);
    }

    function propose(address[] memory targets, uint256[] memory values, bytes[] memory calldatas, string memory description)
    public
    override(GovernorUpgradeable, GovernorCompatibilityBravoUpgradeable)
    returns (uint256)
    {
        return super.propose(targets, values, calldatas, description);
    }

    function _execute(uint256 proposalId, address[] memory targets, uint256[] memory values, bytes[] memory calldatas, bytes32 descriptionHash)
    internal
    override(GovernorUpgradeable)
    {
        super._execute(proposalId, targets, values, calldatas, descriptionHash);
    }

    function _cancel(address[] memory targets, uint256[] memory values, bytes[] memory calldatas, bytes32 descriptionHash)
    internal
    override(GovernorUpgradeable)
    returns (uint256)
    {
        return super._cancel(targets, values, calldatas, descriptionHash);
    }

    function _executor()
    internal
    view
    override(GovernorUpgradeable)
    returns (address)
    {
        return super._executor();
    }

    function supportsInterface(bytes4 interfaceId)
    public
    view
    override(GovernorUpgradeable, IERC165Upgradeable)
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

    function _quorumReached(uint256 proposalId)
    internal
    view
    virtual
    override(GovernorCompatibilityBravoUpgradeable, GovernorUpgradeable)
    returns (bool)
    {
        return super._forVotes(proposalId) >= quorumVotes();
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