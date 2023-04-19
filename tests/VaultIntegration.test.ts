import { describe, it, beforeAll, expect, vi } from 'vitest'
import { Program, Address, ConstrData, NetworkEmulator, MintingPolicyHash, Assets, hexToBytes, Tx, TxOutput, UplcProgram, Value, Datum, NetworkParams, UTxO, TxId } from "@hyperionbt/helios"
import fs from "fs";

let program: Program;
let testContract: UplcProgram;

describe('Raffle Vault works appropriately - Integration Tests', () => {


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

        const networkParamsFile = fs.readFileSync('./tests/preprod-network-params.json');
        const networkParams = new NetworkParams(JSON.parse(networkParamsFile.toString()));

        const scriptAddress = Address.fromValidatorHash(testContract.validatorHash)

        const network = new NetworkEmulator()

        // Create a Wallet - we add 10ADA to start
        const admin = network.createWallet(BigInt(10_000_000));
        const winner = network.createWallet(BigInt(10_000_000));

        // Add additional lovelace UTXO to the wallet
        network.createUtxo(admin, BigInt(5_000_000));

        // Create a Test Asset
        const testAsset = new Assets();
        testAsset.addComponent(
            MintingPolicyHash.fromHex('919d4c2c9455016289341b1a14dedf697687af31751170d56a31466e'),
            hexToBytes("48656c6c6f20776f726c6421"),
            BigInt(1)
        );

        // Add additional Token to the wallet
        network.createUtxo(admin, BigInt(2000000), testAsset);

        // Now lets tick the network on 10 slots,
        // this will allow the UTxOs to be created from Genisis
        network.tick(BigInt(10));

        let adminUtxos = await network.getUtxos(admin.address)

        const nftValue = new Value(BigInt(2_000_000), testAsset)

        const datum = new program.types.Datum(
            admin.pubKeyHash,
            winner.pubKeyHash
        )

        const output = new TxOutput(scriptAddress, nftValue, Datum.inline(datum))

        const tx = new Tx()
            .addInputs(adminUtxos)
            .addOutput(output)

        await tx.finalize(networkParams, admin.address)

        // Submit Tx to the network
        const txId = await network.submitTx(tx);
        console.log('txId', txId.hex)

        // Tick the network on 10 more slots,
        network.tick(BigInt(10));

        const scriptUtxos = await network.getUtxos(scriptAddress)
        console.log('scriptUtxos', JSON.stringify(scriptUtxos))

        const input = new UTxO(txId, BigInt(0), output)

        adminUtxos = await network.getUtxos(admin.address)

        const collectTx = new Tx()
            .addInput(input, new ConstrData(0, []))
            .addInputs(adminUtxos)
            .addOutput(new TxOutput(admin.address, nftValue))
            .addSigner(admin.pubKeyHash)
            .attachScript(testContract)

        await collectTx.finalize(networkParams, admin.address)

        const collectTxId = await network.submitTx(collectTx);
        console.log('collectTxId', collectTxId.hex)

        // Tick the network on 10 more slots,
        network.tick(BigInt(10));


    })

    it(`should forbid Winner to spend as Admin`, async () => {


        const logMsgs = new Set()
        const logSpy = vi.spyOn(global.console, 'log').mockImplementation((msg) => { logMsgs.add(msg); })

        const networkParamsFile = fs.readFileSync('./tests/preprod-network-params.json');
        const networkParams = new NetworkParams(JSON.parse(networkParamsFile.toString()));

        const scriptAddress = Address.fromValidatorHash(testContract.validatorHash)

        const network = new NetworkEmulator()

        // Create a Wallet - we add 10ADA to start
        const admin = network.createWallet(BigInt(10_000_000));
        const winner = network.createWallet(BigInt(10_000_000));

        // Add additional lovelace UTXO to the wallet
        network.createUtxo(admin, BigInt(5_000_000));

        // Create a Test Asset
        const testAsset = new Assets();
        testAsset.addComponent(
            MintingPolicyHash.fromHex('919d4c2c9455016289341b1a14dedf697687af31751170d56a31466e'),
            hexToBytes("48656c6c6f20776f726c6421"),
            BigInt(1)
        );

        // Add additional Token to the wallet
        network.createUtxo(admin, BigInt(2000000), testAsset);

        // Now lets tick the network on 10 slots,
        // this will allow the UTxOs to be created from Genisis
        network.tick(BigInt(10));

        let adminUtxos = await network.getUtxos(admin.address)

        const nftValue = new Value(BigInt(2_000_000), testAsset)

        const datum = new program.types.Datum(
            admin.pubKeyHash,
            winner.pubKeyHash
        )

        const output = new TxOutput(scriptAddress, nftValue, Datum.inline(datum))

        const tx = new Tx()
            .addInputs(adminUtxos)
            .addOutput(output)

        await tx.finalize(networkParams, admin.address)

        // Submit Tx to the network
        const txId = await network.submitTx(tx);
        console.log('txId', txId.hex)

        // Tick the network on 10 more slots,
        network.tick(BigInt(10));

        const scriptUtxos = await network.getUtxos(scriptAddress)
        console.log('scriptUtxos', JSON.stringify(scriptUtxos))

        const input = new UTxO(txId, BigInt(0), output)

        const winnerUtxos = await network.getUtxos(winner.address)

        const collectTx = new Tx()
            .addInput(input, new ConstrData(0, []))
            .addInputs(winnerUtxos)
            .addOutput(new TxOutput(winner.address, nftValue))
            .addSigner(winner.pubKeyHash)
            .attachScript(testContract)

        await expect(() => collectTx.finalize(networkParams, winner.address)).rejects.toThrow()

        logSpy.mockRestore()

        expect(logMsgs.has('TRACE_IS_ADMIN: false')).toBeTruthy()


    })

    it(`should allow Winner to spend`, async () => {

        const networkParamsFile = fs.readFileSync('./tests/preprod-network-params.json');
        const networkParams = new NetworkParams(JSON.parse(networkParamsFile.toString()));

        const scriptAddress = Address.fromValidatorHash(testContract.validatorHash)

        const network = new NetworkEmulator()

        // Create a Wallet - we add 10ADA to start
        const admin = network.createWallet(BigInt(10_000_000));
        const winner = network.createWallet(BigInt(10_000_000));

        // Add additional lovelace UTXO to the wallet
        network.createUtxo(admin, BigInt(5_000_000));

        // Create a Test Asset
        const testAsset = new Assets();
        testAsset.addComponent(
            MintingPolicyHash.fromHex('919d4c2c9455016289341b1a14dedf697687af31751170d56a31466e'),
            hexToBytes("48656c6c6f20776f726c6421"),
            BigInt(1)
        );

        // Add additional Token to the wallet
        network.createUtxo(admin, BigInt(2000000), testAsset);

        // Now lets tick the network on 10 slots,
        // this will allow the UTxOs to be created from Genisis
        network.tick(BigInt(10));

        const adminUtxos = await network.getUtxos(admin.address)

        const nftValue = new Value(BigInt(2_000_000), testAsset)

        const datum = new program.types.Datum(
            admin.pubKeyHash,
            winner.pubKeyHash
        )

        const output = new TxOutput(scriptAddress, nftValue, Datum.inline(datum))

        const tx = new Tx()
            .addInputs(adminUtxos)
            .addOutput(output)

        await tx.finalize(networkParams, admin.address)

        // Submit Tx to the network
        const txId = await network.submitTx(tx);
        console.log('txId', txId.hex)

        // Tick the network on 10 more slots,
        network.tick(BigInt(10));

        const scriptUtxos = await network.getUtxos(scriptAddress)
        console.log('scriptUtxos', JSON.stringify(scriptUtxos))

        const input = new UTxO(txId, BigInt(0), output)

        const winnerUtxos = await network.getUtxos(winner.address)

        const collectTx = new Tx()
            .addInput(input, new ConstrData(1, []))
            .addInputs(winnerUtxos)
            .addOutput(new TxOutput(winner.address, nftValue))
            .addSigner(winner.pubKeyHash)
            .attachScript(testContract)

        await collectTx.finalize(networkParams, winner.address)

        const collectTxId = await network.submitTx(collectTx);
        console.log('collectTxId', collectTxId.hex)

        // Tick the network on 10 more slots,
        network.tick(BigInt(10));


    })

})
