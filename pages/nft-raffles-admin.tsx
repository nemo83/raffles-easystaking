import Layout from '../components/Layout';
import { useWalletContext } from "../components/WalletProvider";
import type { NextPage } from 'next'
import React from 'react';
import { useState, useEffect } from 'react';
import * as raffleV2 from "../components/Offchan/RaffleV2"
import path, { basename } from 'path';
import fs from 'fs';
import { Program, Address, PubKeyHash, NetworkParams, WalletHelper, Tx, Assets, MintingPolicyHash, hexToBytes, Value, TxOutput, Datum, ConstrData } from '@hyperionbt/helios';
import { getNetworkParam, network } from '../constants/blockfrost'
import { lotteryApi, optimizeSmartContracts } from '../constants/lottery'
import toast from 'react-hot-toast'

export async function getStaticProps() {

  const contractsDirectory = path.join(process.cwd(), 'components/Contracts/');
  const raffleContract = fs.readFileSync(contractsDirectory + 'raffle.hl', 'utf8');
  const raffleV2Contract = fs.readFileSync(contractsDirectory + 'raffle_v2.hl', 'utf8');
  const vaultContract = fs.readFileSync(contractsDirectory + 'vault.hl', 'utf8');
  const raffleV2Script = raffleV2Contract.toString();
  const raffleScript = raffleContract.toString();
  const vaultScript = vaultContract.toString();

  const scripts = {
    raffleScript,
    raffleV2Script,
    vaultScript
  }

  return {
    props: {
      scripts
    }
  }

}

const NftRaffles: NextPage = (props: any) => {

  const raffleScript = props.scripts.raffleScript
  const raffleV2Script = props.scripts.raffleV2Script
  const vaultScript = props.scripts.vaultScript

  const [policyId, setPolicyId] = useState('');
  const [assetName, setAssetName] = useState('');
  const [collectionName, setCollectionName] = useState('');
  const [nftName, setNftName] = useState('');
  const [ticketPrice, setTicketPrice] = useState(5_000_000);
  const [numMaxParticipants, setNumMaxParticipants] = useState(10);
  const [numMaxTicketsPerPerson, setNumMaxTicketsPerPerson] = useState(3);
  const [deadline, setDeadline] = useState('');
  const [seed, setSeed] = useState('');
  const [salt, setSalt] = useState('');
  const [nextSeed, setNextSeed] = useState('')

  const [mainImgUrl, setMainImgUrl] = useState('https://ipfs.io/ipfs/QmdHiHmWdt2gonmViGwJcvp4gfZiuVyrtub7H7iCc5QSmf');

  const [walletApi, setWalletApi] = useWalletContext();

  useEffect(() => {
    const nextSeed = raffleV2.rnd(seed)
    setNextSeed(nextSeed.toString())
  }, [seed])

  useEffect(() => {

    if (policyId) {
      if (policyId.indexOf(".") != -1) {
        const parts = policyId.split(".")
        setPolicyId(parts[0])
        setAssetName(Buffer.from(parts[1], "hex").toString())
      }
    }

  }, [policyId])

  const buildScripts = () => {

    const raffleProgram = Program.new(raffleScript).compile(optimizeSmartContracts)
    const raffleAddress = Address.fromValidatorHash(raffleProgram.validatorHash);
    console.log('raffleAddress: ' + raffleAddress.toBech32())

    const raffleV2Program = Program.new(raffleV2Script).compile(optimizeSmartContracts)
    const raffleV2Address = Address.fromValidatorHash(raffleV2Program.validatorHash);
    console.log('raffleV2Address: ' + raffleV2Address.toBech32())

    const vaultProgram = Program.new(vaultScript).compile(optimizeSmartContracts)
    const vaultAddress = Address.fromValidatorHash(vaultProgram.validatorHash);
    console.log('vaultAddress: ' + vaultAddress.toBech32())

  }

  const callMintScript = async () => {
    raffleV2.mintNftInWallet(
      "Hello world!",
      walletApi
    )
  }

  const createRaffleV2 = async () => {

    const saltedSeed = `${seed}${salt}`

    const date = new Date(deadline)

    raffleV2.createNftRaffle(
      policyId,
      Buffer.from(assetName).toString("hex"),
      numMaxParticipants,
      numMaxTicketsPerPerson,
      ticketPrice,
      date,
      saltedSeed,
      raffleV2Script,
      vaultScript,
      walletApi
    ).then(async (createRaffle) => {

      const body = JSON.stringify({
        policy_id: policyId,
        asset_name: Buffer.from(assetName).toString("hex"),
        collection_name: collectionName,
        nft_name: nftName,
        main_img_url: mainImgUrl,
        network,
        admin_pkh: createRaffle.adminPkh,
        ticket_price: ticketPrice,
        num_max_tickets_per_wallet: numMaxTicketsPerPerson,
        num_max_participants: numMaxParticipants,
        seed_hash: createRaffle.seedHash,
        vault_pkh: createRaffle.vaultPkh,
        deadline: date.toISOString()
      })

      console.log('body: ' + body)

      let resp = await fetch(`${lotteryApi}/nft_raffles`, {
        method: "POST",
        headers: {
          'content-type': "application/json",
          accept: "application/json"
        },
        body
      });

      if (resp?.status == 200) {
        toast.success('NFT Raffle successfully created!')
      } else {
        toast.error('Error while creating NFT Raffle')
      }

    })

  }

  const withdrawAll = async () => {
    return raffleV2.retrieveNft(
      policyId,
      Buffer.from(assetName).toString("hex"),
      raffleV2Script,
      walletApi
    )
  }

  const selectRaffleWinnerV2 = async () => {
    raffleV2.selectWinner(
      seed,
      salt,
      policyId,
      Buffer.from(assetName).toString("hex"),
      raffleV2Script,
      vaultScript,
      walletApi
    ).then(async (winner) => {

      const body = JSON.stringify({
        policy_id: policyId,
        asset_name: Buffer.from(assetName).toString("hex"),
        network,
        winner_pkh: winner.winnerPkh,
        participants: winner.participants
      })

      console.log('body: ' + body)

      let resp = await fetch(`${lotteryApi}/nft_raffles/close`, {
        method: "POST",
        headers: {
          'content-type': "application/json",
          accept: "application/json"
        },
        body
      });

      if (resp?.status == 200) {
        toast.success('NFT Raffle successfully created!')
      } else {
        toast.error('Error while creating NFT Raffle')
      }

    })
  }

  const getNftDetails = async (policyId: string, assetName: string) => {

    const body = JSON.stringify({
      policy_id: policyId,
      asset_names: [assetName]
    })

    let resp = await fetch("https://hilltop-api.mainnet.dandelion.blockwarelabs.io/native_assets/native_assets_details", {
      method: "POST",
      headers: {
        'content-type': "application/json",
        accept: "application/json"
      },
      body
    });

    if (resp?.status > 299) {
      throw console.error("NFT not found", resp);
    }
    const payload = await resp.json();
    console.log("nft details: " + JSON.stringify(payload))

    if (payload.length == 0) {
      throw console.error("NFT not found");
    }


  }

  const updateDbRaffles = async () => {

    const uplcProgram = Program.new(raffleV2Script).compile(optimizeSmartContracts)

    const address = Address.fromValidatorHash(uplcProgram.validatorHash)

    fetch(`${lotteryApi}/nft_raffles`, {
      headers: {
        accept: "application/json"
      }
    })
      .then(raffles => raffles.json())
      .then(raffles => {
        const promises = raffles
          .filter(raffle => raffle.network == network && raffle.policy_id == policyId)
          .map(raffle => {
            raffleV2
              .getKeyUtxo(address.toBech32(), raffle.policy_id, raffle.asset_name)
              .then(utxo => {
                console.log('utxo', JSON.stringify(utxo))
                const datum = raffleV2.parseDatum(utxo.origOutput.datum.data, Program.new(raffleScript))
                const body = JSON.stringify({
                  policy_id: raffle.policy_id,
                  asset_name: raffle.asset_name,
                  collection_name: raffle.collection_name,
                  nft_name: raffle.nft_name,
                  main_img_url: raffle.main_img_url,
                  status: raffle.status,
                  network,
                  participants: datum.participants.map(participant => participant.hex),
                  deadline: new Date(Number(datum.deadline.value)).toISOString()
                })

                return fetch(`${lotteryApi}/nft_raffles`, {
                  method: "PUT",
                  headers: {
                    'content-type': "application/json",
                    accept: "application/json"
                  },
                  body
                })

              })
          })

        return Promise.all(promises)
      })
      .then(promises => {
        console.log('promises', JSON.stringify(promises))
      })

  }

  const migrateToV2 = async () => {

    const networkParams = new NetworkParams(
      await fetch(getNetworkParam(network))
        .then(response => response.json())
    )

    // Compile the Raffle Program
    const raffleProgram = Program.new(raffleScript);
    const raffleUplcProgram = raffleProgram.compile(optimizeSmartContracts);

    // Extract the validator script address
    const raffleAddress = Address.fromValidatorHash(raffleUplcProgram.validatorHash);

    // Compile the NFT Vault Script
    const raffleV2Program = Program.new(raffleV2Script);
    const uplcRaffleV2Program = raffleV2Program.compile(optimizeSmartContracts);

    // Extract the validator script address
    const raffleV2Address = Address.fromValidatorHash(uplcRaffleV2Program.validatorHash);

    const walletHelper = new WalletHelper(walletApi);
    const walletBaseAddress = await walletHelper.baseAddress

    // Lock NFT Prize in contract TX
    const tx = new Tx();

    const value = new Value(BigInt(1_000_000))

    const raffleV1Utxo = await (null as any).getKeyUtxo(raffleAddress.toBech32(), policyId, Buffer.from(assetName).toString("hex"))

    const datumV1 = (null as any).parseDatum(raffleV1Utxo.origOutput.datum.data, raffleProgram)
    console.log('datumV1', JSON.stringify(datumV1))

    const walletUtxos = await walletHelper.pickUtxos(value)

    // Datum
    const raffleV2Datum = new (raffleV2Program.types.Datum)(
      datumV1.adminPkh,
      new Value(BigInt(Number(datumV1.ticketPrice))),
      datumV1.numMaxTicketsPerWallet,
      datumV1.participants,
      numMaxParticipants,
      datumV1.seedHash,
      datumV1.vaultPkh,
      new Date(deadline)
    )

    await tx
      .addInputs(walletUtxos[0])
      .addInput(raffleV1Utxo, new ConstrData(0, []))
      .addOutput(new TxOutput(raffleV2Address, raffleV1Utxo.origOutput.value, Datum.inline(raffleV2Datum)))
      .addSigner(walletBaseAddress.pubKeyHash)
      .attachScript(raffleUplcProgram)
      .finalize(networkParams, await walletHelper.changeAddress, walletUtxos[1]);

    const signatures = await walletApi.signTx(tx);
    tx.addSignatures(signatures);

    const txHash = await walletApi.submitTx(tx);

  }


  return (
    <Layout >

      <button
        className="px-6 py-3 mb-1 mr-1 text-sm font-bold text-white uppercase rounded shadow outline-none bg-slate-300 hover:bg-slate-400 focus:outline-none"
        type="button"
        onClick={() => buildScripts()} >
        Build Scripts
      </button>
      <button
        className="px-6 py-3 mb-1 mr-1 text-sm font-bold text-white uppercase rounded shadow outline-none bg-slate-300 hover:bg-slate-400 focus:outline-none"
        type="button"
        onClick={() => getNftDetails(policyId, assetName)} >
        Get NFT Details
      </button>
      <button
        className="px-6 py-3 mb-1 mr-1 text-sm font-bold text-white uppercase rounded shadow outline-none bg-slate-300 hover:bg-slate-400 focus:outline-none"
        type="button"
        onClick={() => callMintScript()} >
        Mint NFT
      </button>
      <button
        className="px-6 py-3 mb-1 mr-1 text-sm font-bold text-white uppercase rounded shadow outline-none bg-slate-300 hover:bg-slate-400 focus:outline-none"
        type="button"
        onClick={() => withdrawAll()} >
        Withdraw all
      </button>
      <button
        className="px-6 py-3 mb-1 mr-1 text-sm font-bold text-white uppercase rounded shadow outline-none bg-slate-300 hover:bg-slate-400 focus:outline-none"
        type="button"
        onClick={() => raffleV2.stealPrize(policyId, Buffer.from(assetName).toString("hex"), vaultScript, walletApi)} >
        Steal Prize
      </button>
      <button
        className="px-6 py-3 mb-1 mr-1 text-sm font-bold text-white uppercase rounded shadow outline-none bg-slate-300 hover:bg-slate-400 focus:outline-none"
        type="button"
        onClick={() => updateDbRaffles()} >
        Update DB Raffles
      </button>
      <div className="block w-full max-w-sm p-6 rounded-lg shadow-lg ">
        <form>
          <div className="relative mb-12">
            <label className="block mb-1 text-sm font-bold text-black">
              Policy Id
            </label>
            <input type={'text'} value={policyId} onChange={(event) => setPolicyId(event.target.value)}></input>
            <label className="block mb-1 text-sm font-bold text-black">
              Asset Name
            </label>
            <input type={'text'} value={assetName} onChange={(event) => setAssetName(event.target.value)}></input>
            <label className="block mb-1 text-sm font-bold text-black">
              Collection Name
            </label>
            <input type={'text'} value={collectionName} onChange={(event) => setCollectionName(event.target.value)}></input>
            <label className="block mb-1 text-sm font-bold text-black">
              Nft Name
            </label>
            <input type={'text'} value={nftName} onChange={(event) => setNftName(event.target.value)}></input>
            <label className="block mb-1 text-sm font-bold text-black">
              Nft URL Image
            </label>
            <input type={'text'} value={mainImgUrl} onChange={(event) => setMainImgUrl(event.target.value)}></input>
            <label className="block mb-1 text-sm font-bold text-black">
              Ticket Price (in lovelace)
            </label>
            <input type={'number'} value={ticketPrice} onChange={(event) => setTicketPrice(Number(event.target.value))}></input>
            <label className="block mb-1 text-sm font-bold text-black">
              Max number of Participants
            </label>
            <input type={'number'} value={numMaxParticipants} onChange={(event) => setNumMaxParticipants(Number(event.target.value))}></input>
            <label className="block mb-1 text-sm font-bold text-black">
              Deadline
            </label>
            <input type={'datetime-local'} value={deadline} onChange={(event) => setDeadline(event.target.value)}></input>
            <label className="block mb-1 text-sm font-bold text-black">
              Max tickets per Wallet
            </label>
            <input type={'number'} value={numMaxTicketsPerPerson} onChange={(event) => setNumMaxTicketsPerPerson(Number(event.target.value))}></input>
            <label className="block mb-1 text-sm font-bold text-black">
              Seed
            </label>
            <input type={'number'} value={seed} onChange={(event) => setSeed(event.target.value)}></input>
            <label className="block mb-1 text-sm font-bold text-black">
              Salt
            </label>
            <input type={'text'} value={salt} onChange={(event) => setSalt(event.target.value)}></input>
            <label className="block mb-1 text-sm font-bold text-black">
              Next Salt
            </label>
            <input type={'text'} value={nextSeed} disabled={true}></input>
          </div>
          <div>
            <h2> Raffle V2</h2>
            <button
              className="px-6 py-3 mb-1 mr-1 text-sm font-bold text-white uppercase rounded shadow outline-none bg-slate-300 hover:bg-slate-400 focus:outline-none"
              type="button"
              onClick={() => createRaffleV2()} >
              Create Raffle
            </button>
            <button
              className="px-6 py-3 mb-1 mr-1 text-sm font-bold text-white uppercase rounded shadow outline-none bg-slate-300 hover:bg-slate-400 focus:outline-none"
              type="button"
              onClick={() => selectRaffleWinnerV2()} >
              Select Winner
            </button>
            <button
              className="px-6 py-3 mb-1 mr-1 text-sm font-bold text-white uppercase rounded shadow outline-none bg-slate-300 hover:bg-slate-400 focus:outline-none"
              type="button"
              onClick={() => migrateToV2()} >
              Migrate Raffle
            </button>
          </div>
        </form>
      </div>

    </Layout >
  )
}

export default NftRaffles
