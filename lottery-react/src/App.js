import React, { Component } from "react";
import logo from "./logo.svg";
import "./App.css";

import web3 from "./web3";
import lottery from "./lottery";

class App extends Component {
  state = {
    manager: "",
    players: [],
    balance: ""
  };

  async componentDidMount() {
    const manager = await lottery.methods.manager().call();
    const players = await lottery.methods.getPlayers().call();
    const balance = await web3.eth.getBalance(lottery.options.address);
    const ante = 0.005;

    this.setState({
      manager: manager,
      players: players,
      balance: balance,
      ante: ante,
      value: "",
      message: ""
    });
  }

  onSubmit = async event => {
    event.preventDefault();

    const accounts = await web3.eth.getAccounts();

    this.setState({ message: "Waiting on transaction success......" });

    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei(this.state.value, "ether")
    });

    this.setState({ message: "You have been entered into the game!" });
  };

  onClick = async () => {
    const accounts = await web3.eth.getAccounts();

    this.setState({
      message: "Winner, waiting on transaction to finish............."
    });
    await lottery.methods.pickWinner().send({ from: accounts[0] });

    this.setState({ message: "Winner, has been awarded funds!" });
  };

  render() {
    console.log("web3 version: ", web3.version);
    web3.eth.getAccounts().then(console.log);

    return (
      <div>
        <h2>Win the Falcon</h2>

        <p>Play one friend head to head for {this.state.ante} ETH.</p>
        <p>
          <strong>Rules:</strong> Once two players have sent in{" "}
          {this.state.ante} ether, the system chooses one winner at random. The
          winner immediatey gets all of the ether sent to them.
        </p>
        <p>
          <strong>Note: </strong> Winnings will be slightly less than both antes
          due to current ethereum network transaction fees. We do not add any of
          our own fees on top. Current transaction fees can be seen at{" "}
          <a href="https://ethgasstation.info/">ETH gas station</a>.
        </p>
        <form onSubmit={this.onSubmit}>
          <div>
            <label> Amount of Ether to Send In: </label>
            <input
              value={this.state.value}
              onChange={event => this.setState({ value: event.target.value })}
            />
            <button>Enter</button>
          </div>
        </form>
        <img
          width="500"
          src="https://vignette.wikia.nocookie.net/starwars/images/2/24/Lando_Calrissian-EoD.jpg/revision/latest/scale-to-width-down/584?cb=20140217181531"
        />
        <img
          width="500"
          src="https://2.bp.blogspot.com/-M8s2agAuCDs/VVnJDlXea4I/AAAAAAAAAo0/yVoR612PhMg/s1600/Han_Solo.jpg"
        />

        <hr />

        <h4>Smart Contract Transparency</h4>
        <div>
          This contract is managed by the address:{" "}
          <strong>
            <a
              href={"https://etherscan.io/address/" + this.state.manager}
              target="_blank"
            >
              {this.state.manager}
            </a>
          </strong>
        </div>
        <p>
          There are currenty <strong>{this.state.players.length}</strong> in
          this lottery playing for{" "}
          <strong>{web3.utils.fromWei(this.state.balance, "ether")}</strong>{" "}
          ether.
        </p>
        <p>
          We are still waiting for{" "}
          <strong>{2 - this.state.players.length}</strong> more to join.
        </p>

        <hr />
        <h1>{this.state.message}</h1>

        <hr />
        <h4>Ready to pick a winner?</h4>
        <button onClick={this.onClick}>Pick a Winner</button>
      </div>
    );
  }
}

export default App;
