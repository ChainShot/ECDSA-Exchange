const express = require('express');
const app = express();
const cors = require('cors');
const port = 3042;
const EC = require('elliptic').ec;
global.fetch = require("node-fetch");


// localhost can have cross origin errors
// depending on the browser you use!
app.use(cors());
app.use(express.json());

const ec = new EC('secp256k1');
const keyPair = [];
// ECDSA
while (keyPair.length < 3) {
    const key = ec.genKeyPair();
    keyPair.push({
        key: key,
        privateKey: key.getPrivate().toString(16),
        publicX: key.getPublic().x.toString(16),
        publicY: key.getPublic().y.toString(16),
        publicKey: key.getPublic().encode('hex')
    })
}
console.log(keyPair);

const addr1 = keyPair[0]['publicKey'];
const addr2 = keyPair[1]['publicKey'];
const addr3 = keyPair[2]['publicKey'];

const balances = {
    [addr1]: 100,
    [addr2]: 50,
    [addr3]: 75,
}
console.log(balances);

const balancesPair = [{
        [addr1]: 100,
        privateKey: keyPair[0]['privateKey']
    },
    {
        [addr2]: 50,
        privateKey: keyPair[1]['privateKey']
    },
    {
        [addr3]: 75,
        privateKey: keyPair[2]['privateKey']
    }
]
console.log(balancesPair);

app.get('/balance/:address', (req, res) => {
    const { address } = req.params;
    const balance = balances[address] || 0;
    console.log(balance);
    res.send({ balance });
});

app.post('/send', (req, res) => {
    const { sender, recipient, amount } = req.body;
    // console.log({ sender, recipient, amount });
    // console.log(sender);

    const msgHash = ['Alica send 2 ETH to Bobbie', 2, 'ETH'];
    var signKey = "";
    keyPair.map((pair) => {
            if (pair['publicKey'] === sender) {
                signKey = pair['key']
            }
        })
        // console.log(signKey);
    const signature = signKey.sign(msgHash);
    const derSign = signature.toDER();
    console.log(signKey.verify(msgHash, derSign));

    balances[sender] -= amount;
    balances[recipient] = (balances[recipient] || 0) + +amount;
    res.send({ balance: balances[sender] });
});

app.listen(port, () => {
    console.log(`Listening on port ${port}!`);
});
