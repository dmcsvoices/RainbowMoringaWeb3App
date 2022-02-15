pragma solidity ^0.8.0;

//Import ERC1155 token contract from OpenZeppelin

//import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC1155/ERC1155.sol";
//import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol";
import "@openzeppelin/contracts@4.4.2/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts@4.4.2/access/Ownable.sol";

contract RainbowMoringaNFTContract is ERC1155, Ownable {


// here we have the IDS of the various types of NFTs we will have
// The idea is each unit of product physical produced will mint one NFT of the corresponding token id below

    uint256 public constant TARSIER_0 = 0;
    

    constructor() ERC1155("https://bbc7yyktissb.usemoralis.com/{id}.json") {  
        _mint(msg.sender, TARSIER_0, 1, "");
    }
    

    function mint(address account, uint256 id, uint256 amount) public onlyOwner {
        _mint(account, id, amount, "");
    }

    function burn(address account, uint256 id, uint256 amount) public {
        require(msg.sender == account);
        _burn(account, id, amount);
    }






}