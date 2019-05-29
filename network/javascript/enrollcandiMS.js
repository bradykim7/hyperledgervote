/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { FileSystemWallet, Gateway } = require('fabric-network');
const fs = require('fs');
const path = require('path');

const ccpPath = path.resolve(__dirname, '..', '..', 'basic-network', 'connection.json');
const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
const ccp = JSON.parse(ccpJSON);

async function main() {
    try {
        /*
        Name,
            docType: 'Candidate',
            Number,
            Affiliation,
            VotesNumber,
         */
        let argv = process.argv;
        if(argv.length !== 7) {
            console.log('Invalid Input : (node enrollcandiMS.js admin candidates(number) name comments affiliation ');
            process.exit(1);
        }

        if(argv[2] !== 'admin'){
            process.exit(1);
		}
        let candidateNum = argv[3];
        let name = argv[4];
        let comments =argv[5];
        let affiliation = argv[6];


        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const userExists = await wallet.exists('admin');
        if (!userExists) {
            console.log('An identity for the user "admin" does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            return;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: 'admin', discovery: { enabled: false } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract('vote');

        // Submit the specified transaction.
        // enrollCandi(ctx, candidateNum, name, comments, affiliation)
        await contract.submitTransaction('enrollCandi',candidateNum, name, comments, affiliation);
        console.log('Transaction has been submitted');

        // Disconnect from the gateway.
        await gateway.disconnect();

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        process.exit(1);
    }
}

main();
