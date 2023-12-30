import { Blockchain, SandboxContract, TreasuryContract } from '@ton-community/sandbox';
import { Address, Cell, Dictionary, beginCell, toNano, Slice, address, serializeTuple, parseTuple, TupleBuilder, TupleReader } from 'ton-core';
import { Task2 } from '../wrappers/Task2';
import '@ton-community/test-utils';
import { compile } from '@ton-community/blueprint';
import fs from "fs";
import { SmartContract } from 'ton-contract-executor';
import exp from 'constants';

const ADD = 0x368ddef3;
const REM = 0x278205c8;
const SPL = 0x068530b3;
// ;; add_user#368ddef3 query_id:uint64 address:MsgAddressInt share:uint32 = InternalMsgBody;
// ;; remove_user#278205c8 query_id:uint64 address:MsgAddressInt = InternalMsgBody;
// ;; split_ton#068530b3 query_id:uint64 = InternalMsgBody;
// ;; transfer_notification#7362d09c query_id:uint64 amount:Coins = InternalMsgBody;

function add(address: Address, share : number){
    return beginCell().storeUint(ADD, 32).storeUint(0, 64).storeAddress(address).storeUint(share, 32).endCell();   
}
function remove(address: Address){
    return beginCell().storeUint(REM, 32).storeUint(0, 64).storeAddress(address).endCell();   
}
function split(){
    return beginCell().storeUint(SPL, 32).storeUint(0, 64).endCell();   
}

describe('Task2', () => {
    let code: Cell;
    let expected: Map<string, number>;
    beforeAll(async () => {
        const s = fs.readFileSync(`./build/Task2.compiled.json`).toString();
        const hex : string = JSON.parse(s).hex;
        code = Cell.fromBoc(Buffer.from(hex, "hex"))[0];
    });

    let blockchain: Blockchain;
    let task2: SandboxContract<Task2>;
    let admin: SandboxContract<TreasuryContract>;

    async function addUser(address : Address, share : number){
        await task2.sendMessage(admin.getSender(), toNano("0.02"), add(address, share));
        expected.set(address.toString(), share);
    }
    async function removeUser(address : Address){
        await task2.sendMessage(admin.getSender(), toNano("0.02"), remove(address));
        expected.delete(address.toString());
    }

    beforeEach(async () => {
        blockchain = await Blockchain.create();
        
        admin = await blockchain.treasury("admin", {balance: toNano("100.0")});

        expected = new Map();

        task2 = blockchain.openContract(Task2.createFromConfig({address: admin.address}, code));

        const deployer = await blockchain.treasury('deployer', {balance: toNano("100.0")});

        const deployResult = await task2.sendDeploy(deployer.getSender(), toNano('5'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: task2.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {

        // ADD AND REMOVE USERS
        for(let i = 0 ; i < 10; i++){
            let user = await blockchain.treasury(i.toString());
            await addUser(user.address, i + 1);
        }
        for(let i = 0 ; i < 4; i++){
            let user = await blockchain.treasury(i.toString());
            await addUser(user.address, i + 5);
        }
        for(let i = 5; i < 7; i++){
            let user = await blockchain.treasury(i.toString());
            await removeUser(user.address);
        }


        // const re2 = (await task2.get("get_users", [])).stack
        // const d = re2.readCell();
        // const key = {bits: 256, serialize: (s : number) => BigInt(s), parse: (s : bigint) => Number(s)};
        // const val = {bits: 32, serialize: (s : number) => beginCell().storeUint(s, 32).endCell().beginParse(), parse: (s : Slice) => s.loadUint(32)};
        
        for(const k of expected.keys()){
            const args = new TupleBuilder();
            args.writeAddress(Address.parse(k));
            const re =  (await task2.get("get_user_share", args.build())).stack;
            expect(re.readBigNumber()).toEqual(BigInt(expected.get(k) ?? 0));
        }


        // RECEIVING TON COIN
        const re = await task2.sendMessage(admin.getSender(), toNano("1"), split());
        console.log(re);


    });
});