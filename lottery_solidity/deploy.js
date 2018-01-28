const HDWalletProvider = require('truffle-hdwallet-provider');
const Web3 = require('web3');
const { interface, bytecode } = require('./compile');

// console.log("mnemonic: ", process.env.METAMASKMNEMONIC)
// console.log("infura_url: ", process.env.INFURA_RINKEBY)

const provider = new HDWalletProvider(
  process.env.METAMASKMNEMONIC,
  process.env.INFURA_RINKEBY
);

// console.log("provider: ", provider)

const web3 = new Web3(provider);

const deploy = async () => {
  const accounts = await web3.eth.getAccounts();
  console.log('accounts: ', accounts)

  console.log('Attempting to deploy from account ', accounts[0]); // Need to use MetaMask Account 2

  const result = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({ data: bytecode })
    .send({ gas: '1000000', from: accounts[0] });


  console.log(interface);
  console.log('Contract deployed to ', result.options.address);
};

deploy();


// Deploy address: 0x1C75908cBC44Ef10de16961e2d68716D90c6e3d6
