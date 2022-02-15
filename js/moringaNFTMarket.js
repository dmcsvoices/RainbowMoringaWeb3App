

Moralis.initPlugins()
.then(()=>console.log('Plugins Have Initialized'));



const $tokenBalanceTBody = document.querySelector('#token-balance');  
const $mainnet_nftListTBody = document.querySelector('#mainnet-nft-list');
//const $rinkeby_nftListTBody = document.querySelector('#rinkeby-nft-list');
const $login_message = document.querySelector('#login-message');
const $userLoggedInSection = document.querySelector('#user-logged-in-section');

//$rinkeby_nftListTBody.innerHTML = "";
const OPTIONS_PRODUCT = { address: "0x2c162dd5d99e93b16c1c9cd17fcb9bd246328553", chain :"rinkeby"};
const OPTIONS_PRODUCT_POLYGON_MUMBAI = { address: "0xd6f28235889057cdfc6c7853e207a4fdd3a8afd6", chain :"mumbai"};
const OPTIONS_TARSIER = { address:"0xf3a1473abc511b34db62311f0f83ebf5e83c5eaf", chain: "rinkeby"};

const PRODUCT_NFT_CONTRACT_ADDRESS = '0x2c162dd5d99e93b16c1c9cd17fcb9bd246328553';
const TARSIER_NFT_CONTRACT_ADDRESS = "0xf3a1473abc511b34db62311f0f83ebf5e83c5eaf";




document.querySelector('#btn-login').addEventListener('click', login);
document.querySelector('#btn-logout').addEventListener('click', logOut);


document.querySelector('#btn-buycrypto').addEventListener('click', buyCrypto);



async function fetchTarsierNFTMetadata(NFTs){
    console.log("In fetchTarsierNFTMeta");
    console.log(NFTs);
    let promises = [];
  
    for (let i = 0; i < NFTs.length; i++) { 
    //    console.log("in for loop");
        let nft = NFTs[i];
        let id = nft.token_id;
        //call Moralis cloud function  -> Static JSON file
       promises.push(fetch(TARSIER_METADATA_QUERY + id)
            .then(res => res.json())
            .then(res => JSON.parse(res.result))
            .then(res => {nft.metadata = res})
            .then(() => {return nft;}))
    }
    return Promise.all(promises);
  }
  
async function fetchProductNFTMetadata(NFTs){
    console.log("In fetchProductNFTMeta");
    //console.log(NFTs);
    let promises = [];
  
    for (let i = 0; i < NFTs.length; i++) { 
    //    console.log("in for loop");
        let nft = NFTs[i];
        let id = nft.token_id;
        //call Moralis cloud function  -> Static JSON file
       promises.push(fetch(PRODUCT_METADATA_QUERY + id)
            .then(res => res.json())
            .then(res => JSON.parse(res.result))
            .then(res => {nft.metadata = res})
            .then(() => {return nft;}))
    }
    return Promise.all(promises);
  }
  

async function renderNFTList(options){
            //the following code gets Metadata tokens in my contract at the below address on the rikeby network
            console.log("in renderNFTList");
            let parent = document.getElementById("app");
            console.log(options);
            let tokenIDs = await Moralis.Web3API.token.getAllTokenIds(options);
            console.log(tokenIDs);
            let tokenArray = tokenIDs.result;
            console.log(tokenArray);

            let NFTWithMetadata = (options.address === TARSIER_NFT_CONTRACT_ADDRESS) ? await fetchTarsierNFTMetadata(tokenArray) : await fetchProductNFTMetadata(tokenArray);
            
            
            for (let index = 0; index< NFTWithMetadata.length; index++){
                //console.log(thisToken);
                console.log(NFTWithMetadata[index].token_id);
                
                console.log(NFTWithMetadata);

                let htmlString = `
                <div class="card">
                    <img class="card-img-top" src=${NFTWithMetadata[index].metadata.image}>
                    <div class="card-body">
                        
                        <h5 class="card-title">${NFTWithMetadata[index].metadata.name}</h5>
                        <h6 class="card-text">Description: ${NFTWithMetadata[index].metadata.description}</h6>
                        <h6 class="card-text">Network: ${options.chain}</h6>
                        <h6 class="card-text">Token Address: ${options.address}</h6>
                        <h6 class="card-text">Amount: ${NFTWithMetadata[index].amount}</h6>
                        <a href="/mint.html?nftAddress=${options.address}&nftId=${NFTWithMetadata[index].token_id}" class="btn btn-sm btn-outline-primary">Mint</a>
                        
                    </div>
                </div>   
                <br>    
                `;

                let col = document.createElement("div");
                col.className = "col-sm-8"
                col.innerHTML = htmlString;
                parent.appendChild(col);

                
            }


            //console.log(options.address);

            
            //let NFTWithMetadata = await fetchNFTMetadata(tokenIDs.result);
            
            
    

}

async function login() {
    let user = Moralis.User.current();
    if (!user) {
      user = await Moralis.authenticate();
    }
    console.log("logged in user:", user);
    $login_message.innerHTML = `You are logged`;
    $userLoggedInSection.removeAttribute('hidden');
    renderNFTList(OPTIONS_TARSIER);
    renderNFTList(OPTIONS_PRODUCT);
    
    renderNFTList(OPTIONS_PRODUCT_POLYGON_MUMBAI);
    //getStats();
  }
    
  
async function logOut() {
    await Moralis.User.logOut();
    //$mainnet_nftListTBody.innerHTML = '';
    //$rinkeby_nftListTBody.innerHTML = '';
    //$tokenBalanceTBody.innerHTML = '';
    let parent = document.getElementById("app");
    parent.innerHTML="";
    $login_message.innerHTML = `Log in with Metamask`;
    $userLoggedInSection.setAttribute('hidden', '');
    console.log("logged out");
  }
  
  /*Functionality  buy , quote, swap*/
async function buyCrypto() {
    Moralis.Plugins.fiat.buy();
  
  }
  