import { describe, it, beforeAll, expect } from 'vitest'
import { Program } from "@hyperionbt/helios"
import fs from "fs";

let program;
let testContract;

describe('Participants buy Raffle (v2) tickets', () => {


    beforeAll(() => {

        const testSetup = {
            contract: './components/Contracts/raffle_v2.hl',
            fixtures: [
                './tests/raffle_v2_fixtures.hl'
            ],
            helpers: [

            ],
            // replacements: [
            //     []
            // ]
        }

        const contractSources: string[] = []

        contractSources.push(
            fs.readFileSync(testSetup.contract).toString()
        )

        testSetup.fixtures.forEach(fixture => contractSources.push(fs.readFileSync(fixture).toString()))

        const source = contractSources
            .join("\n")
            .replace('context.get_current_validator_hash()', 'ValidatorHash::new(#01234567890123456789012345678901234567890123456789000001)')

        program = Program.new(source);
        testContract = program.compile();
    })


    it(`should allow buying 1 ticket for enough ada`, async () => {
        const args = ["raffle_new", "p1_buys_1_ticket", "sc_new_raffle"].map((p) => program.evalParam(p))
        return await testContract
            .runWithPrint(args)
            .then((res) => {
                console.log('res', JSON.stringify(res))
                expect(res[0].toString()).toBe("()");
            })
    })

    it(`should fail if not enough ada`, async () => {
        const args = ["raffle_p1_1_ticket", "p2_buys_2_tickets", "sc_1_ticket"].map((p) => program.evalParam(p))
        return await testContract
            .runWithPrint(args)
            .then((res) => {
                expect(res[1]).toContain('VALUE_OK: false')
                expect(res[0].toString()).not.toBe("()");
            })
    })

    it(`should fail if too many tickets per participants`, async () => {
        const args = ["raffle_p2_3_tickets", "p2_buys_1_ticket", "sc_3_ticket"].map((p) => program.evalParam(p))
        return await testContract
            .runWithPrint(args)
            .then((res) => {
                expect(res[1]).toContain('PARTICIPANTS_TOO_MANY_TICKETS: false')
                expect(res[0].toString()).not.toBe("()")
            })
    })

    it(`should fail if participant wrong signature`, async () => {
        const args = ["raffle_new", "p2_buys_1_ticket", "sc_new_raffle"].map((p) => program.evalParam(p))
        return await testContract
            .runWithPrint(args)
            .then((res) => {
                expect(res[1]).toContain('TRACE_SIGNED_BY_PARTICIPANT: false')
                expect(res[0].toString()).not.toBe("()")
            })
    })

    it(`should fail if raffle is full`, async () => {
        const args = ["raffle_full", "p5_buys_1_ticket", "sc_full_ticket"].map((p) => program.evalParam(p))
        return await testContract
            .runWithPrint(args)
            .then((res) => {
                expect(res[1]).toContain('RAFFLE_NOT_FULL: false')
                expect(res[0].toString()).not.toBe("()")
            })
    })

    it(`should fail if deadline during`, async () => {
        const args = ["raffle_new", "p1_buys_1_ticket", "sc_raffle_expired_during"].map((p) => program.evalParam(p))
        return await testContract
            .runWithPrint(args)
            .then((res) => {
                expect(res[1]).toContain('BEFORE_DEADLINE: false')
                expect(res[0].toString()).not.toBe("()")
            })
    })

    it(`should fail if deadline after`, async () => {
        const args = ["raffle_new", "p1_buys_1_ticket", "sc_raffle_expired_after"].map((p) => program.evalParam(p))
        return await testContract
            .runWithPrint(args)
            .then((res) => {
                expect(res[1]).toContain('BEFORE_DEADLINE: false')
                expect(res[0].toString()).not.toBe("()")
            })
    })

    it(`should fail if too many total tickets`, async () => {
        const args = ["raffle_almost_full", "p5_buys_2_ticket", "sc_almost_full_ticket"].map((p) => program.evalParam(p))
        return await testContract
            .runWithPrint(args)
            .then((res) => {
                expect(res[1]).toContain('TOO_MANY_TICKETS: false')
                expect(res[0].toString()).not.toBe("()")
            })
    })



})

