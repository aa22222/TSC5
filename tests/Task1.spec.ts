import { Blockchain, SandboxContract, TreasuryContract } from '@ton-community/sandbox';
import { Cell, beginCell, toNano } from 'ton-core';
import { Task1 } from '../wrappers/Task1';
import '@ton-community/test-utils';
import fs from 'fs';

describe('Task1', () => {
    let code: Cell;

    beforeAll(async () => {
        const s = fs.readFileSync(`./build/Task1.compiled.json`).toString();
        const hex : string = JSON.parse(s).hex;
        code = Cell.fromBoc(Buffer.from(hex, "hex"))[0];
    });

    let blockchain: Blockchain;
    let task1: SandboxContract<Task1>;
    let receiver: SandboxContract<TreasuryContract>;
    beforeEach(async () => {
        blockchain = await Blockchain.create();

        receiver = await blockchain.treasury("receiver")

        task1 = blockchain.openContract(Task1.createFromConfig({
            key : 1, 
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
        const sender = await blockchain.treasury("sender");
        const re = await task1.sendMessage(sender.getSender(), toNano('0.02'),
            beginCell()
            .storeUint(2649817719, 32)
            .storeUint(0, 64)
            .storeRef(
                beginCell()
                .storeUint(100, 32)
                .storeUint(1, 32)
                .endCell()
            )
            .endCell()
        )
        // console.log(re);
    });
});
