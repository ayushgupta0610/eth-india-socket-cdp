// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

import {MyToken} from "./MyToken.sol";
import {AppDeployerBase, FeesData} from "@socket/contracts/base/AppDeployerBase.sol";

contract MyTokenDeployer is AppDeployerBase {
    bytes32 public myToken = _createContractId("myToken");

    constructor(
        address addressResolver_,
        FeesData memory feesData_,
        string memory name_,
        string memory symbol_,
        uint8 decimals_
    ) AppDeployerBase(addressResolver_) {
        creationCodeWithArgs[myToken] =
            abi.encodePacked(type(MyToken).creationCode, abi.encode(name_, symbol_, decimals_));
        _setFeesData(feesData_);
    }

    function deployContracts(uint32 chainSlug) external async {
        _deploy(myToken, chainSlug);
    }

    function initialize(uint32 chainSlug) public override async {}
}
