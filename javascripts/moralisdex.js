//var express = require('express');

const OPTIONS_PRODUCT = { address: "0x2c162dd5d99e93b16c1c9cd17fcb9bd246328553", chain :"rinkeby"};
const OPTIONS_PRODUCT_POLYGON_MUMBAI = { address: "0xd6f28235889057cdfc6c7853e207a4fdd3a8afd6", chain :"mumbai"};
const OPTIONS_TARSIER = { address:"0xf3a1473abc511b34db62311f0f83ebf5e83c5eaf", chain: "rinkeby"};

const PRODUCT_NFT_CONTRACT_ADDRESS = "0x2c162dd5d99e93b16c1c9cd17fcb9bd246328553";
const TARSIER_NFT_CONTRACT_ADDRESS = "0xf3a1473abc511b34db62311f0f83ebf5e83c5eaf";
const PRODUCT_NFT_CONTRACT_ADDRESS_2 = "0x0A70442b89Bf4e551bff041B133649ffCd5981aa";
const CONTRACT_NFT_UNKNOWN = "0x421DaDA0810C7Fb13d8348108A01C841e49F28D1";



Moralis.initPlugins()
  .then(()=>console.log('Plugins Have Initialized'));

const $tokenBalanceTBody = document.querySelector('#token-balance');  
const $mainnet_nftListTBody = document.querySelector('#mainnet-nft-list');
const $rinkeby_nftListTBody = document.querySelector('#rinkeby-nft-list');
const $mumbai_nftListTBody = document.querySelector('#mumbai-nft-list');

const $selectedToken = document.querySelector('.js-from-token');
const $amountInput = document.querySelector('.js-from-amount');
const $userLoggedInSection = document.querySelector('#user-logged-in-section');


/* Login logout and Init */
document.querySelector('#btn-login').addEventListener('click', login);
document.querySelector('#btn-logout').addEventListener('click', logOut);

async function login() {
  let user = Moralis.User.current();
  if (!user) {
    user = await Moralis.authenticate();
  }
  console.log("logged in user:", user);
  getStats();
}
  
async function logOut() {
  await Moralis.User.logOut();
  $mainnet_nftListTBody.innerHTML = '';
  $rinkeby_nftListTBody.innerHTML = '';
  $mumbai_nftListTBody.innerHTML = '';
  $tokenBalanceTBody.innerHTML = '';
  $userLoggedInSection.setAttribute('hidden', '');
  document.querySelector('.js-quote-container').innerHTML = "";
  console.log("logged out");
}

async function initSwapForm(event){

  event.preventDefault();
  console.log(event.target.dataset.symbol);
  
  //set the selectedToken fields to the values from the button which was pressed. 
  $selectedToken.innerText = event.target.dataset.symbol;
  $selectedToken.dataset.symbol = event.target.dataset.symbol;
  $selectedToken.dataset.address = event.target.dataset.address;
  $selectedToken.dataset.decimals = event.target.dataset.decimals;
  $selectedToken.dataset.max = event.target.dataset.max;
   
  $amountInput.value = '';
  document.querySelector('.js-submit').removeAttribute('disabled');
  document.querySelector('.js-cancel').removeAttribute('disabled');
  $amountInput.removeAttribute('disabled');
  document.querySelector('.js-quote-container').innerHTML = '';
}  


function renderTokenDropDown(tokens) {
  console.log(tokens);
  
  const options = tokens.map(token => `
    <option value="${token.address}-${token.decimals}">
      ${token.name} 
    </option>
  `).join('');
  document.querySelector('[name=to-token]').innerHTML = options;

}

/*Functionality  buy , quote, swap*/

document.querySelector('#btn-buycrypto').addEventListener('click', buyCrypto);

async function buyCrypto() {
  Moralis.Plugins.fiat.buy();

}

async function formSubmitted(event){
  
  event.preventDefault();

  
  const fromAmount = Number.parseFloat($amountInput.value);
  //console.log(fromAmount);
  const fromMaxValue = Number.parseFloat($selectedToken.dataset.max);
  
  //validate the fromAmount input
    if ( Number.isNaN(fromAmount)||fromAmount > fromMaxValue) {
    //invalid input
    //document.querySelector('.js-amount-error').innerText = '';
    document.querySelector('.js-quote-container').innerHTML =  `
    <p class="error">An invalid amount has been entered. Please try again.</p>
  `;
    return;
  } else {
    document.querySelector('.js-amount-error').innerText = '';
  }

  const valArray = document.querySelector('[name=to-token]').value.split('-');

  //getting the values for the Moralis quote  call
  const fromTokenDecimals = $selectedToken.dataset.decimals;
  const fromTokenAddress = $selectedToken.dataset.address;
  const toTokenAddress = valArray[0];
  const amount = Moralis.Units.Token(fromAmount,fromTokenDecimals).toString();
 
  console.log(fromTokenAddress);
  console.log(fromTokenDecimals);
  console.log(toTokenAddress);
  console.log(amount);
  
  //call the API and create the innerHTML from the response
  try{
      const quote = await Moralis.Plugins.oneInch.quote({
        chain: 'eth', // The blockchain you want to use (eth/bsc/polygon)
        fromTokenAddress: fromTokenAddress, // The token you want to swap
        toTokenAddress: toTokenAddress, // The token you want to receive
        amount : amount,
      });
      console.log(quote);      
      const toAmount = tokenValue(quote.toTokenAmount, valArray[1]);
      document.querySelector('.js-quote-container').innerHTML = `
        <p class="font-weight-bold">Quote:</p>
        <p>${fromAmount} ${quote.fromToken.symbol} = ${toAmount}  ${quote.toToken.symbol} </p>
        <p>
          Gas Fee: ${quote.estimatedGas} Wei
          </P>
      `;
  } catch(e) {
    document.querySelector('.js-quote-container').innerHTML =  `
      <p class="error">The Conversion didn't succeed.</p>
    `;
  }
}


function formCanceled(event){
  event.preventDefault();
  document.querySelector('.js-submit').setAttribute('disabled', '');
  document.querySelector('.js-cancel').setAttribute('disabled', '');
  document.querySelector('.js-quote-container').innerHTML = '';
  $amountInput.setAttribute('disabled', ''); 
  $amountInput.value = '';
  document.querySelector('.js-amount-error').innerText = '';
  delete $selectedToken.dataset.address;
  delete $selectedToken.dataset.decimals;
  delete $selectedToken.dataset.symbol;
}


document.querySelector('.js-cancel').addEventListener('click', formCanceled);
document.querySelector('.js-submit').addEventListener('click', formSubmitted);


async function cancel(event){

}

/* Utilty Functions*/

//convert from Wei using custom function
const tokenValue = (value, decimals) =>   (decimals ? value / Math.pow(10, decimals) : value);


async function getTop10Tokens(){

  const API_URL_TT = 'https://api.coinpaprika.com/v1/coins';

  try {
  const response = await fetch(API_URL_TT);
  const tokens = await response.json();
  return tokens
      .filter(token => token.rank >=1 && token.rank <=10)
      .map(token => token.symbol);
  }  
  catch (e) {console.log(e);}  
}





async function get1inchCoinData(_coinList) {
  
  //const API_URL_1I = 'https://api.1inch.exchange/v3.0/137/tokens';
  const API_URL_1I = 'https://api.1inch.exchange/v3.0/1/tokens';
      try{  
          const response = await fetch(API_URL_1I);
          const tokens = await response.json();
          /*const tokens = await Moralis.Plugins.oneInch.getSupportedTokens({
            chain: 'eth', // The blockchain you want to use (eth/bsc/polygon)
          });*/
          const tokenList = Object.values(tokens.tokens);
          //console.log(tokenList);
          return tokenList.filter(token => _coinList.includes(token.symbol));  
          
      }  catch (e) {console.log(e);
      }  
      
  }
  
/*
async function getSupportedTokens() {
  const tokens = await Moralis.Plugins.oneInch.getSupportedTokens({
    chain: 'bsc', // The blockchain you want to use (eth/bsc/polygon)
  });
  console.log(tokens);
}*/


async function getOpenSeaImageURL(_uri) {
  //const API_URL_OPENSEA = 'https://api.opensea.io/api/v1/metadata/0x495f947276749Ce646f68AC8c248420045cb7b5e/0xcbc5ee8b78298e2f93bb0dff166a39cf15990ffc000000000000070000000001';
  try {
  const response = await fetch(_uri);
  const nft = await response.json();
  return nft.image;
  }  
  catch (e) {console.log(e);}  
}

async function getNftImage(imageUrl) {
  try {
    const nftImage = await fetch(imageUrl);
    return nftImage;
    }  
    catch (e) {console.log(e);}  
}


async function getTokenMetadataFromURI(token_uri) {
  try {
    const metadata = await fetch(token_uri);
    return metadata;
    }  
    catch (e) {console.log(e);}  
}

async function fetchTarsierNFTMetadata(NFTs){
  //console.log("In fetchTarsierNFTMeta",NFTs);
 
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
 //console.log("In fetchProductNFTMeta", NFTs);
  
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


async function renderNFT(_tokenAddress,_tokenId,_chain){

  console.log("in renderNFTList",_tokenAddress,_tokenId,_chain);
  let thisTokenId = parseInt(_tokenId);
  let options = {address: _tokenAddress,  chain: _chain};
  let tokenIDs = await Moralis.Web3API.token.getAllTokenIds(options);
  let tokenArray = tokenIDs.result;

  if (_tokenAddress.toLowerCase().localeCompare(TARSIER_NFT_CONTRACT_ADDRESS.toLowerCase()) === 0) {
    NFTWithMetadata = await fetchTarsierNFTMetadata(tokenArray);
  }

  if (_tokenAddress.toLowerCase().localeCompare(PRODUCT_NFT_CONTRACT_ADDRESS.toLowerCase()) === 0) {
    NFTWithMetadata = await fetchProductNFTMetadata(tokenArray);
  }

  if (_tokenAddress.toLowerCase().localeCompare(PRODUCT_NFT_CONTRACT_ADDRESS_2.toLowerCase()) === 0) {
    NFTWithMetadata = await fetchProductNFTMetadata(tokenArray);
  }

  if (_tokenAddress.toLowerCase().localeCompare(CONTRACT_NFT_UNKNOWN.toLowerCase()) === 0) {
    NFTWithMetadata = await fetchProductNFTMetadata(tokenArray);
  }


  if (NFTWithMetadata.length === 1) {
    $rinkeby_nftListTBody.innerHTML +=  `
          <div class="card">
              <img class="card-img-top" src=${NFTWithMetadata[0].metadata.image}>
              <div class="card-body">
                  
                  <h5 class="card-title">${NFTWithMetadata[0].metadata.name}</h5>
                  <h6 class="card-text">Description: ${NFTWithMetadata[0].metadata.description}</h6>
                  <h6 class="card-text">Network: ${options.chain}</h6>
                  <h6 class="card-text">Token Address: ${options.address}</h6>
                  <h6 class="card-text">Amount: ${NFTWithMetadata[0].amount}</h6>
                  
              </div>
          </div>   
          <br>    
          `;
  } else {  
    for (let index = 0; index< NFTWithMetadata.length; index++){
      if (parseInt(NFTWithMetadata[index].token_id) === thisTokenId) {
        $rinkeby_nftListTBody.innerHTML +=  `
          <div class="card">
              <img class="card-img-top" src=${NFTWithMetadata[index].metadata.image}>
              <div class="card-body">
                  
                  <h5 class="card-title">${NFTWithMetadata[index].metadata.name}</h5>
                  <h6 class="card-text">Description: ${NFTWithMetadata[index].metadata.description}</h6>
                  <h6 class="card-text">Network: ${options.chain}</h6>
                  <h6 class="card-text">Token Address: ${options.address}</h6>
                  <h6 class="card-text">Amount: ${NFTWithMetadata[index].amount}</h6>
                  
              </div>
          </div>   
          <br>    
          `;
      }
    }
  }
}



  async function getStats() {
    
    console.log('getStats')
    //const options = { chain: 'polygon'};
    $userLoggedInSection.removeAttribute('hidden');
    
      
        
        

        
/*Try to get the the NFTs*/
      try { 

        
        // get testnet NFTs for user
        
        const testnetNFTs = await Moralis.Web3API.account.getNFTs({ chain: 'rinkeby' });
        let testnetNFTsMetaDataArray = testnetNFTs.result;
        console.log("Getstats: getting rinkeby testnet nfts",testnetNFTsMetaDataArray);
        
        for (let i = 0; i < testnetNFTsMetaDataArray.length; i++) {
            renderNFT(testnetNFTsMetaDataArray[i].token_address,testnetNFTsMetaDataArray[i].token_id,'rinkeby');
          }


        //get mumbai testnet NFTs for user

       
        const mumbaitestnetNFTs = await Moralis.Web3API.account.getNFTs({ chain: 'mumbai' });
        let mumbaitestnetNFTsMetaDataArray = mumbaitestnetNFTs.result;
        console.log("getting mumbai testnet nfts", mumbaitestnetNFTsMetaDataArray);
        
        for (let i = 0; i < mumbaitestnetNFTsMetaDataArray.length; i++) {
            let meta = JSON.parse(mumbaitestnetNFTsMetaDataArray[i].metadata);
            $mumbai_nftListTBody.innerHTML += `
            <div class="card">
              <div class="card-body">
                <img src=${meta.image} class="card-img-top"> 
                <h5 class="card-title">${meta.name}</h5>
                <h6 class="card-text">Description:${meta.description}</h6>
              </div>
            </div>    
            <br>   
            `;
          }

        // get Mainnet NFTs for user
        console.log("getting mainnet nfts");
        const mainnetNFTs = await Moralis.Web3API.account.getNFTs({ chain: 'eth' });
        let mainnetNFTsMetaDataArray = mainnetNFTs.result;
        console.log(mainnetNFTsMetaDataArray);

        for (let i = 0; i < mainnetNFTsMetaDataArray.length; i++) {
          let meta = JSON.parse(mainnetNFTsMetaDataArray[i].metadata);
          $mainnet_nftListTBody.innerHTML += `
          <div class="card">
          <div class="card-body">
            <img src=${meta.image} class="card-img-top"> 
            <h5 class="card-title">${meta.name}</h5>
            <h6 class="card-text">Description:${meta.description}</h6>
          </div>
        </div>       
        <br>
        `;
        }


      } catch (e) {console.log(e);}  

/*Try to get the NativeBalance on the main chain*/

      try {
        const nativeBalances = await Moralis.Web3API.account.getNativeBalance();
        //console.log("getting nativeBalancecs");
        //console.log(nativeBalances);
        $tokenBalanceTBody.innerHTML = `
          <tr>
            <td>1</td>
            <td>ETH (Mainnet)</td>
            <td>${Moralis.Units.FromWei(nativeBalances.balance, 18)}</td>
          </tr>       
        `;
      } catch (e) {console.log(e);} 

/*Try to get the NativeBalance on the Rinkeby chain*/

      try {
        const rinkeybyoptions = { chain: "rinkeby"};
        const nativeBalances = await Moralis.Web3API.account.getNativeBalance(rinkeybyoptions);
        //console.log("getting  rinkeby nativeBalancecs");
        //console.log(nativeBalances);
        $tokenBalanceTBody.innerHTML += `
          <tr>
            <td>1</td>
            <td>ETH (rinkeby)</td>
            <td>${Moralis.Units.FromWei(nativeBalances.balance, 18)}</td>
          </tr>       
        `;
      } catch (e) {console.log(e);}       


/*Try to get the NativeBalance on the Mumbai chain*/

try {
  const mumbaioptions = { chain: "mumbai"};
  const nativeBalances = await Moralis.Web3API.account.getNativeBalance(mumbaioptions);
  console.log("mumbai nativeBalancecs");
  console.log(nativeBalances);
  $tokenBalanceTBody.innerHTML += `
    <tr>
      <td>1</td>
      <td>MATIC (mumbai)</td>
      <td>${Moralis.Units.FromWei(nativeBalances.balance, 18)}</td>
    </tr>       
  `;
} catch (e) {console.log(e);}         

/*Try to get the Mainnet Token Balances*/
      try {
        const balances = await Moralis.Web3API.account.getTokenBalances( {chain: 'eth'});
        //console.log(balances);
        //console.log("getting tokenBalancecs");
        $tokenBalanceTBody.innerHTML += balances.map((token, index) => `
            <tr scope="row">
              <td>${index +2}</td>
              <td>${token.symbol}</td>
              <td>${tokenValue(token.balance, token.decimals)}</td>
              <td>
                <button 
                  class="js-swap btn btn-outline-success"
                  data-address="${token.token_address}"
                  data-symbol="${token.symbol}"
                  data-decimals="${token.decimals}"
                  data-max="${tokenValue(token.balance, token.decimals)}"
                >
                  Swap
                </button> 
              </td>
            </tr>
          `).join('');

          for (let $btn of $tokenBalanceTBody.querySelectorAll('.js-swap')) {
            $btn.addEventListener('click', initSwapForm);
          }

      } catch (e) {console.log(e);}  

/*Try to get the Rinkeby Token Balances*/
try {
  const balances = await Moralis.Web3API.account.getTokenBalances( {chain: 'rinkeby'});
  console.log(balances);
  console.log("getting tokenBalancecs");
  $tokenBalanceTBody.innerHTML += balances.map((token, index) => `
      <tr scope="row">
        <td>${index +2}</td>
        <td>${token.symbol}</td>
        <td>${tokenValue(token.balance, token.decimals)}</td>
        <td>
          <button 
            class="js-swap btn btn-outline-success"
            data-address="${token.token_address}"
            data-symbol="${token.symbol}"
            data-decimals="${token.decimals}"
            data-max="${tokenValue(token.balance, token.decimals)}"
          >
            Swap
          </button> 
        </td>
      </tr>
    `).join('');

    for (let $btn of $tokenBalanceTBody.querySelectorAll('.js-swap')) {
      $btn.addEventListener('click', initSwapForm);
    }

} catch (e) {console.log(e);}  

  }    





  getTop10Tokens()
    .then(get1inchCoinData)
    .then(renderTokenDropDown);