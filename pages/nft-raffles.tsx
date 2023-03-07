import Layout from '../components/Layout';
import { useWalletContext } from "../components/WalletProvider";
import type { NextPage } from 'next'
import React from 'react';
import {
  MintingPolicyHash,
  UTxO,
  Assets,
  hexToBytes,
  TxId,
  Value,
  TxOutput,
  Address,
  Datum,
  ListData,
  ByteArray,
  PubKeyHash,
  Int,
  Program
} from "@hyperionbt/helios"
import path from 'path';
import fs from 'fs';

import { mintNftInWallet, createNftRaffle, withdrawNft } from "../components/Offchan/Raffle"
import { blockfrostAPI, apiKey } from "../constants/blockfrost"

export async function getStaticProps() {

  const contractsDirectory = path.join(process.cwd(), 'components/Contracts/');
  const raffleContract = fs.readFileSync(contractsDirectory + 'raffle.hl', 'utf8');
  const vaultContract = fs.readFileSync(contractsDirectory + 'vault.hl', 'utf8');
  const raffleScript = raffleContract.toString();
  const vaultScript = vaultContract.toString();

  const scripts = {
    raffleScript,
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
  const vaultScript = props.scripts.vaultScript

  const seed = "18062016"

  const salt = "2808201708082021"

  const saltedSeed = `${seed}${salt}`

  const [walletApi, setWalletApi] = useWalletContext();

  interface Raffle {
    nftPolicyId: string,
    nftAssetName: string,
    ticketPrice: number,
    numParticipants: number,
    participants: string[]
  }

  const callMintScript = async () => {
    mintNftInWallet(
      "Hello world!",
      walletApi
    )
  }

  const createRaffle = async () => {
    createNftRaffle(
      "7dd80d5b5d7d94b56eac097e271a710ca9ebbe28ba9a7d98018b7df4",
      Buffer.from("My Cool NFT").toString("hex"),
      1,
      5_000_000,
      saltedSeed,
      raffleScript,
      vaultScript,
      walletApi
    )
  }

  const parseRaffleDatum = (assetId: string, inlineDatum: string) => {

    const datum = ListData.fromCbor(hexToBytes(inlineDatum))

    const ticketPrice = Value.fromUplcData(datum.list[1])
    const participants = (datum.list[2] as ListData).list.map(item => PubKeyHash.fromUplcData(item))
    const numMaxParticipants = Int.fromUplcData(datum.list[3])
    
    const raffle: Raffle = {
      nftPolicyId: assetId.slice(0, 56),
      nftAssetName: assetId.slice(56),
      ticketPrice: Number(ticketPrice.lovelace),
      numParticipants: Number(numMaxParticipants.value),
      participants: participants.map(participant => participant.hex)
    } 
    return raffle

  }

  const getKeyUtxo = async (scriptAddress: string, assetId: string) => {

    const blockfrostUrl: string = blockfrostAPI + "/addresses/" + scriptAddress + "/utxos/" + assetId;

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

  
    return parseRaffleDatum(assetId, payload[0].inline_datum)
  }

  const inspectAddress = async () => {
    console.log('inspect address')
    const program = Program.new(raffleScript).compile(false)
    const address = Address.fromValidatorHash(program.validatorHash);
    console.log('address: ' + address.toBech32())

    const blockfrostUrl: string = blockfrostAPI + "/addresses/" + address.toBech32() + "/utxos";

    let resp = await fetch(blockfrostUrl, {
      method: "GET",
      headers: {
        accept: "application/json",
        project_id: apiKey,
      },
    });

    const response = await resp.json() as [any]

    console.log(response)

    const nfts = await Promise.all(response
      .flatMap(utxo => utxo.amount)
      .filter(amount => amount.unit != 'lovelace')
      .map(nft => getKeyUtxo(address.toBech32(), nft.unit)))

    console.log('nfts: ' + JSON.stringify(nfts))
  }


  return (
    <Layout >
      <button
        className="px-6 py-3 mb-1 mr-1 text-sm font-bold text-white uppercase rounded shadow outline-none bg-slate-300 hover:bg-slate-400 focus:outline-none"
        type="button"
        onClick={() => createRaffle()} >
        Create Raffle
      </button>
      <button
        className="px-6 py-3 mb-1 mr-1 text-sm font-bold text-white uppercase rounded shadow outline-none bg-slate-300 hover:bg-slate-400 focus:outline-none"
        type="button"
        onClick={() => inspectAddress()} >
        Submit
      </button>
    </Layout>
  )
}

export default NftRaffles
