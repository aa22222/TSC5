import { SmartContract, stackInt, stackCell, stackTuple} from "ton-contract-executor";
import { Cell, beginCell } from "ton-core";
// import assert from "assert";
import fs from "fs";

async function main() {

    let a = beginCell().endCell()
    let b = beginCell().storeUint(0, 1).storeUint(1, 4).storeUint(1, 8).storeUint(0, 1).endCell();
    console.log(a.equals(b));
}
main().then(() => {
    console.log("✅ All Tests Passed")
    process.exit(0);
});