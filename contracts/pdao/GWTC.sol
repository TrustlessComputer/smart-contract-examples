// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20VotesComp.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Wrapper.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

error TransferFailed();
error TransferTokenFailed();
error WrapTokenFailed();


// wrapped ERC20 with Voting support
contract GWTC is ERC20VotesComp, ERC20Wrapper, Ownable {
	string public constant NAME = "Governance Wrapped TC";
	string public constant SYMBOL = "GWTC";

	constructor(
		address token
	) ERC20(NAME, SYMBOL) ERC20VotesComp() ERC20Wrapper(IERC20(token)) ERC20Permit(NAME) {}

	function _afterTokenTransfer(
		address from,
		address to,
		uint256 amount
	) internal virtual override(ERC20, ERC20Votes) {
		ERC20Votes._afterTokenTransfer(from, to, amount);
	}

	function delegates(address account) public view override returns (address) {
        address temp = super.delegates(account);
        return temp == address(0) ? account : temp;
    }

	function _mint(address to, uint256 amount) internal virtual override(ERC20, ERC20Votes) {
		ERC20Votes._mint(to, amount);
	}

	function _burn(address to, uint256 amount) internal virtual override(ERC20, ERC20Votes) {
		ERC20Votes._burn(to, amount);
	}

	function decimals() public view virtual override(ERC20, ERC20Wrapper) returns (uint8) {
		return 18;
	}

	function recover(address account) public virtual onlyOwner returns (uint256) {
		return _recover(account);
	}

	receive() external payable {
		(bool success,) = address(underlying).call{ value: msg.value }("");
		if (!success) {
			revert TransferFailed();
		}
		_mint(msg.sender, msg.value);
	}
}

