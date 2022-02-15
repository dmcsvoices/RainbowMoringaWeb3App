const API_URL_TT = 'https://api.coinpaprika.com/v1/coins';
const API_URL_1I = 'https://api.1inch.exchange/v3.0/1/tokens';

let OIA = [];


function renderCoinList(_coinArray){
    let $coinList10 = document.querySelector('.top10CoinList');
    //console.log(_coinArray);
    let index = 0;
    const limit = 10;
    for (let coinData of _coinArray) {
        //create the coin record
    
        if (index === limit) {break;}
        $coinList10.innerHTML += '<li>'+coinData+'</li>';
        //console.log(coinData)
        index ++;
    }
}




async function formSubmitted(event) {
    event.preventDefault();
    let [fromDecimals, fromAddress] = document.querySelector('[name=ddFromTickerList]').value.split('-');
    let [toDecimals, toAddress] = document.querySelector('[name=ddToTickerList]').value.split('-');


    const fromUnit = 10 ** fromDecimals;
    //const toUnit = 10 ** toDecimals;
    const decimalRatio = 10 ** (fromDecimals-toDecimals)

    const url = `https://api.1inch.exchange/v3.0/1/quote?fromTokenAddress=${fromAddress}&toTokenAddress=${toAddress}&amount=${fromUnit}`;
    //console.log(url);
    try {
        const response = await fetch(url);
        const quote = await response.json();
        const exchange_rate = Number(quote.toTokenAmount) / Number(quote.fromTokenAmount) * decimalRatio;
        let $resultSection = document.querySelector('[name=formResult]');
        $resultSection.innerHTML = `<p>1 ${quote.fromToken.symbol} = ${exchange_rate} ${quote.toToken.symbol}.</p><br><p>Estimated Gas Consumption: ${quote.estimatedGas}</p>`;
    }  
    catch (e) {console.log(e);}  

}


function renderForm(_oneInchCoinArray){

    let $selectOptionFrom = document.querySelector('.ddFromTickerList');
    let $selectOptionTo = document.querySelector('.ddToTickerList');
    //console.log(_coinArray);


    //the following line with the map function is the solution in the course. However, my solution is the for loop below it. 
    //the for loop is less elegant than the newer map function, but it makes sense in my head more than the map function does.
    
    /*const options = _oneInchCoinArray.map(token => 
        `<option value="${_oneInchCoinArray.address}">${_oneInchCoinArray.name} (${_oneInchCoinArray.symbol})</option>`);

    console.log(options.join(""));
        */
    for (let coinData of _oneInchCoinArray) {
        //console.log(coinData.address);
        $selectOptionFrom.innerHTML += `<option value="${coinData.decimals}-${coinData.address}">${coinData.name} (${coinData.symbol})</option>`;
        $selectOptionTo.innerHTML += `<option value="${coinData.decimals}-${coinData.address}">${coinData.name} (${coinData.symbol})</option>`;
        //console.log($selectOptionTo.innerHTML);
    }

    document.querySelector('.js-submit-quote')
        .removeAttribute('disabled');

    //set up the event handler for the click
    document
        .querySelector('.js-submit-quote')
        .addEventListener('click',formSubmitted);


}


function renderResult(_jsonResult){
    const estimatedGas = Object.values(_jsonResult.estimatedGas);
    console.log(estimatedGas);
}


async function getTop10Tokens(){

    try {
    const response = await fetch(API_URL_TT);
    const tokens = await response.json();
    return tokens.filter(token => token.rank >=1 && token.rank <=50).map(token => token.symbol);
    }  
    catch (e) {console.log(e);}  
}

async function get1inchTokens(){
    try {
    const response = await fetch(API_URL_1I);
    const tokens = await response.json();
    return tokens;// .filter(token => token.rank >=1 && token.rank <=10).map(token => token.symbol);   
    }  
    catch (e) {console.log(e);}  
}




async function get1inchCoinData(_coinList) {
    let coinArray = [];
        try{  
            // fetch the coin data from 1Inch by calling get1inchTokens()
            //let tokenList = await get1inchTokens();
            const response = await fetch(API_URL_1I);
            const tokens = await response.json();
            const tokenList = Object.values(tokens.tokens);
            //console.log(tokenList.filter(token => _coinList.includes(tokens.symbol)));
            let selectedCoins = tokenList.filter(token => _coinList.includes(token.symbol));  
            //console.log(selectedCoins);
            return selectedCoins;
        }  catch (e) {console.log(e);
        }  
        
    }
    
    


/* Authentication code */
async function login() {
    let user = Moralis.User.current();
    if (!user) {
      user = await Moralis.authenticate({ signingMessage: "Log in using Moralis" })
        .then(function (user) {
          console.log("logged in user:", user);
          console.log(user.get("ethAddress"));
        })
        .catch(function (error) {
          console.log(error);
        });
    }
  }
  
  async function logOut() {
    await Moralis.User.logOut();
    console.log("logged out");
  }
  
async function main() {
    try {
        let topTenCoinsList = await getTop10Tokens();
        let oneInchCoinArray = await get1inchCoinData(topTenCoinsList);
        

        renderCoinList(topTenCoinsList);
        renderForm(oneInchCoinArray);







    }  catch (e) {console.log(e);}  
}

main();
