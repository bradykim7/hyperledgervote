/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');

class Vote extends Contract {

    async init(ctx) {
        console.info('============= START : Initialize Ledger ===========');
        const candidates = [
            {
                name: 'kim',
                comments: 'Fight for us',
                affiliation: 'SUNGDANG',
                vcount: '0',
            },
            {
                name: 'lee',
                comments: 'Not only me',
                affiliation: 'LADANG',
                vcount: '0',
            },

        ];

        for (let i = 0; i < candidates.length; i++) {
            candidates[i].docType = 'candidate';
            await ctx.stub.putState('candidate' + i, Buffer.from(JSON.stringify(candidates[i])));
            console.info('Added <--> ', candidates[i]);
        }
        console.info('============= END : Initialize Ledger ===========');
    }

    async queryCandidate(ctx, candidateNum) {
        const cAsBytes = await ctx.stub.getState(candidateNum); // get the candidate from chaincode state
        if (!cAsBytes || cAsBytes.length === 0) {
            throw new Error(`${candidateNum} does not exist`);
        }
        console.log(cAsBytes.toString());
        return cAsBytes.toString();
    }

    //Enroll the candidate
    // enrollCandi(ctx, candidateNum, name, comments, affiliation)
    async enrollCandi(ctx, candidateNum, name, comments, affiliation) {
        console.info('============= START : Create Candidate ===========');

        const candidates = {
            name,
            docType: 'candidate',
            comments,
            affiliation,
            vcount :'0',
        };

        await ctx.stub.putState(candidateNum, Buffer.from(JSON.stringify(candidates)));
        console.info('============= END : Create Candidate ===========');
    }

    async queryAllcandidates(ctx) {
        const startKey = 'candidate0';
        const endKey = 'candidate999';

        const iterator = await ctx.stub.getStateByRange(startKey, endKey);

        const allResults = [];
        while (true) {
            const res = await iterator.next();

            if (res.value && res.value.value.toString()) {
                console.log(res.value.value.toString('utf8'));

                const Key = res.value.key;
                let Record;
                try {
                    Record = JSON.parse(res.value.value.toString('utf8'));
                } catch (err) {
                    console.log(err);
                    Record = res.value.value.toString('utf8');
                }
                allResults.push({ Key, Record });
            }
            if (res.done) {
                console.log('end of data');
                await iterator.close();
                console.info(allResults);
                return JSON.stringify(allResults);
            }
        }
    }

    // must fix very much
    async upcount(ctx, candidateNum) {
        console.info('============= START : up count the CandidateOwner ===========');

        const cAsBytes = await ctx.stub.getState(candidateNum); // get the candidates from chaincode state
        if (!cAsBytes || cAsBytes.length === 0) {
            throw new Error(`${candidateNum} does not exist`);
        }
        const candidate = JSON.parse(cAsBytes.toString());
        let num = candidate.vcount*1 +1;    // String *1 makes (string type) => (integer tpye)
        candidate.vcount =num;

        await ctx.stub.putState(candidateNum, Buffer.from(JSON.stringify(candidate)));
        console.info('============= END =============');
    }

}

module.exports = Vote;
