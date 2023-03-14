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
  IntData,
  Program,
  WalletHelper
} from "@hyperionbt/helios"
import path from 'path';
import fs from 'fs';

import { blockfrostAPI, apiKey } from "../constants/blockfrost"
import { lotteryApi } from "../constants/lottery"

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

  const [walletApi, setWalletApi] = useWalletContext();

  const [walletPkh, setWalletPkh] = useState('');
  
  useEffect(() => {
    (async () => {
      const walletPkh = await new WalletHelper(walletApi).baseAddress
      console.log('setting wallet PKH')
      setWalletPkh(walletPkh.pubKeyHash.hex)
    })()
  }, [walletApi])

  const [raffles, setRaffles] = useState<Raffle[]>([])

  const [onChainRaffles, setOnChainRaffles] = useState<OnChainRaffle[]>([])
  const [wonNfts, setWonNfts] = useState<WonNft[]>([])
  const [backendRaffles, setBackendRaffles] = useState([])

  useEffect(() => {
    const raffles = onChainRaffles.map(onChainRaffle => {
      const beRaffle = backendRaffles.find(raffle => raffle.status == "open" && raffle.policy_id == onChainRaffle.nftPolicyId && raffle.asset_name == onChainRaffle.nftAssetName)
      const raffle: Raffle = {
        ...onChainRaffle,
        collectionName: beRaffle.collection_name,
        nftName: beRaffle.nft_name,
        mainImgUrl: beRaffle.main_img_url
      }
      return raffle
    })

    const wonRaffles = wonNfts.map(wonNft => {
      const beRaffle = backendRaffles.find(raffle => raffle.status == "open" && raffle.policy_id == wonNft.nftPolicyId && raffle.asset_name == wonNft.nftAssetName)
      const raffle: Raffle = {
        ...wonNft,
        collectionName: beRaffle.collection_name,
        nftName: beRaffle.nft_name,
        mainImgUrl: beRaffle.main_img_url,
        ticketPrice: beRaffle.ticket_price,
        numMaxTicketPerWallet: beRaffle.num_max_tickets_per_wallet,
        numParticipants: beRaffle.num_max_participants,
        participants: beRaffle.participants.split(","),
        numTickets: beRaffle.participants.length
      }
      return raffle
    })

    setRaffles(wonRaffles.concat(raffles))

  }, [onChainRaffles, backendRaffles, wonNfts, walletPkh])

  interface OnChainRaffle {
    nftPolicyId: string,
    nftAssetName: string,
    ticketPrice: number,
    numMaxTicketPerWallet: number,
    numParticipants: number,
    participants: string[],
    numTickets: number | undefined
  }

  interface Raffle {
    nftPolicyId: string,
    nftAssetName: string,
    collectionName: string,
    nftName: string,
    mainImgUrl: string,
    ticketPrice: number,
    numMaxTicketPerWallet: number,
    numParticipants: number,
    participants: string[],
    numTickets: number | undefined
  }

  interface WonNft {
    nftPolicyId: string,
    nftAssetName: string,
  }


  const parseRaffleDatum = async (assetId: string, inlineDatum: string) => {

    const datum = ListData.fromCbor(hexToBytes(inlineDatum))

    const ticketPrice = Value.fromUplcData(datum.list[1])
    const numMaxTicketPerWallet = datum.list[2] as IntData
    const participants = (datum.list[3] as ListData).list.map(item => PubKeyHash.fromUplcData(item))
    const numMaxParticipants = datum.list[4] as IntData

    const numTickets = participants.reduce((acc, curr) => {
      if (walletPkh == curr.hex) {
        return acc + 1
      } else {
        return acc
      }
    }, 0)

    const nftPolicyId = assetId.slice(0, 56)
    const nftAssetName = assetId.slice(56)

    const raffle: OnChainRaffle = {
      nftPolicyId,
      nftAssetName,
      ticketPrice: Number(ticketPrice.lovelace),
      numMaxTicketPerWallet: Number(numMaxTicketPerWallet.value),
      numParticipants: Number(numMaxParticipants.value),
      participants: participants.map(participant => participant.hex),
      numTickets: numTickets
    }
    return raffle

  }

  const getRaffles = async (scriptAddress: string, assetId: string) => {

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

  const getWinningTickets = async (scriptAddress: string, assetId: string) => {

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

    const datum = ListData.fromCbor(hexToBytes(payload[0].inline_datum))

    const adminPkh = PubKeyHash.fromUplcData(datum.list[0])
    const winningPkh = PubKeyHash.fromUplcData(datum.list[1])

    if (walletPkh == winningPkh.hex || walletPkh == adminPkh.hex) {
      const nft: WonNft = {
        nftPolicyId: assetId.slice(0, 56),
        nftAssetName: assetId.slice(56),
      }
      return nft
    } else {
      return undefined
    }
  }

  const fetchRaffles = async () => {

    let resp = await fetch(`${lotteryApi}/nft_raffles`, {
      method: "GET",
      headers: {
        'content-type': "application/json",
        accept: "application/json"
      }
    });

    const backendRaffles = await resp.json();

    return backendRaffles as any[]

  }

  const inspectAddress = async () => {

    const program = Program.new(raffleScript).compile(false)
    const address = Address.fromValidatorHash(program.validatorHash);

    const blockfrostUrl: string = blockfrostAPI + "/addresses/" + address.toBech32() + "/utxos";

    let resp = await fetch(blockfrostUrl, {
      method: "GET",
      headers: {
        accept: "application/json",
        project_id: apiKey,
      },
    });

    const response = await resp.json() as [any]

    if (resp.status == 200) {
      return await Promise.all(response
        .flatMap(utxo => utxo.amount)
        .filter(amount => amount.unit != 'lovelace')
        .map(nft => getRaffles(address.toBech32(), nft.unit)))
    } else {
      return []
    }

  }

  const findWinningTickets = async () => {

    const program = Program.new(vaultScript).compile(false)
    const address = Address.fromValidatorHash(program.validatorHash);

    const blockfrostUrl: string = blockfrostAPI + "/addresses/" + address.toBech32() + "/utxos";

    let resp = await fetch(blockfrostUrl, {
      method: "GET",
      headers: {
        accept: "application/json",
        project_id: apiKey,
      },
    });

    const response = await resp.json() as [any]

    const myWonNfts: WonNft[] = []
    const wonRaffles: WonNft[] = []
    if (resp.status == 200) {

      const nfts = await Promise.all(response
        .flatMap(utxo => utxo.amount)
        .filter(amount => amount.unit != 'lovelace')
        .map(nft => getWinningTickets(address.toBech32(), nft.unit)))

      nfts.forEach(nft => {
        if (nft) {
          myWonNfts.push(nft)
        }
      })
    }

    return wonRaffles
  }

  const userWon = (raffle: Raffle) => {
    return wonNfts.some(nft => nft.nftPolicyId == raffle.nftPolicyId && nft.nftAssetName == raffle.nftAssetName)
  }

  useEffect(() => {
    (async () => fetchRaffles())()
      .then(backendRaffles => setBackendRaffles(backendRaffles))
    console.log('fetchRaffles')
  }, [])

  useEffect(() => {
    (async () => findWinningTickets())()
      .then(wonRaffles => setWonNfts(wonRaffles))
    console.log('findWinningTickets')
  }, [walletPkh])

  useEffect(() => {
    (async () => inspectAddress())()
      .then(onChainRaffles => setOnChainRaffles(onChainRaffles))
    console.log('inspectAddress')
  }, [walletPkh])


  return (
    <Layout>
      <div className="flex flex-row w-full">
        {raffles.map((raffle, i) => (
          <NftCard
            key={i}
            policyIdHex={raffle.nftPolicyId}
            assetNameHex={raffle.nftAssetName}
            collectionName={raffle.collectionName}
            nftName={raffle.nftName}
            mainImgUrl={raffle.mainImgUrl}
            maxParticipants={raffle.numParticipants}
            numPurchasedTickets={raffle.participants.length}
            ticketPrices={raffle.ticketPrice}
            numWalletPurchasedTickets={raffle.numTickets}
            maxNumTicketsPerWallet={3}
            raffleScript={raffleScript}
            vaultScript={vaultScript}
            userWon={userWon(raffle)} />
        ))}
      </div>
      {/* <div>
        <button
          className="px-6 py-3 mb-1 mr-1 text-sm font-bold text-white uppercase rounded shadow outline-none bg-slate-300 hover:bg-slate-400 focus:outline-none"
          type="button"
          onClick={() => initRaffles()} >
          Init Raffles
        </button>
      </div> */}
    </Layout>
  )
}

export default NftRaffles
