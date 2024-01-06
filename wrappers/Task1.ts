import { Address, beginCell, Cell, Contract, contractAddress, ContractGetMethodResult, ContractProvider, Sender, SendMode, TupleItem } from 'ton-core';

export type Task1Config = {
    key: number;
    time: number;
    receiver: Address;
};

export function task1ConfigToCell(config: Task1Config): Cell {
    return beginCell()
        .storeUint(config.key, 256)
        .storeUint(config.time, 32)
        .storeAddress(config.receiver)
        .storeUint(0, 32)
    .endCell();
}

export class Task1 implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new Task1(address);
    }

    static createFromConfig(config: Task1Config, code: Cell, workchain = 0) {
        const data = task1ConfigToCell(config);
        const init = { code, data };
        return new Task1(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
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
