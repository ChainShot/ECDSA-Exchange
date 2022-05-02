const express = require("express");
const app = express();
const cors = require("cors");
const secp = require("@noble/secp256k1");
const SHA256 = require("crypto-js/sha256");
const port = 3042;

// localhost can have cross origin errors
// depending on the browser you use!
app.use(cors());
app.use(express.json());

// const ec = new EC('secp256k1');
const privateKey1 = Buffer.from(secp.utils.randomPrivateKey()).toString("hex");
const privateKey2 = Buffer.from(secp.utils.randomPrivateKey()).toString("hex");
const privateKey3 = Buffer.from(secp.utils.randomPrivateKey()).toString("hex");

let publicKey1 = Buffer.from(secp.getPublicKey(privateKey1)).toString("hex");
let publicKey2 = Buffer.from(secp.getPublicKey(privateKey2)).toString("hex");
let publicKey3 = Buffer.from(secp.getPublicKey(privateKey3)).toString("hex");

publicKey1 = `0x${publicKey1.slice(publicKey1.length - 40)}`;
publicKey2 = `0x${publicKey2.slice(publicKey2.length - 40)}`;
publicKey3 = `0x${publicKey3.slice(publicKey3.length - 40)}`;

const private_key = {
  1: privateKey1,
  2: privateKey2,
  3: privateKey3,
};

const balances = {
  [publicKey1]: 100,
  [publicKey2]: 50,
  [publicKey3]: 75,
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  const { sender, recipient, amount, signature } = req.body;
  const msgHash = SHA256(JSON.stringify({ sender, recipient, amount })).toString();

  const recoveredPublicKey = secp.recoverPublicKey(msgHash, signature, 1);
  const isVerified = secp.verify(signature, msgHash, recoveredPublicKey);

  if(isVerified){
    balances[sender] -= amount;
    balances[recipient] = (balances[recipient] || 0) + +amount;
  }

  res.send({ balance: balances[sender] });
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
  console.log("Available Accounts");
  console.log("========================");
  for (const [k, v] of Object.entries(balances)) {
    console.log(`${k} (${v} ETH)`);
  }
  console.log("Private Keys");
  console.log("========================");
  for (const k of [1, 2, 3]) {
    console.log(`(${k}) ${private_key[k]}`);
  }
});
