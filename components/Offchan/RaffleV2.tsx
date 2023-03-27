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
  UplcData,
  Time,
  bytesToHex,
} from "@hyperionbt/helios";
import {
  network,
  getBlockfrostKey,
  getNetworkParam,
  getBlockfrostUrl
} from "../../constants/blockfrost"
import { optimizeSmartContracts } from "../../constants/lottery"
import { sha256 } from 'js-sha256';

export const getKeyUtxo = async (scriptAddress: string, keyMPH: string, keyName: string) => {

  const blockfrostUrl: string = getBlockfrostUrl(network) + "/addresses/" + scriptAddress + "/utxos/" + keyMPH + keyName;

  let resp = await fetch(blockfrostUrl, {
    method: "GET",
    headers: {
      accept: "application/json",
      project_id: getBlockfrostKey(network),
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

export const rnd = (seed: string) => {
  return ((BigInt("1103515245") * BigInt(seed) + BigInt(12345)) % BigInt("2147483648"))
}

const calculateWinningIndex = (seed: string, numParticipants: string) => {
  return rnd(seed) % BigInt(numParticipants)
}

interface CreateRaffle {
  adminPkh: string,
  seedHash: string,
  vaultPkh: string
}

export const createNftRaffle = async (
  policyIdHex: string,
  assetNameHex: string,
  numParticipants: number,
  numMaxTicketsPerWallet: number,
  ticketPriceInLovelaces: number,
  deadline: Date,
  saltedSeed: string,
  lockNftScript: string,
  nftVaultScript: string,
  walletApi: Cip30Wallet) => {

  const networkParams = new NetworkParams(
    await fetch(getNetworkParam(network))
      .then(response => response.json())
  )

  // Compile the Raffle Program
  const raffleProgram = Program.new(lockNftScript);
  const raffleUplcProgram = raffleProgram.compile(optimizeSmartContracts);

  // Extract the validator script address
  const raffleAddress = Address.fromValidatorHash(raffleUplcProgram.validatorHash);

  // Compile the NFT Vault Script
  const vaultProgram = Program.new(nftVaultScript);
  const vaultUplcProgram = vaultProgram.compile(optimizeSmartContracts);

  // Extract the validator script address
  const vaultAddress = Address.fromValidatorHash(vaultUplcProgram.validatorHash);

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

  const seedHash = sha256(new TextEncoder().encode(saltedSeed))

  // Datum
  const raffleDatum = new (raffleProgram.types.Datum)(
    walletBaseAddress.pubKeyHash,
    new Value(BigInt(ticketPriceInLovelaces)),
    numMaxTicketsPerWallet,
    [],
    numParticipants,
    seedHash,
    vaultUplcProgram.validatorHash,
    deadline.getTime()
  )

  const walletUtxos = await walletHelper.pickUtxos(nftValue)

  await tx
    .addInputs(walletUtxos[0])
    .addOutput(new TxOutput(raffleAddress, nftValue, Datum.inline(raffleDatum._toUplcData())))
    .finalize(networkParams, await walletHelper.changeAddress, walletUtxos[1]);

  const signatures = await walletApi.signTx(tx);
  tx.addSignatures(signatures);

  const txHash = await walletApi.submitTx(tx);

  const newRaffle: CreateRaffle = {
    adminPkh: walletBaseAddress.pubKeyHash.hex,
    seedHash,
    vaultPkh: vaultUplcProgram.validatorHash.hex
  }

  return newRaffle

}

export const retrieveNft = async (
  policyIdHex: string,
  assetNameHex: string,
  lockNftScript: string,
  walletApi: Cip30Wallet
) => {

  const networkParams = new NetworkParams(
    await fetch(getNetworkParam(network))
      .then(response => response.json())
  )

  // Compile the helios minting script
  const raffleProgram = Program.new(lockNftScript);
  const raffleUplcProgram = raffleProgram.compile(optimizeSmartContracts);

  // Extract the validator script address
  const raffleAddress = Address.fromValidatorHash(raffleUplcProgram.validatorHash);

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

  const signatures = await walletApi.signTx(tx);
  tx.addSignatures(signatures);

  const txHash = await walletApi.submitTx(tx);

}

interface RaffleDatum {
  adminPkh: PubKeyHash,
  ticketPrice: Value,
  numMaxTicketsPerWallet: IntData,
  participants: PubKeyHash[],
  numMaxParticipants: IntData,
  seedHash: ByteArray,
  vaultPkh: ValidatorHash,
  deadline: Time
}

export const parseDatum = (datum: UplcData, raffleProgram: Program) => {

  const data = datum as ListData

  const adminPkh = PubKeyHash.fromUplcData(data.list[0])

  const ticketPrice = Value.fromUplcData(data.list[1])

  const numMaxTicketsPerWallet = data.list[2] as IntData

  const participants = (data.list[3] as ListData).list.map(item => PubKeyHash.fromUplcData(item))

  const numMaxParticipants = data.list[4] as IntData

  const seedHash = ByteArray.fromUplcData(data.list[5])

  const vaultPkh = ValidatorHash.fromUplcData(data.list[6])

  const deadline = Time.fromUplcData(data.list[7])

  const raffleDatum: RaffleDatum = {
    adminPkh,
    ticketPrice,
    numMaxTicketsPerWallet,
    participants,
    numMaxParticipants,
    seedHash,
    vaultPkh,
    deadline
  }

  return raffleDatum

}

export const buyRaffleTickets = async (
  policyIdHex: string,
  assetNameHex: string,
  numTicketsToBuy: number,
  raffleScript: string,
  walletApi: Cip30Wallet
) => {

  const networkParams = new NetworkParams(
    await fetch(getNetworkParam(network))
      .then(response => response.json())
  )

  // Compile the helios minting script
  const raffleProgram = Program.new(raffleScript);
  const raffleUplcProgram = raffleProgram.compile(optimizeSmartContracts);

  // Extract the validator script address
  const raffleAddress = Address.fromValidatorHash(raffleUplcProgram.validatorHash);

  const walletHelper = new WalletHelper(walletApi);
  const walletBaseAddress = await walletHelper.baseAddress

  const contractUtxo = await getKeyUtxo(raffleAddress.toBech32(), policyIdHex, assetNameHex)

  const currentDatum = parseDatum(contractUtxo.origOutput.datum.data, raffleProgram)

  const newParticipants = currentDatum.participants.slice()
  for (var i = 0; i < numTicketsToBuy; i++) {
    newParticipants.unshift(walletBaseAddress.pubKeyHash)
  }

  // Join raffle by paying 5 $ada
  const ticketsPrice = new Value(BigInt(numTicketsToBuy) * currentDatum.ticketPrice.lovelace)
  const walletUtxos = await walletHelper
    .pickUtxos(ticketsPrice)
    .catch(error => {
      console.error(error)
      throw new Error(' Insufficient Funds')
    })

  const newDatum = new (raffleProgram.types.Datum)(
    currentDatum.adminPkh,
    currentDatum.ticketPrice,
    currentDatum.numMaxTicketsPerWallet,
    newParticipants,
    currentDatum.numMaxParticipants,
    currentDatum.seedHash,
    currentDatum.vaultPkh,
    currentDatum.deadline
  )

  const targetValue = ticketsPrice.add(contractUtxo.value)

  // Using types
  const valRedeemer = (new (raffleProgram.types.Redeemer as any).JoinRaffle(
    walletBaseAddress.pubKeyHash,
    BigInt(numTicketsToBuy)
  ))._toUplcData()

  const now = new Date()
  const before = new Date(now.getTime())
  before.setHours(now.getHours() - 1)
  const after = new Date(now.getTime())
  after.setHours(now.getHours() + 1)

  const tx = new Tx();
  tx.addInput(contractUtxo, valRedeemer)
    .addInputs(walletUtxos[0])
    .addOutput(new TxOutput(raffleAddress, targetValue, Datum.inline(newDatum)))
    .attachScript(raffleUplcProgram)
    .validFrom(before)
    .validTo(after)
    .addSigner(walletBaseAddress.pubKeyHash)

  await tx.finalize(networkParams, await walletHelper.changeAddress, walletUtxos[1])


  const signatures = await walletApi.signTx(tx);
  tx.addSignatures(signatures);

  const txHash = await walletApi.submitTx(tx);

}

interface Winner {
  winnerPkh: string,
  participants: string[]
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
    await fetch(getNetworkParam(network))
      .then(response => response.json())
  )

  // Compile the Raffle Program
  const raffleProgram = Program.new(lockNftScript);
  const raffleUplcProgram = raffleProgram.compile(optimizeSmartContracts);

  // Extract the validator script address
  const raffleAddress = Address.fromValidatorHash(raffleUplcProgram.validatorHash);

  // Compile the NFT Vault Script
  const vaultProgram = Program.new(nftVaultScript);
  const vaultUplcProgram = vaultProgram.compile(optimizeSmartContracts);

  // Extract the validator script address
  const vaultAddress = Address.fromValidatorHash(vaultUplcProgram.validatorHash);

  const walletHelper = new WalletHelper(walletApi);
  const walletBaseAddress = await walletHelper.baseAddress

  const contractUtxo = await getKeyUtxo(raffleAddress.toBech32(), policyIdHex, assetNameHex)

  const walletUtxos = await walletHelper.pickUtxos(new Value(BigInt(5_000_000)))

  const currentDatum = parseDatum(contractUtxo.origOutput.datum.data, raffleProgram)

  const participants = currentDatum.participants

  const totalValueLocked = contractUtxo.value

  const vaultValue = new Value(BigInt(2_000_000), totalValueLocked.assets)

  const adminValue = totalValueLocked.sub(vaultValue)

  const winningIndex = calculateWinningIndex(seed, `${participants.length}`)
  console.log('winningIndex', winningIndex)

  const valRedeemer = (new (raffleProgram.types.Redeemer as any).SelectWinner(
    new ByteArray(Array.from(new TextEncoder().encode(seed))),
    new ByteArray(Array.from(new TextEncoder().encode(salt))),
    winningIndex
  ))._toUplcData()


  const vaultDatum = new (vaultProgram.types.Datum)(
    currentDatum.adminPkh,
    participants.at(Number(winningIndex))
  )

  const now = new Date()
  const before = new Date(now.getTime())
  before.setHours(now.getHours() - 1)
  const after = new Date(now.getTime())
  after.setHours(now.getHours() + 1)


  const tx = new Tx();
  tx.addInput(contractUtxo, valRedeemer)
    .addInputs(walletUtxos[0])
    .addOutput(new TxOutput(walletBaseAddress, adminValue))
    .addOutput(new TxOutput(vaultAddress, vaultValue, Datum.inline(vaultDatum)))
    .validFrom(before)
    .validTo(after)
    .attachScript(raffleUplcProgram)
    .addSigner(walletBaseAddress.pubKeyHash)

  await tx.finalize(networkParams, await walletHelper.changeAddress, walletUtxos[1])

  const signatures = await walletApi.signTx(tx);
  tx.addSignatures(signatures);

  const txHash = await walletApi.submitTx(tx);

  const winner: Winner = {
    winnerPkh: participants.at(Number(winningIndex)).hex,
    participants: participants.map(participant => participant.hex)
  }

  return winner
}

export const collectPrize = async (
  policyIdHex: string,
  assetNameHex: string,
  nftVaultScript: string,
  walletApi: Cip30Wallet
) => {

  const networkParams = new NetworkParams(
    await fetch(getNetworkParam(network))
      .then(response => response.json())
  )

  // Compile the NFT Vault Script
  const vaultProgram = Program.new(nftVaultScript);
  const vaultUplcProgram = vaultProgram.compile(optimizeSmartContracts);

  // Extract the validator script address
  const vaultAddress = Address.fromValidatorHash(vaultUplcProgram.validatorHash);

  const walletHelper = new WalletHelper(walletApi);
  const walletBaseAddress = await walletHelper.baseAddress

  const contractUtxo = await getKeyUtxo(vaultAddress.toBech32(), policyIdHex, assetNameHex)

  const walletUtxos = await walletHelper.pickUtxos(new Value(BigInt(1_000_000)))
    .catch(error => {
      console.error('error', error)
      throw new Error("Not enough funds!")
    })

  const valRedeemer = new ConstrData(1, []);

  const tx = new Tx();
  tx.addInput(contractUtxo, valRedeemer)
    .addInputs(walletUtxos[0])
    .addOutput(new TxOutput(walletBaseAddress, contractUtxo.value))
    .attachScript(vaultUplcProgram)
    .addSigner(walletBaseAddress.pubKeyHash)


  await tx.finalize(networkParams, await walletHelper.changeAddress, walletUtxos[1])

  const signatures = await walletApi.signTx(tx);
  tx.addSignatures(signatures);

  const txHash = await walletApi.submitTx(tx);

}

export const stealPrize = async (
  policyIdHex: string,
  assetNameHex: string,
  nftVaultScript: string,
  walletApi: Cip30Wallet
) => {

  const networkParams = new NetworkParams(
    await fetch(getNetworkParam(network))
      .then(response => response.json())
  )

  // Compile the NFT Vault Script
  const vaultProgram = Program.new(nftVaultScript);
  const vaultUplcProgram = vaultProgram.compile(optimizeSmartContracts);

  // Extract the validator script address
  const vaultAddress = Address.fromValidatorHash(vaultUplcProgram.validatorHash);

  const walletHelper = new WalletHelper(walletApi);
  const walletBaseAddress = await walletHelper.baseAddress

  const contractUtxo = await getKeyUtxo(vaultAddress.toBech32(), policyIdHex, assetNameHex)

  const walletUtxos = await walletHelper.pickUtxos(new Value(BigInt(1_000_000)))

  const valRedeemer = new ConstrData(0, []);

  const tx = new Tx();
  tx.addInput(contractUtxo, valRedeemer)
    .addInputs(walletUtxos[0])
    .addOutput(new TxOutput(walletBaseAddress, contractUtxo.value))
    .attachScript(vaultUplcProgram)
    .addSigner(walletBaseAddress.pubKeyHash)


  await tx.finalize(networkParams, await walletHelper.changeAddress, walletUtxos[1])

  const signatures = await walletApi.signTx(tx);
  tx.addSignatures(signatures);

  console.log('stuff', bytesToHex(tx.toCbor()))

  const txHash = await walletApi.submitTx(tx);

}

export const mintNftInWallet = async (
  assetName: string,
  walletApi: Cip30Wallet
) => {

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
    await fetch(getNetworkParam(network))
      .then(response => response.json())
  )

  // Send any change back to the buyer
  await tx.finalize(networkParams, changeAddr, utxos[1]);

  const signatures = await walletApi.signTx(tx);
  tx.addSignatures(signatures);

  const txHash = await walletApi.submitTx(tx);

}