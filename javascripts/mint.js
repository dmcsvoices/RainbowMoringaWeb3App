Moralis.initPlugins();
//.then(()=>console.log('Plugins Have Initialized'));

const PRODUCT_NFT_CONTRACT_ADDRESS = "0x2c162dd5d99e93b16c1c9cd17fcb9bd246328553";
const PRODUCT_NFT_CONTRACT_ADDRESS_POLYGON_MUMBAI = "0xd6f28235889057cdfc6c7853e207a4fdd3a8afd6";
const TARSIER_NFT_CONTRACT_ADDRESS = "0xf3a1473abc511b34db62311f0f83ebf5e83c5eaf";



let web3Js;
let polyWeb3Js;
let Accounts;
let nftAddress;

async function init(){
    console.log("mint  init");
    let currentuser = Moralis.User.current();
    
    if(!currentuser){
        window.location.pathname = "/moringaNFTMarket.html";
    }

    await Moralis.enableWeb3();
    web3Js = new Web3(Moralis.provider);
    console.log(web3Js);
    //let accounts = currentuser.accounts;

    polyWeb3Js = new Web3(new Web3.providers.HttpProvider(URL_POLYGON_NODE))
    console.log(polyWeb3Js);

    Accounts = await web3Js.eth.getAccounts();
    console.log(Accounts);
    const urlParams = new URLSearchParams(window.location.search);
    const nftId = urlParams.get("nftId");
    nftAddress = urlParams.get("nftAddress");
    console.log(nftAddress);
    
    document.getElementById('token_id_input').value = nftId;
    document.getElementById('sender_address_input').value = Accounts[0];
    document.getElementById('token_address_input').value = nftAddress; 
    document.getElementById('receiver_address_input').value = "";
    document.querySelector('#submit_mint_eth').addEventListener('click', mint);
    document.querySelector('#submit_mint_poly').addEventListener('click', mintPoly);
    document.querySelector('#submit_transfer').addEventListener('click', transfer);
    document.querySelector('#submit_burn').addEventListener('click', burnRinkeby);

    
}

async function mint(){
    console.log("mint");
    //let web3 = new Web3(Moralis.provider);
    //let web3Js = new Web3(Moralis.provider);
    let accounts = await web3Js.eth.getAccounts();
    console.log(accounts[0]);

    let tokenId = parseInt(document.querySelector("#token_id_input").value);
    let address = document.querySelector("#token_address_input").value;
    let tokenAddress = nftAddress;
    let amount = parseInt(document.querySelector("#amount_input").value);
    
    const contract = new web3Js.eth.Contract(rinkeyContractAbi,tokenAddress);
    console.log(contract);
    contract.methods.mint(address, tokenId, amount).send({from:accounts[0], value: 0})
        .on("receipt",function(receipt){
            alert("Mint Done");
        });


//need to make the mint function able to switch between networks

}

async function mintPoly(){
    console.log("mintPoly");
    //let web3 = new Web3(Moralis.provider);
    //let web3Js = new Web3(Moralis.provider);
    let accounts = await web3Js.eth.getAccounts();
    console.log(accounts[0]);

    let tokenId = parseInt(document.querySelector("#token_id_input").value);
    let address = document.querySelector("#sender_address_input").value;
    let tokenAddress = nftAddress;
    let amount = parseInt(document.querySelector("#amount_input").value);
    
    const contract = new web3Js.eth.Contract(mumbaiContractAbi,tokenAddress);
    console.log(contract);
    contract.methods.mint(address, tokenId, amount).send({from:accounts[0], value: 0})
        .on("receipt",function(receipt){
            alert("Mint Done");
        });



}

async function transfer(){
    let tokenId = document.querySelector("#token_id_input").value;
    let address = document.getElementById('receiver_address_input').value;
    let amount = parseInt(document.querySelector("#amount_input").value);

    const options = { type: "erc1155",
        receiver: address,
        contract_address: nftAddress, 
        token_id: tokenId,
        amount : amount
    }
    console.log(options);
    let result = await Moralis.transfer(options);    
}


async function burnRinkeby(){
    console.log("mint");
    //let web3 = new Web3(Moralis.provider);
    //let web3Js = new Web3(Moralis.provider);
    let accounts = await web3Js.eth.getAccounts();
    console.log(accounts[0]);

    let tokenId = parseInt(document.querySelector("#token_id_input").value);
    let address = document.querySelector("#token_address_input").value;
    let tokenAddress = nftAddress;
    let amount = parseInt(document.querySelector("#amount_input").value);
    
    const contract = new web3Js.eth.Contract(rinkeyContractAbi,tokenAddress);
    console.log(contract);
    contract.methods.mint(address, tokenId, amount).send({from:accounts[0], value: 0})
        .on("receipt",function(receipt){
            alert("Mint Done");
        });


//need to make the mint function able to switch between networks

}

init();

