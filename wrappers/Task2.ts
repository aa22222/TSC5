import { Address, beginCell, Cell, Contract, contractAddress, ContractGetMethodResult, ContractProvider, Sender, SendMode, TupleItem } from 'ton-core';

export type Task2Config = { 
    address : Address;
};

export function task2ConfigToCell(config: Task2Config): Cell {
    return beginCell().storeAddress(config.address).storeUint(0, 1).endCell();
}

export class Task2 implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new Task2(address);
    }

    static createFromConfig(config: Task2Config, code: Cell, workchain = 0) {
        const data = task2ConfigToCell(config);
        const init = { code, data };
        return new Task2(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().storeUint(1, 32).storeUint(0, 64).endCell(),
        });
    }
    
    async sendMessage(provider: ContractProvider, via: Sender, value: bigint, body : Cell ) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body
        });
    }

    async get(provider: ContractProvider, name: string, args : TupleItem[]) : Promise<ContractGetMethodResult> {
        return await provider.get(name, args);
    }
}
