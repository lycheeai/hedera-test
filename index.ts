import { AccountBalanceQuery, Client, FileAppendTransaction, FileContentsQuery, FileCreateTransaction, Hbar, PrivateKey } from '@hashgraph/sdk';
import { readFileSync } from 'fs'
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

    const balance = await new AccountBalanceQuery()
        .setAccountId(myAccountId)
        .execute(client);

    console.warn(balance.hbars.toString());

    const bytecode = readFileSync('./contracts_HelloHedera_sol_HelloHedera.bin').toString();

    console.warn(bytecode);
    console.warn(bytecode.length);

    const filePrivateKey = PrivateKey.generateED25519(); 
    const filePublicKey = filePrivateKey.publicKey;


    const fileCreateTx = new FileCreateTransaction()
        .setKeys([filePublicKey])
        //Set the bytecode of the contract
        .setContents(bytecode.slice(0, 4000))
        .freezeWith(client)
    
        //.slice(4000)

// Create a file on Hedera and store the bytecode
// const fileCreateTx = new FileCreateTransaction()
// 	.setContents(contractBytecode)
// 	.setKeys([operatorKey])
// 	.setMaxTransactionFee(new Hbar(0.75))
// 	.freezeWith(client);
// const fileCreateSign = await fileCreateTx.sign(operatorKey);
// const fileCreateSubmit = await fileCreateSign.execute(client);
// const fileCreateRx = await fileCreateSubmit.getReceipt(client);
// const bytecodeFileId = fileCreateRx.fileId;
// console.log(`- The bytecode file ID is: ${bytecodeFileId} \n`);

    const signedCreateTx = await fileCreateTx.sign(filePrivateKey);
    const submitTx = await signedCreateTx.execute(client);

    const fileReceipt = await submitTx.getReceipt(client);    

    const bytecodeFileId = fileReceipt.fileId;

    console.log("The smart contract byte code file ID is " +bytecodeFileId);


    // we need to append the rest of the file here
    const fileAppendTx = new FileAppendTransaction()
        .setFileId(bytecodeFileId)
        .setMaxTransactionFee(new Hbar(2))
        .setContents(bytecode.slice(4000))
        .freezeWith(client);

    const signedAppendTx = await fileAppendTx.sign(filePrivateKey)
    const submitTx2 = await signedAppendTx.execute(client);

    const fileReceipt2 = await submitTx2.getReceipt(client);

    console.log("File appended", fileReceipt.status);

    const query = new FileContentsQuery()
        .setFileId(bytecodeFileId);
    
    const contents = await query.execute(client);

    console.warn(contents.toString());
    console.warn(contents.toString().length);


    // create another account
    // https://docs.hedera.com/guides/getting-started/create-an-account


    // transfer hbar
    // https://docs.hedera.com/guides/getting-started/transfer-hbar

    // topic >> subscribe >> message
    // https://docs.hedera.com/guides/getting-started/try-examples/submit-your-first-message


    // smart contract
    // https://docs.hedera.com/guides/getting-started/try-examples/deploy-your-first-smart-contract
}
main();
