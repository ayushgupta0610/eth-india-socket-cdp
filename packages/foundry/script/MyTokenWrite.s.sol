// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/Console.sol";
import {MyTokenDeployer} from "../src/MyTokenDeployer.sol";
import {MyTokenAppGateway} from "../src/MyTokenAppGateway.sol";

contract MyTokenWrite is Script {
    address user = makeAddr("user");

    function run() external {
        string memory socketRPC = vm.envString("SOCKET_RPC");
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        vm.createSelectFork(socketRPC);

        MyTokenDeployer deployer = MyTokenDeployer(vm.envAddress("MY_TOKEN_DEPLOYER"));
        MyTokenAppGateway gateway = MyTokenAppGateway(vm.envAddress("MY_TOKEN_APP_GATEWAY"));

        address myTokenForwarderArbitrumSepolia = deployer.forwarderAddresses(deployer.myToken(), 421614);
        address myTokenForwarderOptimismSepolia = deployer.forwarderAddresses(deployer.myToken(), 11155420);
        address myTokenForwarderBaseSepolia = deployer.forwarderAddresses(deployer.myToken(), 84532);
        address myTokenForwarderSepolia = deployer.forwarderAddresses(deployer.myToken(), 11155111);

        console.log("myTokenForwarderArbitrumSepolia: ", myTokenForwarderArbitrumSepolia);
        console.log("myTokenForwarderOptimismSepolia: ", myTokenForwarderOptimismSepolia);
        console.log("myTokenForwarderBaseSepolia: ", myTokenForwarderBaseSepolia);
        console.log("myTokenForwarderSepolia: ", myTokenForwarderSepolia); // NOT WORKING | Currently the service is not up

        // Frontend interface will decide the apt chain for user to claim their airdrop on
        // instead of user trying to figure it out.

        // Based on a specific condition (let's say the cheapest claim possible currently) the myTokenForwarder instance would be selected

        // vm.startBroadcast(user);
        // gateway.claimAirdrop(selectedMyTokenForwarder);
    }
}
