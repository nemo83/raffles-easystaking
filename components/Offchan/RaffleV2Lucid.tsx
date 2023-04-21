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
import { optimizeSmartContracts, useRaffleRefScript, raffleRefScriptAddress, raffleRefScriptHash, raffleRefScriptIndex } from "../../constants/lottery"

import {
  Lucid,
  Datum as LucidDatum,
  Redeemer,
  Blockfrost,
  Data,
  SpendingValidator,
  Assets as LucidAssets,
  WalletApi
} from "lucid-cardano"

// const raffleV2Script: SpendingValidator = {
//   type: "PlutusV2",
//   script: "59122359122001000032323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232222533357346660080060040022930b11119299ab9c30ac01330aa0130ab0149010f74782e74696d655f72616e67653a2000530a301309b0100115335738615802661540261560292110646174756d2e646561646c696e653a20005309a0130170041323325333573466e1c0052000123309b013301800700430ae0149011054524143455f49535f41444d494e3a200015333573466e1c005200212533357346613402266134022661360266018008602a002615c029211d54524143455f5349474e45445f42595f5041525449434950414e543a200013309b01300e00730ae0149111524146464c455f4e4f545f46554c4c3a200013309b013301700700430ae01491114245464f52455f444541444c494e453a20001323232533573861640266160026162029211361637475616c54617267657456616c75653a200053096010011323309e0113309f013308b0100200130b2014911054524143455f414c4c5f474f4f443f2000133300c00b3019005301800533087013086010033308401302300a3017004333306b006530610070014a266666666666666666034010941264a093250499289999805005180f804180b001180a8012504992824c941264a0931834298300028a89984d80a5030ae014910f4f564552414c4c5f434845434b3a2000123232323309d0113309d0113309d0113309d0113306113309e013301900a00730b101490115444541444c494e455f4e4f545f5041535345443a200013309e01301000a30b1014911354524143455f524146464c455f46554c4c3a200013309e013309901301f00a00330b1014910c534545445f4d415443483a200013309e0133060305e302100a37509000185880a481114e4f5f5041525449434950414e54533a200013309e013305d3300e001305e302100a301400430b1014910d54524143455f494e4445583a200013333300d007308601306b53063008301e00a302400a3305c302100a3014004305900153057301400253055330543013001301200135573a6ea800400400cc17c004888cc254044cc138cc134c158cc130c06400c8cc13000400c004c06800c4cc138cc134c158c06400c004c06000c88894ccd5cd198270009ba848000400c544cccc010010cc12800c008008cc124004dd42400444444a66ae70c2a804cc2a004c2a4052411a746f74616c56616c75654c6f636b65646c6f76656c6163653a20005308e0100413253357386156026615202615402921086173736574733a20005308f0100113232325335738615c026615802615a029211b76616c756553656e74546f41646d696e2e6c6f76656c6163653a2000530a601530470011325335738615e026615a02615c0292011b76616c756553656e74546f5661756c742e6c6f76656c6163653a2000530a7015304800113309a0113309b01330870100200330ae0149010d41444d494e5f56414c55453a200013309b013304700400130ae014910d5641554c545f56414c55453a20003333068009007374e66ae80018cd5d00029bb1499289981f8040029981e8030009984000800981d1ba8482024bd0054c0d801088cc0c4cc0c4cc124cc0c0dd4241b5736538100046ea120f2c0013750904040404008000911981580100091814180100091981318271808800980800081101003504b0084c0084a0084b00911980d9845008009803001111980c9844808009802801111980f80098058011111111111111111119191919191919191ba733574001066ae8001ccd5d000319aba000533574000866ae8000ccd5d000119aba00013762932999ab9a0091008130190185333573401420122603202ea666ae6802c40284c0640594ccd5cd00608058980c80aa999ab9a00d100c130190145333573401c201a26032026a666ae6803c40384c0640494ccd5cd00808078980c80880680580480380280180880791aba1300c001235742601400246ae84c0200048d5d0980300091aba13004001235742600400246ae88c0080048d5d1180100091aba23002001235744600400246ae88c0080048d5d1180300091191991192999ab9a3370e00290020a5015333573466e1c005200014a22a666ae680084cdc41bad357426aae78dd50019bad0051337126eb4d5d09aab9e37540066eb4014d55ce9baa002308001001307f307d001307c00222323322325333573466e1c005200014a02a666ae68cdc3800a4008294454ccd5cd001099b88375a00a6eb4d5d09aab9e3754006266e24dd68029bad357426aae78dd50019aab9d375400460fe00260fc60f800260fc00446ae84dd600091aba130020012357446eb000488cdc41bad002375a0020b044660ba6eb0c00c0088cdd780080100091aba1300200123574460d2002446ea0cdc11bad002375a002446ea0cdc31bad002375a00242660040024460a866e3cdd700124500232232374c6600a0060024660046aae74004d55cf0009bab00122333042002001376493119801006000912999ab9a3370e90001bad001104213322374c66ae80cdd80011ba633574066ec000400cdd924c6ec926306e002306b0022233304770200400244607e6600600400244660720044660080020044464a666ae68c0180044cdd7801180298020008a5030333032002233033001480001988cdc39aab9d3754002900011199821b870020012133006001002330013752911003752910100223374a9000198018010009119aba00023003001233574000208c44666444664466600400400200a444a666aae7c0044dd4240002a666ae68cdd79aab9d3574200200a2660040046eacd55cf1aba100113330030030023574400244a666aae7c0044dd4240002a666ae68cdd79aab9d3574200200626aae78d5d08008998010011aba2001375600460c000260ba002446ea0cdc09bad002375a00246446e9ccd5d00008011bac0010472322374e6605c0040026eb000488dd419b80375a0046eb400488cdc49bad002375a002446ea4cdc51bae002375c00246426ea4dc90009bae0012321305a37320026eb80048c8dd41991192999ab9a3370e00490300a999ab9a3370e00690010a40002c2a666ae68cdc3801240b42a666ae68cdc399b8e0044800920601613370466600200290002400490008999800800a400090001112999ab9a3370e00200a200426466600800800266e0000920023370066e08009201430083371c00c0026e34004cdc7000a40006eb800494ccd5cd19b89001481c854ccd5cd19b89481800044cdc0800a40c02c2c4644646660020020066eb40088894ccd55cf8010b0a999ab9a3371000290000b0a999ab9a3370e002900009aba100213330030033574400466e040052002375800207a460046eb00048c8dd419800800801112999aab9f0011480004cdc0198010011aba20014800888c0c4cdc41bad002375a00244a666ae6940085288a80090980c980b980b180a98052980100090991980398031802801119baf30050010025300200121304b304800104904804723223330050020010043758002400244464666002002008006444a666aae7c0085854ccd5cd18009aba1002130043574200426660060066ae880080041008888c064cccc01401000c00800488894ccd5cd00089998048020018010999802802001801111191980900211981a099806000802099803800801180200091ba937286ecc00488cdd7a980180100090992999ab9a3370e6aae7400520021357426aae780044dd4a4500375460080024446601a00646605e26600e00200626600a0020044464a666ae68cdc39aab9d001480104cdd78011aba135573c0022940dd5180180100511192999ab9a300900113375e0046010600c0022940c010c00c0080e00dc8cc0080052002225333573466e1cd55ce9baa00200110021603423370e6aae74dd5000a4004446e9ccc014dd6180180100080091aba1302b001223330030020010172223233300100100400322253335573e00420082a666ae68c004d5d0801099aba0357420046660060066ae880080044ccc00c00cd5d10010009199801800911980480118040008011ba63764931191119980e8018010009bac0012232330040032337040020046eb400488c8c8c8dd319800800801912999aab9f001137649309919aba0337606aae74004dd3198020021bab35573c002660060066ae88008d5d0800912999aab9f001137649309919aba0337606aae74004dd418029bad35573c002660060066ae88008d5d08009bab002025223330037000040024446644646e98ccc004004cc03800c008dd924c444a666aae7c00840044cc88c94ccd55cf8008801099aba0337600066e98004008ccc02c028cc03801c008cc038018008d5d08011998018019aba200200137560046eac004888c8ccc004004cc02c00c008dd924c444a666aae7c00840044cc88c94ccd5cd19b870014800040084cd5d019bb00033750002004660106601a00e0046601a00c0046ae84008ccc00c00cd5d10010009119980191180499b88002001002001222332232330010013300b0030022253335573e00229444c94ccd5cd180619980500419804802800998048020008a50133003003357440046ae84004dd58011bab0012232330010010032253335573e00226ec92615333573466ebcd55ce9aba1001003137566aae78d5d08008998010011aba20012223233001001330070030022253335573e00229444c94ccd5cd18041980319803802800998038020008a50133003003357440046ae8400488c8ccc00400400c0088894ccd55cf8010a40002a666ae68cdd79aab9d3574200400226eb4d55cf1aba10021333003003357440040024666ae6800528251223232323300a00300133300100100200322253335573e0022014264a666ae68cc0240140044ccc01001000cd5d1001099aba0001333004004003357440046aae74d5d0800980180111919800800801112999aab9f001100613357406aae74d5d0800998010011aba2001223300300223375e0020044464666002002006004444a666aae7c0085280a999ab9a30013574200429444ccc00c00cd5d10010009bb149888c8ccc00400400800c8894ccd55cf8008801099aba0357420026660060060046ae8800484ccc018004888ccc024004888cc08400d4ccd5cd198050029ba9488100133021302249010a6c6f76656c6163653a2000330215301b0013022491010a0013302153008005330213022491012e0033021530080023302130224901023a2000330215301b0013022491010a00003301c49100232132301d3300100100222325333573466e21200000113372c6e64c8ccd5cd19b87371a002900119b8b48180004004dd7298031ba83371c004900019801801999b8c48008004008524100371a0026eb80048c84c8dd4a999ab9a337100049000099b8b48168cc004004cdc100124002266002002004446464a666ae68cdc4001a40402002266e28cc010010cdc1801a404000266e2cccd5cd19b8800148050cdc0000a40c066e0000520ae01489003370c00290101bad00100175e464446466600c008002004446660080046aae74004d55cf0009bab001222323333001001004003002222253335573e0062002266660080086ae8800c008cc008004d5d0801912999ab9a50021500114a04466ae70c058cc0500054c00c00800884c04cccd5cd000a48104747275650049010566616c73650000a001235742600400246ae88c0080048d5d1180100091aba23002001235744600400246ae88c0080048d5d11802800909919804991991198062999ab9a0011300d491015b001300d4910128003004002300800130073005001300700233009300a491012c003233223300c3004002533357340022601a9201015d001300d49101290030080013007300500130040022325333573466e1c00520001300b491042d696e660015333573466e1c00520041300b4901042b696e660013253005357420026aae78dd50011aab9d3754002464260126e64c94ccd5cd19b88002480004cdc5a40b46600200266e08009200113300100100222325333573466e20009201410011337146600600666e0c00920140013371666e00cdc3000a40289030244100375a00246ae84c0080048d5d118020009199ab9a3370e6aae74dd5000a40009412891aba13002001235573c6ea800488c00ccdcb1802001180200091ba9373000246e64dd70009"
// }

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

const getLucid = async () => {

  let lucidNetwork;
  switch (network) {
    case "preview":
      lucidNetwork = "Preview"
      break;
    case "preprod":
      lucidNetwork = "Preprod"
      break;
    default:
      lucidNetwork = "Mainnet"
      break;
  }

  return Lucid.new(
    new Blockfrost(getBlockfrostUrl(network), getBlockfrostKey(network)),
    lucidNetwork,
  )
}

export const buyRaffleTicketsV2 = async (
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
  before.setMinutes(now.getMinutes() - 5)
  const after = new Date(now.getTime())
  after.setMinutes(now.getMinutes() + 5)


  const scriptCbor = bytesToHex(raffleUplcProgram.toCbor())

  const raffleV2Script: SpendingValidator = {
    type: "PlutusV2",
    script: scriptCbor
  }

  getLucid()
    .then(lucid => {

      lucid
        .utxosAt(raffleAddress.toBech32())
        .then(utxos => {
          const utxo = utxos.find(utxo => utxo.assets[`${policyIdHex}${assetNameHex}`] == BigInt(1))

          if (!utxo) throw new Error("Utxo not found")

          console.log('assets before', utxo.assets)

          const pay = utxo.assets

          pay["lovelace"] = pay["lovelace"] + ticketsPrice.lovelace

          console.log('assets after', utxo.assets)

          lucid
            .selectWallet(walletApi as unknown as WalletApi)
            .newTx()
            .collectFrom([utxo], Data.to(Data.fromJson(valRedeemer.toSchemaJson())))
            .payToContract(raffleAddress.toBech32(), { inline: Data.to(Data.from(newDatum.toSchemaJson())) }, pay)
            .validFrom(before.getTime())
            .validTo(after.getTime())
            .attachSpendingValidator(raffleV2Script)
            .addSignerKey(walletBaseAddress.pubKeyHash.hex)
            .complete()


        })


    })






  // const tx = new Tx();
  // tx.addInput(contractUtxo, valRedeemer)
  //   .addInputs(walletUtxos[0])
  //   .addOutput(new TxOutput(raffleAddress, targetValue, Datum.inline(newDatum)))
  //   .validFrom(before)
  //   .validTo(after)
  //   .addSigner(walletBaseAddress.pubKeyHash)

  // await tx.finalize(networkParams, await walletHelper.changeAddress, walletUtxos[1])

  // const signatures = await walletApi.signTx(tx);
  // tx.addSignatures(signatures);

  // const txHash = await walletApi.submitTx(tx);

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
  // const walletUtxos = await walletHelper
  //   .pickUtxos(ticketsPrice.add(new Value(BigInt(10_000_000))))
  //   .catch(error => {
  //     console.error(error)
  //     throw new Error(' Insufficient Funds')
  //   })

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
  const redeemer = (new (raffleProgram.types.Redeemer as any).JoinRaffle(
    walletBaseAddress.pubKeyHash,
    BigInt(numTicketsToBuy)
  ))

  const valRedeemer = redeemer._toUplcData()

  const now = new Date()
  const before = new Date(now.getTime())
  before.setMinutes(now.getMinutes() - 5)
  const after = new Date(now.getTime())
  after.setMinutes(now.getMinutes() + 5)

  getLucid()
    .then(lucid => {

      lucid
        .utxosAt(raffleAddress.toBech32())
        .then(utxos => {
          const utxo = utxos.find(utxo => utxo.assets[`${policyIdHex}${assetNameHex}`] == BigInt(1))

          if (!utxo) throw new Error("Utxo not found")

          const pay = ticketsPrice.lovelace

          lucid
            .selectWallet(walletApi as unknown as WalletApi)
            .newTx()
            .collectFrom([utxo], Data.to(Data.fromJson(redeemer.toSchemaJson())))
            // .payToContract(raffleAddress.toBech32(), { inline: myatum }, { pay })
            .attachSpendingValidator(null)
            .complete()


        })


    })



  // const tx = new Tx();
  // tx.addInput(contractUtxo, valRedeemer)
  //   .addInputs(walletUtxos[0])
  //   .addOutput(new TxOutput(raffleAddress, targetValue, Datum.inline(newDatum)))
  //   .attachScript(raffleUplcProgram)
  //   .validFrom(before)
  //   .validTo(after)
  //   .addSigner(walletBaseAddress.pubKeyHash)

  // // console.log("tx before final", tx.dump());
  // // console.log("tx before final CBOR: ", bytesToHex(tx.toCbor()))

  // await tx.finalize(networkParams, await walletHelper.changeAddress)

  // // console.log("tx after final", tx.dump());
  // // console.log("tx after final CBOR: ", bytesToHex(tx.toCbor()))

  // const signatures = await walletApi.signTx(tx);
  // tx.addSignatures(signatures);

  // // console.log(bytesToHex(tx.toCbor()))

  // const txHash = await walletApi.submitTx(tx);

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

  const walletUtxos = await walletHelper.pickUtxos(new Value(BigInt(5_000_000)))
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

  await tx.finalize(networkParams, await walletHelper.changeAddress)

  const signatures = await walletApi.signTx(tx);
  tx.addSignatures(signatures);

  const txHash = await walletApi.submitTx(tx);

}
