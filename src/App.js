import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
import React, { useEffect, useState } from "react";
import { ethers } from 'ethers';
import WhiskeyNFT from './utils/WhiskeyNFT.json'

// Constants
const TWITTER_HANDLE = 'whiskey_network';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const OPENSEA_LINK = '';
const TOTAL_MINT_COUNT = 50;

  //Deployed contract address
  //every time contract is deployed, this AND abi needs to be updated
  const CONTRACT_ADDRESS = "0x4614241A05582e87a90068c4D8e78084312E9640"; 

const App = () => {

  //TODO: Ensure user connected to right network
//   let chainId = await ethereum.request({ method: 'eth_chainId' });
// console.log("Connected to chain " + chainId);

// // String, hex code of the chainId of the Rinkebey test network
// const rinkebyChainId = "0x4"; 
// if (chainId !== rinkebyChainId) {
// 	alert("You are not connected to the Rinkeby Test Network!");
// }

  //state variable to store user's public wallet. useState is dependency
  const [currentAccount, setCurrentAccount] = useState("");

  const checkIfWalletConnected = async () => {
    //make sure we have access to window.ethereum
    const { ethereum } = window;

    if(!ethereum) {
      console.log("make sure you have metamask");
      return;
    } else {
      console.log("we detect that you have metamask but your wallet is not connected", ethereum);
    }

  //check if we're authorized to access user's wallet
  const accounts = await ethereum.request({ method: 'eth_accounts' });

  //if the # of accounts exceeds 1 (index=0)
  if (accounts.length !== 0) {
    //set account = to the first account
    const account = accounts[0];
    //display which account is connected
    console.log("Found an authorized account", account);
    //set the connected account to said account
    setCurrentAccount(account);
    // Setup listener: This is for the case where a user comes to our site
    // and ALREADY had their wallet connected + authorized.
    setupEventListener()
  } else {
    console.log("No authorized account found.");
  }
}

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Please install Metamask.");
        return;
      }

      //variable to replace checking the user's wallet to connecting the wallet and store it to the variable
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      //print public address once Metamask is authorized
      console.log("Connected", accounts[0]);
      //reset the current account to the first account that's connected
      setCurrentAccount(accounts[0]);
      // Setup listener: This is for the case where a user comes to our site
      // and connected their wallet for the first time
      setupEventListener()
    } catch (err) {
      console.log(err);
    }
  }

  const setupEventListener = async() => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        //ethers is a library that helps our frontend talk to our contract
        //provider talks to eth nodes
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        //creates the connection to our contract 
        //contract's address, abi file, and signer are the 3 things are always needed to communicate with contracts on the blockchain.
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, WhiskeyNFT.abi, signer);

        //Equivalent of a webhook to "capture" our event when our contract throws it.
        connectedContract.on("NewWhiskeyNFTMinted", (from, tokenId) =>{
          console.log(from, tokenId.toNumber())
          alert(`Your NFT has been minted! It might take up to 10 minutes to be revealed on OpenSea but here's the link: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`)
        });
        console.log("Setup event listener");
      } else {
        console.log("ethereum object cannot be found.")
      }
    } catch(err) {
      console.log(err);
    }
  }

  const askContractToMint = async () => {

    try {
      const { ethereum } = window;

      if (ethereum) {
        //ethers is a library that helps our frontend talk to our contract
        //provider talks to eth nodes
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        //creates the connection to our contract 
        //contract's address, abi file, and signer are the 3 things are always needed to communicate with contracts on the blockchain.
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, WhiskeyNFT.abi, signer);
        /*
        * abi 
        * abi is retrieved after contract is deployed.
        * retrieved from smart contract repo in artifacts/[CONTRACT_NAME].sol/[CONTRACT_NAME].json, copy contents
        * create new path utils/[CONTRACT_NAME].json
        * import here
        */

        console.log("Going to pop wallet now to pay gas...")
        let nftTxn = await connectedContract.makeWhiskeyNFT();

        console.log("Mining...please wait.")
        await nftTxn.wait();
        //TODO: Put in animation to let user know contract is actively being minted

        console.log(`Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`);
      } else {
        console.log("Ethereum object does not exist. You don't have anything to connect to ethereum installed.");
      }
    } catch (err) {
      console.log(err)
    }
  }

  // Render Methods
  const renderNotConnectedContainer = () => (
    <button onClick={connectWallet} className="cta-button connect-wallet-button">
      Connect to Wallet
    </button>
  );

  //runs function while page loads
  useEffect(() => {
    checkIfWalletConnected();
  }, [])

  return (
    <div className="App">
      <div className="container">
      <p className="header gradient-text">Welcome to the Whiskey Network</p>
        <div className="header-container">
          <img alt="Whiskey Network Logo" className="wn-primary" src="https://whiskeynetwork.s3.us-east-2.amazonaws.com/wn-logo-primary.jpg"></img>
          <div className='header-content-container'>
          <p className="sub-text">
          Reach new customers, gain inventory insights and access secondary market revenue for limited release whiskeys through NFTs.
          </p>
          <a className="footer-text" target="_blank" rel="noreferrer" href="https://mirror.xyz/mattmcg.eth/hdxhOGIRXMRv9AqoCGI8BmPlFjzgl81xVnPIMZDZGqg">Read More</a>
          <br />
          {currentAccount === "" ? (
            renderNotConnectedContainer()
          ) : (
            <button onClick={askContractToMint} className="cta-button wallet-button">
              Mint NFT
            </button>
          )}
          <br/>
          {/* <button onClick={null} className="cta-button connect-wallet-button">🌊 View Collection on OpenSea</button> */}
          </div>
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built on @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
