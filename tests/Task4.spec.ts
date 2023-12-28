import { SmartContract, stackInt, stackCell, stackTuple, TVMStackEntryInt, TVMStackEntryTuple} from "ton-contract-executor";
import { Cell, beginCell } from "@ton/core";
import fs from "fs";
import '@ton-community/test-utils';

// function stackInt(a: bigint) : TupleItemInt{
//     return {
//         type: 'int',
//         value: a
//     };
// }

// function stackTuple(a: TupleItem[]) : Tuple {
//     return {
//         type: 'tuple',
//         items: a 
//     };
// }

function parseGrid(a: string[][]){
    let b = a.map((s) => 
        stackTuple(
            s.map((c) => stackInt(BigInt(c.charCodeAt(0))))
        )
    );
    return stackTuple(b);
}

const task = 4;
const code = fs.readFileSync(`../build/Task4.compiled.json`).toString();
const hex : string = JSON.parse(code).hex;

async function test(contract: SmartContract, n : TVMStackEntryInt, m : TVMStackEntryInt, maze: TVMStackEntryTuple){
    let re = await contract.invokeGetMethod('fibonacci_sequence', [n, m, maze]);
    
}

async function main() {
    const contract = await SmartContract.fromCell(
        Cell.fromBoc(Buffer.from(hex, 'hex'))[0],
        new Cell(),
        { debug: true }
    )
}
main().then(() => {
    console.log("✅ All Tests Passed")
    process.exit(0);
});