const assert  = require('assert');
const ganache = require('ganache-cli');
const Web3    = require('Web3');

const provider = ganache.provider();
const web3 = new Web3(provider);


const { interface, bytecode } = require('../compile');

let lottery;
let accounts;


beforeEach(async () => {
  accounts = await web3.eth.getAccounts();

  lottery = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({ data: bytecode })
    .send({from: accounts[0], gas: '1000000' });

    lottery.setProvider(provider);
});


describe('Lottery Contract', () => {
  it('deploys the contract', () => {
    assert.ok(lottery.options.address);
  })

  it('allows one address to enter', async () => {
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei('1', 'ether')
    });

    const players = await lottery.methods.getPlayers().call({ from: accounts[0] });

    assert.equal(1, players.length);
    assert.equal(accounts[0], players[0]);
  });

  it('allows two addresses to enter', async () => {
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei('1', 'ether')
    });

    await lottery.methods.enter().send({
      from: accounts[1],
      value: web3.utils.toWei('2', 'ether')
    });

    const players = await lottery.methods.getPlayers().call({ from: accounts[0]})
    assert.equal(2, players.length);
    assert.equal(accounts[1], players[1]);
  })

  it('requires a mininum amount of ether to run', async () => {
    try {
      await lottery.methods.enter().send({
        from: accounts[0],
        value:  web3.utils.toWei('0.000001', 'ether')
      });

      assert(false); //this just falls into catch with err.
    } catch (err) {
      assert(err);
      assert.notEqual('AssertionError [ERR_ASSERTION]', err['name']);
    }
  });

  it('only allows the manager to call pickWinner', async () => {
    try {
      await lottery.methods.enter().send({ from: accounts[1], value:  web3.utils.toWei('1', 'ether') });
      await lottery.methods.pickWinner().call({ from: accounts[1] });
      assert(false); //this just falls into catch with err.
    } catch (err) {
      assert(err);
      assert.notEqual('AssertionError [ERR_ASSERTION]', err['name']);
    }
  });

  it('sends money to the winner and resets the players array', async () => {
    let players;

    await lottery.methods.enter().send({ from: accounts[1], value:  web3.utils.toWei('1', 'ether') });
    players = await lottery.methods.getPlayers().call({ from: accounts[0] });
    assert.equal(1, players.length);

    await lottery.methods.pickWinner().send({ from: accounts[0] })
    players = await lottery.methods.getPlayers().call({ from: accounts[0] });
    assert.equal(0, players.length);
  })

});
