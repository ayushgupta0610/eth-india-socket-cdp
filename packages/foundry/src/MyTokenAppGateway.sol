// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.24;
// Updated pragma version to not include SafeMath for claimAirdrop function

import {AppGatewayBase, FeesData} from "@socket/contracts/base/AppGatewayBase.sol";
import {Ownable} from "solady/auth/Ownable.sol";
import {MyToken} from "./MyToken.sol";

// MyTokenAppGateway needs to be designed in such a manner that the storage lies here primarily - so that the read becomes optimised
contract MyTokenAppGateway is AppGatewayBase, Ownable {
    mapping(address => uint256) public airdropReceivers;

    constructor(address _addressResolver, address deployerContract_, FeesData memory feesData_)
        AppGatewayBase(_addressResolver)
        Ownable()
    {
        addressResolver.setContractsToGateways(deployerContract_);
        _setFeesData(feesData_);
    }

    function addAirdropReceivers(address[] calldata receivers_, uint256[] calldata amounts_) external onlyOwner {
        for (uint256 i = 0; i < receivers_.length; i++) {
            airdropReceivers[receivers_[i]] = amounts_[i];
        }
    }

    function claimAirdrop(address _instance) external async {
        uint256 amount = airdropReceivers[msg.sender];
        airdropReceivers[msg.sender] = 0;
        MyToken(_instance).mint(msg.sender, amount); // _instance - this is the forwarder address (MyToken instance deployed on a specific chainSlug)
    }

    // Your read operations from the MyToken will go here. Based on the chain's read data value, only the most optimal value can be returned
    // or all the various return values of the read operation from various chains and then the user can decide on which chain he/she would like to execute the write operation
}
