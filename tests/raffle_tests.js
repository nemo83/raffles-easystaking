import * as helios from "@hyperionbt/helios"
import fs from "fs";
import * as tester from './contractTesting.js'

let contract = fs.readFileSync("../components/Contracts/raffle_v2.hl").toString();
contract = contract.replace('context.get_current_validator_hash()', 'ValidatorHash::new(#01234567890123456789012345678901234567890123456789000001)')

const fixtures = fs.readFileSync("./raffle_v2_fixtures.hl").toString();
const program = helios.Program.new(contract + fixtures);
const testContract = program.compile();
console.log('validatorHash', testContract.validatorHash.hex)

tester.setup(program, testContract);
Promise.all([

    tester.testApproval("Buy Tickets", "can buy tickets", ["new_raffle", "p1_1_tickets", "sc_new_raffle"]),
    tester.testDenial("Buy Tickets", "p2 tries buy 2 tickets, not enough ada", ["raffle_p1_1_ticket", "p2_2_tickets", "sc_1_ticket"]),

]).then(() => {
    tester.displayStats()
})
