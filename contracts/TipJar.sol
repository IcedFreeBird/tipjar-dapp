// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract TipJar {
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "You are not owner");
        _;
    }

    function tip() public payable {
        require(msg.value > 0, "You should send a tip to use this function");
    }

    function withdraw() public onlyOwner {
        uint256 contractBalance = address(this).balance;
        require(contractBalance > 0, "There are no tips to withdraw");
        payable(owner).transfer(contractBalance);
    }

    function getBalance() public view onlyOwner returns (uint256) {
        return address(this).balance;
    }
}
