import * as helios from "@hyperionbt/helios"
import fs from "fs";
import * as tester from './contractTesting.js'

let contract = fs.readFileSync("../components/Contracts/raffle_v2.hl").toString();
const fixtures = fs.readFileSync("./raffle_v2_fixtures.hl").toString();
const program = helios.Program.new(contract + fixtures);
const testContract = program.compile();

tester.setup(program, testContract);
Promise.all([

    tester.testApproval("Buy Tickets", "can buy tickets", ["datum", "admin", "sc_admin_signed"]),

]).then(() => {
    tester.displayStats()
})
