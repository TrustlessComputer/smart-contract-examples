// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract Multisend {
  using SafeMath for uint256;
  using SafeERC20 for IERC20;

  function multisend(address payable[] calldata _addresses, uint256[] calldata _amounts)
  payable external returns(bool)
  {
    require(_addresses.length == _amounts.length);
    require(_addresses.length <= 255);
    uint256 _value = msg.value;
    for (uint8 i; i < _addresses.length; i++) {
      _value = _value.sub(_amounts[i]);

      _addresses[i].call{ value: _amounts[i] }(""); // will not revert if one of the transfers failed
    }
    return true;
  }
}