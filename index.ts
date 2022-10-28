import { Client } from '@hashgraph/sdk';
require("dotenv").config();

async function main() {

    //Grab your Hedera testnet account ID and private key from your .env file
    const myAccountId = process.env.ACCOUNT_ID;
    const myPrivateKey = process.env.PRIVATE_KEY;

    // If we weren't able to grab it, we should throw a new error
    if (myAccountId == null ||
        myPrivateKey == null ) {
        throw new Error("Environment variables ACCOUNT_ID and PRIVATE_KEY must be present");
    }

    const client = Client.forTestnet();

    client.setOperator(myAccountId, myPrivateKey);

    
}
main();
