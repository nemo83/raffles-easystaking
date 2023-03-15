import NftCard from "../components/NftCard"
import Layout from '../components/Layout';
import { useWalletContext } from "../components/WalletProvider";
import type { NextPage } from 'next'
import { useEffect, useState, useCallback } from "react"
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
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faRotate
} from "@fortawesome/free-solid-svg-icons";
import Table from "../components/Table"
import { blockfrostAPI, apiKey, network } from "../constants/blockfrost"
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

  const updatePkh = async () => {
    if (walletApi) {
      const walletPkh = await new WalletHelper(walletApi).baseAddress

      setWalletPkh(walletPkh.pubKeyHash.hex)
    } else {
      setWalletPkh(null)
    }
  }

  useEffect(() => {
    (async () => {
      updatePkh()
      console.log('setting wallet PKH')
    })()
  }, [walletApi])

  const [raffles, setRaffles] = useState<Raffle[]>([])

  const [onChainRaffles, setOnChainRaffles] = useState<OnChainRaffle[]>([])
  const [wonNfts, setWonNfts] = useState<WonNft[]>([])
  const [backendRaffles, setBackendRaffles] = useState([])

  const [tableData, setTableData] = useState([])

  useEffect(() => {
    if (backendRaffles) {

      // OnChain Raffles
      const raffles = onChainRaffles.map(onChainRaffle => {
        const beRaffle = backendRaffles.find(raffle => raffle.status == "open" && raffle.policy_id == onChainRaffle.nftPolicyId && raffle.asset_name == onChainRaffle.nftAssetName)
        if (beRaffle) {
          const raffle: Raffle = {
            ...onChainRaffle,
            collectionName: beRaffle.collection_name,
            nftName: beRaffle.nft_name,
            mainImgUrl: beRaffle.main_img_url
          }
          return raffle
        } else {
          return null
        }
      }).map(raffle => raffle) // filters undefined out

      // Won Raffles
      const wonRaffles = wonNfts.map(wonNft => {
        const beRaffle = backendRaffles.find(raffle => raffle.status == "closed" && raffle.policy_id == wonNft.nftPolicyId && raffle.asset_name == wonNft.nftAssetName)
        if (beRaffle) {
          let participants: string[] = []
          if (beRaffle.participants) {
            participants = beRaffle.participants.split(",")
          }
          const numTickets = participants.reduce((acc, curr) => {
            if (walletPkh == curr) {
              return acc + 1
            } else {
              return acc
            }
          }, 0)
          const raffle: Raffle = {
            ...wonNft,
            collectionName: beRaffle.collection_name,
            nftName: beRaffle.nft_name,
            mainImgUrl: beRaffle.main_img_url,
            ticketPrice: beRaffle.ticket_price,
            numMaxTicketPerWallet: beRaffle.num_max_tickets_per_wallet,
            numParticipants: beRaffle.num_max_participants,
            participants: participants,
            numTickets: numTickets
          }
          return raffle
        } else {
          return null
        }
      }).map(raffle => raffle) // filters undefined out
      setRaffles(wonRaffles.concat(raffles))

      const myTableData = backendRaffles
        .slice()
        .filter(raffle => raffle.status == 'closed')
        .map(raffle => [raffle.main_img_url, raffle.nft_name, raffle.collection_name, raffle.winner_pkh])
      setTableData(myTableData)

    } else {
      setRaffles([])
      setTableData([])
    }

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

    if (walletPkh == winningPkh.hex) {
      const nft: WonNft = {
        nftPolicyId: assetId.slice(0, 56),
        nftAssetName: assetId.slice(56),
      }
      return nft
    } else {
      return null
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

    console.log('Running inspectAddress')

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
      const raffles = await Promise.all(response
        .flatMap(utxo => utxo.amount)
        .filter(amount => amount.unit != 'lovelace')
        .map(nft => getRaffles(address.toBech32(), nft.unit)))
      setOnChainRaffles(raffles)
    } else {
      setOnChainRaffles([])
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

    setWonNfts(myWonNfts)

  }

  const userWon = (raffle: Raffle) => {
    return wonNfts.some(nft => nft.nftPolicyId == raffle.nftPolicyId && nft.nftAssetName == raffle.nftAssetName)
  }

  useEffect(() => {
    (async () => fetchRaffles())()
      .then(backendRaffles => setBackendRaffles(backendRaffles.filter(raffle => raffle.network = network)))
    console.log('fetchRaffles')
  }, [])

  useEffect(() => {
    (async () => findWinningTickets())()
    console.log('findWinningTickets')
  }, [walletPkh])

  useEffect(() => {
    (async () => inspectAddress())()
    console.log('inspectAddress')
  }, [walletPkh])

  return (
    <Layout>
      <div
        className="px-6 py-5 mb-4 text-base text-blue-600 bg-blue-300 rounded-lg"
        role="alert">
        Raffles are currently running on the Cardano <span className="font-bold">PREVIEW</span> testnet
      </div>
      <div className="mb-6 text-4xl font-bold text-slate-600">
        Open Raffles
        <span className="float-right">
          <FontAwesomeIcon icon={faRotate} onClick={() => updatePkh().then(() => inspectAddress()).then(() => findWinningTickets)} />
        </span>
      </div>
      <hr className="my-8 h-0.5 border-t-0 bg-neutral-100 opacity-100 dark:opacity-50" />
      <div className="flex flex-wrap justify-around w-full">
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
            maxNumTicketsPerWallet={raffle.numMaxTicketPerWallet}
            raffleScript={raffleScript}
            vaultScript={vaultScript}
            callback={inspectAddress}
            userWon={userWon(raffle)} />
        ))}
      </div>
      <hr className="my-8 h-0.5 border-t-0 bg-neutral-100 opacity-100 dark:opacity-50" />
      <Table title="Closed Raffles" columnNames={["Image", "Name", "Collection", "Winner"]} cardanoScanIndex={3} rows={tableData} />
    </Layout>
  )
}

export default NftRaffles
