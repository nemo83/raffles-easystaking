import { describe, it, beforeAll, expect } from 'vitest'
import { Program, Address, NetworkEmulator, ConstrData } from "@hyperionbt/helios"
import fs from "fs";

let program;
let testContract;

describe('Raffle Vault works appropriately', () => {


    beforeAll(() => {

        const testSetup = {
            contract: './components/Contracts/vault.hl',
            fixtures: [
                './tests/vault_fixtures.hl'
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


    it(`should allow Admin to spend`, async () => {

        const args = ["datum", "admin", "sc_admin_signed"].map((p) => program.evalParam(p))
        return await testContract
            .runWithPrint(args)
            .then((res) => {
                console.log('res', JSON.stringify(res))
                expect(res[0].toString()).toBe("()");
            })
    })

    it(`should allow Winner to spend`, async () => {

        const args = ["datum", "winner", "sc_winner_signed"].map((p) => program.evalParam(p))
        return await testContract
            .runWithPrint(args)
            .then((res) => {
                console.log('res', JSON.stringify(res))
                expect(res[0].toString()).toBe("()");
            })
    })

    it(`should forbid admin to spend if signed as winner`, async () => {
        const args = ["datum", "admin", "sc_winner_signed"].map((p) => program.evalParam(p))
        return await testContract
            .runWithPrint(args)
            .then((res) => {
                expect(res[1]).toContain('TRACE_IS_ADMIN: false')
                expect(res[0].toString()).not.toBe("()")
            })
    })

    it(`should forbid winner to spend if signed as admin`, async () => {
        const args = ["datum", "winner", "sc_admin_signed"].map((p) => program.evalParam(p))
        return await testContract
            .runWithPrint(args)
            .then((res) => {
                expect(res[1]).toContain('TRACE_IS_WINNER: false')
                expect(res[0].toString()).not.toBe("()")
            })
    })

    it(`should forbid other to spend if signed as admin`, async () => {
        const args = ["datum", "admin", "sc_loser_signed"].map((p) => program.evalParam(p))
        return await testContract
            .runWithPrint(args)
            .then((res) => {
                expect(res[1]).toContain('TRACE_IS_ADMIN: false')
                expect(res[0].toString()).not.toBe("()")
            })
    })

    it(`should forbid other to spend if signed as winner`, async () => {
        const args = ["datum", "winner", "sc_loser_signed"].map((p) => program.evalParam(p))
        return await testContract
            .runWithPrint(args)
            .then((res) => {
                expect(res[1]).toContain('TRACE_IS_WINNER: false')
                expect(res[0].toString()).not.toBe("()")
            })
    })

})
