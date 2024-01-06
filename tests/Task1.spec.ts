import { Blockchain, SandboxContract, TreasuryContract } from '@ton-community/sandbox';
import { Cell, toNano } from 'ton-core';
import { Task1 } from '../wrappers/Task1';
import '@ton-community/test-utils';
import { compile } from '@ton-community/blueprint';
import { KeyObject, createPrivateKey, createPublicKey, generateKeyPair, sign } from 'crypto';

describe('Task1', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('Task1');
    });

    let blockchain: Blockchain;
    let task1: SandboxContract<Task1>;
    let receiver: SandboxContract<TreasuryContract>;
    let key: KeyObject;
    beforeEach(async () => {
        blockchain = await Blockchain.create();

        receiver = await blockchain.treasury("receiver")
        const pubkey = createPublicKey("key");
        key = createPrivateKey("key");
        sign()
        task1 = blockchain.openContract(Task1.createFromConfig({
            key : BigInt(pubkey.export()), 
            receiver: receiver.address
        }, code));

        const deployer = await blockchain.treasury('deployer');
        const deployResult = await task1.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: task1.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        
    });
});
