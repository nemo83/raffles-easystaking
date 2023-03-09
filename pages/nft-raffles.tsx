import NftCard from "../components/NftCard"
import Layout from '../components/Layout';
import { useWalletContext } from "../components/WalletProvider";
import type { NextPage } from 'next'
import { useEffect, useState } from "react"
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
import { buyRaffleTickets } from "../components/Offchan/Raffle"

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

  const [raffles, setRaffles] = useState<Raffle[]>([])

  interface Raffle {
    nftPolicyId: string,
    nftAssetName: string,
    ticketPrice: number,
    numParticipants: number,
    participants: string[]
  }

  // useEffect(() => {
  //   const fetchRaffles = async () => {
  //     inspectAddress()
  //   }
  //   fetchRaffles()
  // }, [])

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

    return parseRaffleDatum(assetId, payload[0].inline_datum);

  }

  const inspectAddress = async () => {
    console.log('inspect address')
    const program = Program.new(raffleScript).compile(false)
    const address = Address.fromValidatorHash(program.validatorHash);
    console.log('address: ' + address.toBech32())

    // const blockfrostUrl: string = blockfrostAPI + "/addresses/" + address.toBech32() + "/utxos";

    // let resp = await fetch(blockfrostUrl, {
    //   method: "GET",
    //   headers: {
    //     accept: "application/json",
    //     project_id: apiKey,
    //   },
    // });

    // const response = await resp.json() as [any]

    // if (resp.status == 200) {
    //   const raffles = await Promise.all(response
    //     .flatMap(utxo => utxo.amount)
    //     .filter(amount => amount.unit != 'lovelace')
    //     .map(nft => getKeyUtxo(address.toBech32(), nft.unit)))
    //   setRaffles(raffles)
    // }

    // console.log(response)

    const myRaffles = raffles.slice()

    myRaffles.push({
      nftPolicyId: "string",
      nftAssetName: "string",
      ticketPrice: 5000000,
      numParticipants: 15,
      participants: []
    })
    myRaffles.push({
      nftPolicyId: "string1",
      nftAssetName: "string1",
      ticketPrice: 15000000,
      numParticipants: 25,
      participants: ["a", "b"]
    })

    setRaffles(myRaffles)

    console.log('raffles: ' + JSON.stringify(raffles))
  }


  return (
    <Layout >
      <div className="flex flex-row w-full">
        {raffles.map((raffle, i) => (
          <NftCard
            key={i}
            maxParticipants={raffle.numParticipants}
            numPurchasedTickets={raffle.participants.length}
            ticketPrices={raffle.ticketPrice}
            numWalletPurchasedTickets={1}
            maxNumTicketsPerWallet={3} />
        ))}
      </div>
      <div>
        <button
          className="px-6 py-3 mb-1 mr-1 text-sm font-bold text-white uppercase rounded shadow outline-none bg-slate-300 hover:bg-slate-400 focus:outline-none"
          type="button"
          onClick={() => inspectAddress()} >
          Submit
        </button>
      </div>
    </Layout>
  )
}

export default NftRaffles
