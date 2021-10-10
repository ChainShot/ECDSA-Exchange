const express = require('express');
const app = express();
const cors = require('cors');
const SHA256 = require('crypto-js/sha256');
const port = 3042;
const numberOfAddresses = 3;
const balances = [100, 50, 75];

const EC = require('elliptic').ec;
const ec = new EC('secp256k1');
//const key = ec.genKeyPair();

// localhost can have cross origin errors
// depending on the browser you use!
app.use(cors());
app.use(express.json());

const addresses = [];
const transactions = [];


class Address {
  constructor(balance) {
    this.key = ec.genKeyPair();
    this.id = addresses.length;
    this.privateKey = this.key.getPrivate().toString(16);
    this.publicKey = this.key.getPublic().encodeCompressed('hex').toString(16);
    this.balance = balance;
  }
}

class Transactions {
  constructor(sender, recepient, amount) {
    this.sender = sender;
    this.recepient = recepient;
    this.amount = amount;
    this.nonce = transactions.length;
  }
}

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve,ms));
}

function checkSignature(sender, privateKey) {
  //generate signature with private key
  const msgHash = SHA256("secret phrase").toString();
  const privKey = ec.keyFromPrivate(privateKey.slice(2));
  const signature = privKey.sign(msgHash);

  //verify signature with public key
  const pubKey = ec.keyFromPublic(sender.slice(2), 'hex');
  return pubKey.verify(msgHash, signature);
}

for(let i = 0; i < numberOfAddresses; i++) {
  addresses[i] = new Address(balances[i]);
}

console.log("Available Accounts \n==================");
for(a of addresses) {
  console.log(`(${a.id}) 0x${a.publicKey} (${a.balance} ETH)`);
}
console.log("\nPrivate Keys\n==================");
for(a of addresses) {
  console.log(`(${a.id}) 0x${a.privateKey}`);
}


app.get('/balance/:address', (req, res) => {
  const {address} = req.params;
  //find correct Address object
  let obj = addresses.find(o => o.publicKey == address.slice(2));

  //display balance
  if(obj) {
    const balance = obj.balance || 0;
    res.send({ balance });
  } else {
    const balance = 0;
    res.send({ balance });    
  }
});

app.get('/addresses', (req, res) => {
  res.send(addresses);
});

app.post('/send', (req, res) => {
  const {sender, recipient, amount, privateKey} = req.body;

  //find correct sender Address object
  let objSender = addresses.find(o => o.publicKey == sender.slice(2));

  //find correct recepient Address object
  let objRecipient = addresses.find(o => o.publicKey == recipient.slice(2));
  
  if(!objSender) {
    console.log("Invalid sender address")
  } else if(!objRecipient) {
    console.log("Invalid recipient address")
  } else if(objSender.balance < amount) {
    console.log("Insufficient balance");
  } else if(checkSignature(sender, privateKey)) {
    objSender.balance -= amount;
    objRecipient = (balances[recipient] || 0) + +amount;
    res.send({ balance: objSender.balance });
  } else {
    console.log("Invalid private key");
  }
});


app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});
