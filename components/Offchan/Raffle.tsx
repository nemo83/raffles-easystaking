import {
  Address,
  Assets,
  Datum,
  hexToBytes,
  ListData,
  MintingPolicyHash,
  TxId,
  IntData,
  UTxO,
  Value,
  TxOutput,
  NetworkParams,
  Program,
  Tx,
  WalletHelper,
  ConstrData,
  PubKeyHash,
  ByteArray,
  ValidatorHash,
  Cip30Wallet,
  ByteArrayData
} from "@hyperionbt/helios";
import {
  blockfrostAPI,
  apiKey,
  networkParamsUrl
} from "../../constants/blockfrost"
import { sha256 } from 'js-sha256';

const getKeyUtxo = async (scriptAddress: string, keyMPH: string, keyName: string) => {

  const blockfrostUrl: string = blockfrostAPI + "/addresses/" + scriptAddress + "/utxos/" + keyMPH + keyName;

  let resp = await fetch(blockfrostUrl, {
    method: "GET",
    headers: {
      accept: "application/json",
      project_id: apiKey,
    },
  });

  if (resp?.status > 299) {
    throw console.error("NFT not found", resp);
  }
  const payload = await resp.json();

  if (payload.length == 0) {
    throw console.error("NFT not found");
  }
  const lovelaceAmount = payload[0].amount[0].quantity;
  const mph = MintingPolicyHash.fromHex(keyMPH);
  const tokenName = hexToBytes(keyName);

  const value = new Value(BigInt(lovelaceAmount), new Assets([
    [mph, [
      [tokenName, BigInt(1)],
    ]]
  ]));

  console.log('payload[0].tx_hash: ' + payload[0].tx_hash)
  console.log('payload[0].output_index: ' + payload[0].output_index)
  console.log('inline datum: ' + payload[0].inline_datum)

  return new UTxO(
    TxId.fromHex(payload[0].tx_hash),
    BigInt(payload[0].output_index),
    new TxOutput(
      Address.fromBech32(scriptAddress),
      value,
      Datum.inline(ListData.fromCbor(hexToBytes(payload[0].inline_datum)))
    )
  );
}

const calculateWinningIndex = (seed: string, numParticipants: string) => {
  return ((BigInt("1103515245") * BigInt(seed) + BigInt(12345)) % BigInt("2147483648")) % BigInt(numParticipants)
}

export const createNftRaffle = async (
  policyIdHex: string,
  assetNameHex: string,
  numParticipants: number,
  numMaxTicketsPerWallet: number,
  ticketPriceInLovelaces: number,
  saltedSeed: string,
  lockNftScript: string,
  nftVaultScript: string,
  walletApi: Cip30Wallet) => {

  const networkParams = new NetworkParams(
    await fetch(networkParamsUrl)
      .then(response => response.json())
  )

  // Compile the Raffle Program
  const raffleProgram = Program.new(lockNftScript);
  const raffleUplcProgram = raffleProgram.compile(false);

  // Extract the validator script address
  const raffleAddress = Address.fromValidatorHash(raffleUplcProgram.validatorHash);
  console.log('valAddr: ' + raffleAddress.toBech32())

  // Compile the NFT Vault Script
  const vaultProgram = Program.new(nftVaultScript);
  const vaultUplcProgram = vaultProgram.compile(false);

  // Extract the validator script address
  const vaultAddress = Address.fromValidatorHash(vaultUplcProgram.validatorHash);
  console.log('vaultAddress: ' + vaultAddress.toBech32())
  console.log('vaultAddress.validatorHash.hex: ' + vaultAddress.validatorHash.hex)
  console.log('vaultAddress.toHex: ' + vaultAddress.toHex())

  const walletHelper = new WalletHelper(walletApi);
  const walletBaseAddress = await walletHelper.baseAddress

  // Lock NFT Prize in contract TX
  const tx = new Tx();

  const assets = new Assets();

  assets.addComponent(
    MintingPolicyHash.fromHex(policyIdHex),
    hexToBytes(assetNameHex),
    BigInt(1)
  );

  // NFT and 2 $ada to send to SC
  const nftValue = new Value(BigInt(2_000_000), assets)

  // Datum
  const raffleDatum = new (raffleProgram.types.Datum)(
    walletBaseAddress.pubKeyHash,
    new Value(BigInt(ticketPriceInLovelaces)),
    numMaxTicketsPerWallet,
    [],
    numParticipants,
    sha256(new TextEncoder().encode(saltedSeed)),
    vaultUplcProgram.validatorHash
  )

  console.log('DATUM 1: ' + raffleDatum)
  console.log('DATUM 1: ' + raffleDatum.toSchemaJson())

  const walletUtxos = await walletHelper.pickUtxos(nftValue)

  await tx
    .addInputs(walletUtxos[0])
    .addOutput(new TxOutput(raffleAddress, nftValue, Datum.inline(raffleDatum._toUplcData())))
    .finalize(networkParams, await walletHelper.changeAddress, walletUtxos[1]);

  console.log("tx after final", tx.dump());

  console.log("Verifying signature...");
  const signatures = await walletApi.signTx(tx);
  tx.addSignatures(signatures);

  console.log("Submitting transaction...");
  const txHash = await walletApi.submitTx(tx);
  console.log('txHash: ' + txHash.hex)


  raffleDatum

}

export const retrieveNft = async (
  policyIdHex: string,
  assetNameHex: string,
  lockNftScript: string,
  walletApi: Cip30Wallet
) => {

  const networkParams = new NetworkParams(
    await fetch(networkParamsUrl)
      .then(response => response.json())
  )

  // Compile the helios minting script
  const raffleProgram = Program.new(lockNftScript);
  const raffleUplcProgram = raffleProgram.compile(false);

  // Extract the validator script address
  const raffleAddress = Address.fromValidatorHash(raffleUplcProgram.validatorHash);
  console.log('valAddr: ' + raffleAddress.toBech32())

  const walletHelper = new WalletHelper(walletApi);
  const walletBaseAddress = await walletHelper.baseAddress

  const contractUtxo = await getKeyUtxo(raffleAddress.toBech32(), policyIdHex, assetNameHex)

  // const nonEmptyDatumUtxo = contractUtxo.filter(utxo => utxo.origOutput.datum != null)

  const walletUtxos = await walletHelper.pickUtxos(new Value(BigInt(1_000_000)))

  const valRedeemer = new ConstrData(0, []);
  // const valRedeemer = (new (program.types.Redeemer.Admin)([]))._toUplcData()

  const tx = new Tx();
  await tx.addInput(contractUtxo, valRedeemer)
    .addInputs(walletUtxos[0])
    .addOutput(new TxOutput(walletBaseAddress, contractUtxo.value))
    .attachScript(raffleUplcProgram)
    .addSigner(walletBaseAddress.pubKeyHash)
    .finalize(networkParams, await walletHelper.changeAddress, walletUtxos[1])

  console.log("tx after final", tx.dump());

  console.log("Verifying signature...");
  const signatures = await walletApi.signTx(tx);
  tx.addSignatures(signatures);

  console.log("Submitting transaction...");
  const txHash = await walletApi.submitTx(tx);
  console.log('txHash: ' + txHash.hex)


}

export const buyRaffleTickets = async (
  policyIdHex: string,
  assetNameHex: string,
  numTicketsToBuy: number,
  raffleScript: string,
  walletApi: Cip30Wallet
) => {

  const networkParams = new NetworkParams(
    await fetch(networkParamsUrl)
      .then(response => response.json())
  )

  // Compile the helios minting script
  const raffleProgram = Program.new(raffleScript);
  const raffleUplcProgram = raffleProgram.compile(false);
  console.log('raffleUplcProgram.validatorHash ' + raffleUplcProgram.validatorHash.hex)


  // Extract the validator script address
  const raffleAddress = Address.fromValidatorHash(raffleUplcProgram.validatorHash);
  console.log('valAddr: ' + raffleAddress.toBech32())
  console.log('valAddr.bytes: ' + raffleAddress.toHex())

  const walletHelper = new WalletHelper(walletApi);
  const walletBaseAddress = await walletHelper.baseAddress

  const contractUtxo = await getKeyUtxo(raffleAddress.toBech32(), policyIdHex, assetNameHex)

  const foo = contractUtxo.origOutput.datum.data as ListData
  const adminPkh = PubKeyHash.fromUplcData(foo.list[0])
  console.log('adminPkh: ' + adminPkh.hex)

  const ticketPrice = Value.fromUplcData(foo.list[1])
  console.log('ticketPrice: ' + ticketPrice.toSchemaJson())

  const numMaxTicketsPerWallet = foo.list[2] as IntData
  console.log('numMaxTicketsPerWallet: ' + numMaxTicketsPerWallet.value)

  const participants = (foo.list[3] as ListData).list.map(item => PubKeyHash.fromUplcData(item))
  console.log('participants: ' + participants)

  const numMaxParticipants = foo.list[4] as IntData
  console.log('numMaxParticipants: ' + numMaxParticipants.value)

  const seedHash = ByteArray.fromUplcData(foo.list[5])
  console.log('seedHash: ' + seedHash)

  const vaultPkh = ValidatorHash.fromUplcData(foo.list[6])
  console.log('vaultPkh: ' + vaultPkh.hex)

  const newParticipants = participants.slice()
  for (var i = 0; i < numTicketsToBuy; i++) {
    newParticipants.unshift(walletBaseAddress.pubKeyHash)
  }
  console.log('newParticipants: ' + newParticipants)

  // Join raffle by paying 5 $ada
  const ticketsPrice = new Value(BigInt(numTicketsToBuy) * ticketPrice.lovelace)
  const walletUtxos = await walletHelper.pickUtxos(ticketsPrice)

  const newDatum = new (raffleProgram.types.Datum)(
    adminPkh,
    ticketPrice,
    numMaxTicketsPerWallet.value,
    newParticipants,
    numMaxParticipants.value,
    seedHash,
    vaultPkh
  )

  const targetValue = ticketsPrice.add(contractUtxo.value)

  // Building redeemer manually
  // const valRedeemer = new ConstrData(1, [bruce.pubKeyHash._toUplcData()]);
  // Using types
  const valRedeemer = (new (raffleProgram.types.Redeemer as any).JoinRaffle(
    walletBaseAddress.pubKeyHash,
    numTicketsToBuy
  ))._toUplcData()

  const tx = new Tx();
  tx.addInput(contractUtxo, valRedeemer)
    .addInputs(walletUtxos[0])
    .addOutput(new TxOutput(raffleAddress, targetValue, Datum.inline(newDatum._toUplcData())))
    .attachScript(raffleUplcProgram)
    .addSigner(walletBaseAddress.pubKeyHash)

  console.log("tx before final", tx.dump());

  await tx.finalize(networkParams, await walletHelper.changeAddress, walletUtxos[1])

  console.log("tx after final", tx.dump());

  console.log("Verifying signature...");
  const signatures = await walletApi.signTx(tx);
  tx.addSignatures(signatures);

  console.log("Submitting transaction...");
  const txHash = await walletApi.submitTx(tx);
  console.log('txHash: ' + txHash.hex)

}

export const selectWinner = async (
  seed: string,
  salt: string,
  policyIdHex: string,
  assetNameHex: string,
  lockNftScript: string,
  nftVaultScript: string,
  walletApi: Cip30Wallet
) => {

  const networkParams = new NetworkParams(
    await fetch(networkParamsUrl)
      .then(response => response.json())
  )

  // Compile the Raffle Program
  const raffleProgram = Program.new(lockNftScript);
  const raffleUplcProgram = raffleProgram.compile(false);

  // Extract the validator script address
  const raffleAddress = Address.fromValidatorHash(raffleUplcProgram.validatorHash);
  console.log('valAddr: ' + raffleAddress.toBech32())

  // Compile the NFT Vault Script
  const vaultProgram = Program.new(nftVaultScript);
  const vaultUplcProgram = vaultProgram.compile(false);

  // Extract the validator script address
  const vaultAddress = Address.fromValidatorHash(vaultUplcProgram.validatorHash);
  console.log('vaultAddress: ' + vaultAddress.toBech32())
  console.log('vaultAddress.validatorHash.hex: ' + vaultAddress.validatorHash.hex)
  console.log('vaultAddress.toHex: ' + vaultAddress.toHex())

  const walletHelper = new WalletHelper(walletApi);
  const walletBaseAddress = await walletHelper.baseAddress
  console.log('walletBaseAddress: ' + walletBaseAddress.toBech32())
  console.log('walletBaseAddress.pubKeyHash: ' + walletBaseAddress.pubKeyHash.hex)


  console.log('a')
  const contractUtxo = await getKeyUtxo(raffleAddress.toBech32(), policyIdHex, assetNameHex)
  console.log('b')
  // const nonEmptyDatumUtxo = contractUtxo.filter(utxo => utxo.origOutput.datum != null)

  const walletUtxos = await walletHelper.pickUtxos(new Value(BigInt(5_000_000)))
  console.log('c')

  const foo = contractUtxo.origOutput.datum.data as ListData
  const adminPkh = PubKeyHash.fromUplcData(foo.list[0])
  console.log('adminPkh: ' + adminPkh.hex)

  const participants = (foo.list[3] as ListData).list.map(item => PubKeyHash.fromUplcData(item))
  console.log('participants: ' + participants)

  const vaultPkh = PubKeyHash.fromUplcData(foo.list[6])
  console.log('vaultPkh: ' + vaultPkh.hex)

  const totalValueLocked = contractUtxo.value

  const vaultValue = new Value(BigInt(2_000_000), totalValueLocked.assets)
  console.log('vaultValue: ' + vaultValue.toSchemaJson())

  const adminValue = totalValueLocked.sub(vaultValue)
  console.log('adminValue: ' + adminValue.toSchemaJson())

  const winningIndex = calculateWinningIndex(seed, `${participants.length}`)
  console.log('winningIndex: ' + winningIndex)
  // const valRedeemer = new ConstrData(0, []);

  const valRedeemer = (new (raffleProgram.types.Redeemer as any).SelectWinner(
    new ByteArray(Array.from(new TextEncoder().encode(seed))),
    new ByteArray(Array.from(new TextEncoder().encode(salt))),
    winningIndex
  ))._toUplcData()


  const vaultDatum = new (vaultProgram.types.Datum)(
    adminPkh,
    participants.at(Number(winningIndex))
  )

  const tx = new Tx();
  tx.addInput(contractUtxo, valRedeemer)
    .addInputs(walletUtxos[0])
    .addOutput(new TxOutput(walletBaseAddress, adminValue))
    .addOutput(new TxOutput(vaultAddress, vaultValue, Datum.inline(vaultDatum)))
    .attachScript(raffleUplcProgram)
    .addSigner(walletBaseAddress.pubKeyHash)

  console.log("tx before final", tx.dump());

  await tx.finalize(networkParams, await walletHelper.changeAddress, walletUtxos[1])

  console.log("tx after final", tx.dump());

  console.log("Verifying signature...");
  const signatures = await walletApi.signTx(tx);
  tx.addSignatures(signatures);

  console.log("Submitting transaction...");
  const txHash = await walletApi.submitTx(tx);
  console.log('txHash: ' + txHash.hex)


}

export const collectPrize = async (
  policyIdHex: string,
  assetNameHex: string,
  nftVaultScript: string,
  walletApi: Cip30Wallet
) => {

  const networkParams = new NetworkParams(
    await fetch(networkParamsUrl)
      .then(response => response.json())
  )

  // Compile the NFT Vault Script
  const vaultProgram = Program.new(nftVaultScript);
  const vaultUplcProgram = vaultProgram.compile(false);

  // Extract the validator script address
  const vaultAddress = Address.fromValidatorHash(vaultUplcProgram.validatorHash);
  
  const walletHelper = new WalletHelper(walletApi);
  const walletBaseAddress = await walletHelper.baseAddress
  
  const contractUtxo = await getKeyUtxo(vaultAddress.toBech32(), policyIdHex, assetNameHex)
  
  const walletUtxos = await walletHelper.pickUtxos(new Value(BigInt(1_000_000)))
  
  const valRedeemer = new ConstrData(1, []);

  const tx = new Tx();
  tx.addInput(contractUtxo, valRedeemer)
    .addInputs(walletUtxos[0])
    .addOutput(new TxOutput(walletBaseAddress, contractUtxo.value))
    .attachScript(vaultUplcProgram)
    .addSigner(walletBaseAddress.pubKeyHash)

  console.log("tx before final", tx.dump());

  await tx.finalize(networkParams, await walletHelper.changeAddress, walletUtxos[1])

  console.log("tx after final", tx.dump());

  console.log("Verifying signature...");
  const signatures = await walletApi.signTx(tx);
  tx.addSignatures(signatures);

  console.log("Submitting transaction...");
  const txHash = await walletApi.submitTx(tx);
  console.log('txHash: ' + txHash.hex)


}

export const mintNftInWallet = async (
  assetName: string,
  walletApi: Cip30Wallet
) => {

  console.log('mint nft')

  // Get wallet UTXOs
  const walletHelper = new WalletHelper(walletApi);
  const adaAmountVal = new Value(BigInt(1000000));

  const utxos = await walletHelper.pickUtxos(adaAmountVal);

  // Get change address
  const changeAddr = await walletHelper.changeAddress;

  // Determine the UTXO used for collateral
  const colatUtxo = await walletHelper.pickCollateral();

  // Start building the transaction
  const tx = new Tx();

  // Add the UTXO as inputs
  tx.addInputs(utxos[0]);

  const mintScript = `minting nft

  const TX_ID: ByteArray = #` + utxos[0][0].txId.hex + `
  const txId: TxId = TxId::new(TX_ID)
  const outputId: TxOutputId = TxOutputId::new(txId, ` + utxos[0][0].utxoIdx + `)
  
  func main(context: ScriptContext) -> Bool {
      tx: Tx = context.tx;
      mph: MintingPolicyHash = context.get_current_minting_policy_hash();
  
      assetclass: AssetClass = AssetClass::new(
          mph, 
          "` + assetName + `".encode_utf8()
      );
      value_minted: Value = tx.minted;
  
      // Validator logic starts
      (value_minted == Value::new(assetclass, 1)).trace("NFT1: ") &&
      tx.inputs.any((input: TxInput) -> Bool {
                                      (input.output_id == outputId).trace("NFT2: ")
                                      }
      )
  }`

  // Compile the helios minting script
  const mintProgram = Program.new(mintScript).compile(true);

  // Add the script as a witness to the transaction
  tx.attachScript(mintProgram);

  // Construct the NFT that we will want to send as an output
  const tokens: [number[], bigint][] = [[hexToBytes(Buffer.from(assetName).toString("hex")), BigInt(1)]];

  // Create an empty Redeemer because we must always send a Redeemer with
  // a plutus script transaction even if we don't actually use it.
  const mintRedeemer = new ConstrData(0, []);

  // Indicate the minting we want to include as part of this transaction
  tx.mintTokens(
    mintProgram.mintingPolicyHash,
    tokens,
    mintRedeemer
  )

  const lockedVal = new Value(adaAmountVal.lovelace, new Assets([[mintProgram.mintingPolicyHash, tokens]]));

  // Add the destination address and the amount of Ada to lock including a datum
  tx.addOutput(new TxOutput(changeAddr, lockedVal));

  // Add the collateral
  tx.addCollateral(colatUtxo);

  const networkParams = new NetworkParams(
    await fetch(networkParamsUrl)
      .then(response => response.json())
  )
  console.log("tx before final", tx.dump());

  // Send any change back to the buyer
  await tx.finalize(networkParams, changeAddr, utxos[1]);
  console.log("tx after final", tx.dump());

  console.log("Verifying signature...");
  const signatures = await walletApi.signTx(tx);
  tx.addSignatures(signatures);

  console.log("Submitting transaction...");
  const txHash = await walletApi.submitTx(tx);

  console.log("txHash", txHash.hex);

}