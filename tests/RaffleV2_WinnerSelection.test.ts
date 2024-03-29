import { describe, it, beforeAll, expect } from 'vitest'
import { Program } from "@hyperionbt/helios"
import fs from "fs";

let program;
let testContract;

describe('Raffle Winner Selection', () => {


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


    it(`should select winner of a full raffle`, async () => {
        const args = ["raffle_full", "select_winner_6", "sc_select_winner_full_before_deadline"].map((p) => program.evalParam(p))
        return await testContract
            .runWithPrint(args)
            .then((res) => {
                console.log('res', JSON.stringify(res))
                expect(res[0].toString()).toBe("()");
            })
    })

    it(`should select winner of a non-full raffle after deadline`, async () => {
        const args = ["raffle_almost_full", "select_winner_1", "sc_select_winner_almost_full_after_deadline"].map((p) => program.evalParam(p))
        return await testContract
            .runWithPrint(args)
            .then((res) => {
                console.log('res', JSON.stringify(res))
                expect(res[0].toString()).toBe("()");
            })
    })

    it(`should fail if not full or deadline not passed`, async () => {
        const args = ["raffle_almost_full", "select_winner_1", "sc_select_winner_almost_full_before_deadline"].map((p) => program.evalParam(p))
        return await testContract
            .runWithPrint(args)
            .then((res) => {
                expect(res[1]).toContain('DEADLINE_NOT_PASSED: false')
                expect(res[1]).toContain('TRACE_RAFFLE_FULL: false')
                expect(res[0].toString()).not.toBe("()");
            })
    })

    it(`should fail if seed is not matching`, async () => {
        const args = ["raffle_full", "select_winner_bad_hash", "sc_select_winner_full_before_deadline"].map((p) => program.evalParam(p))
        return await testContract
            .runWithPrint(args)
            .then((res) => {
                expect(res[1]).toContain('SEED_MATCH: false')
                expect(res[0].toString()).not.toBe("()");
            })
    })

    it(`should fail if no participants`, async () => {
        const args = ["raffle_new", "select_winner_1", "sc_new_raffle_after_deadline"].map((p) => program.evalParam(p))
        return await testContract
            .runWithPrint(args)
            .then((res) => {
                expect(res[1]).toContain('NO_PARTICIPANTS: false')
                expect(res[0].toString()).not.toBe("()");
            })
    })

    it(`should fail if wrong index`, async () => {
        const args = ["raffle_full", "select_winner_wrong_index", "sc_select_winner_full_before_deadline"].map((p) => program.evalParam(p))
        return await testContract
            .runWithPrint(args)
            .then((res) => {
                expect(res[1]).toContain('TRACE_INDEX: false')
                expect(res[0].toString()).not.toBe("()");
            })
    })

    it(`should fail if not enough value sent to admin`, async () => {
        const args = ["raffle_full", "select_winner_6", "sc_select_winner_wrong_admin_value"].map((p) => program.evalParam(p))
        return await testContract
            .runWithPrint(args)
            .then((res) => {
                console.log('res[1]', JSON.stringify(res[1]))
                expect(res[1]).toContain('ADMIN_VALUE: false')
                expect(res[0].toString()).not.toBe("()");
            })
    })

    it(`should fail if NFT not sent to vault`, async () => {
        const args = ["raffle_full", "select_winner_6", "sc_select_winner_no_vault_nft"].map((p) => program.evalParam(p))
        return await testContract
            .runWithPrint(args)
            .then((res) => {
                console.log('res[1]', JSON.stringify(res[1]))
                // expect(res[1]).toContain('TRACE_INDEX: false')
                expect(res[0].toString()).not.toBe("()");
            })
    })

    it(`should fail if not enough value sent to vault`, async () => {
        const args = ["raffle_full", "select_winner_6", "sc_select_winner_wrong_vault_value"].map((p) => program.evalParam(p))
        return await testContract
            .runWithPrint(args)
            .then((res) => {
                console.log('res[1]', JSON.stringify(res[1]))
                // expect(res[1]).toContain('TRACE_INDEX: false')
                expect(res[0].toString()).not.toBe("()");
            })
    })


})

