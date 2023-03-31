import * as helios from "@hyperionbt/helios"
import fs from "fs";
import * as tester from './contractTesting.js'

let contract = fs.readFileSync("../components/Contracts/vault.hl").toString();
contract = contract.replace('ctx.get_current_validator_hash()', 'ValidatorHash::new(#01234567890123456789012345678901234567890123456789000001)')
// test helpers and fixtures can be loaded from different files and concatenated
// const helpers = fs.readFileSync("./test_helpers.hl").toString();
const fixtures = fs.readFileSync("./test_fixtures.hl").toString();
const program = helios.Program.new(contract + fixtures);
const testContract = program.compile();

tester.setup(program, testContract);
Promise.all([

    // Spending allowed
    tester.testApproval("SPENDING", "admin can spend", ["datum", "admin", "sc_admin_signed"]),
    tester.testApproval("SPENDING", "winner can spend", ["datum", "winner", "sc_winner_signed"]),

    // Spending forbidded for wrong redeemer
    tester.testDenial("SPENDING", "admin can't spend winner signed", ["datum", "admin", "sc_winner_signed"]),
    tester.testDenial("SPENDING", "winner can't spend admin signed", ["datum", "winner", "sc_admin_signed"]),

    // Spending forbidded to anyone else
    tester.testDenial("SPENDING", "losers can't spend admin", ["datum", "admin", "sc_loser_signed"]),
    tester.testDenial("SPENDING", "losers can't spend winner", ["datum", "winner", "sc_loser_signed"]),

]).then(() => {
    tester.displayStats()
})
