// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

//Import ERC1155 token contract from OpenZeppelin

//import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC1155/ERC1155.sol";
//import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol";
import "@openzeppelin/contracts@4.4.2/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts@4.4.2/access/Ownable.sol";

contract RainbowMoringaProductNFTContract is ERC1155, Ownable {


// here we have the IDS of the various types of NFTs we will have
// The idea is each unit of product physical produced will mint one NFT of the corresponding token id below

    
    uint256 public constant MORINGA_POWDER_3_OZ = 0;
    uint256 public constant MORINGA_POWDER_8_OZ = 1;
    uint256 public constant MORINGA_PILLS_90 = 2;
    uint256 public constant MORINGA_PILLS_180 = 3;
    
    constructor() ERC1155("https://zdodwubns3kk.usemoralis.com/{id}.json") {
        _mint(msg.sender, MORINGA_PILLS_90, 1, "");
    }
    

    function mint(address account, uint256 id, uint256 amount) public onlyOwner {
        _mint(account, id, amount, "");
    }

    function burn(address account, uint256 id, uint256 amount) public {
        require(msg.sender == account);
        _burn(account, id, amount);
    }






}