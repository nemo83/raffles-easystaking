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
  WalletHelper,
  Time,
  Cip30Wallet
} from "@hyperionbt/helios"
import path from 'path';
import fs from 'fs';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faRotate
} from "@fortawesome/free-solid-svg-icons";
import { getBlockfrostKey, getBlockfrostUrl, network } from "../constants/blockfrost"
import { lotteryApi, optimizeSmartContracts } from "../constants/lottery"
import Link from "next/link";
import Image from "next/image";

export async function getStaticProps() {

  const contractsDirectory = path.join(process.cwd(), 'components/Contracts/');
  const raffleContract = fs.readFileSync(contractsDirectory + 'raffle.hl', 'utf8');
  const raffleV2Contract = fs.readFileSync(contractsDirectory + 'raffle_v2.hl', 'utf8');
  const vaultContract = fs.readFileSync(contractsDirectory + 'vault.hl', 'utf8');
  const raffleScript = raffleContract.toString();
  const raffleV2Script = raffleV2Contract.toString();
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

  const [walletHandle, setWalletHandle] = useWalletContext();

  const [walletPkh, setWalletPkh] = useState('');

  const [updating, setUpdating] = useState(false);

  const updatePkh = async () => {
    if (walletHandle) {
      const walletPkh = await new WalletHelper(new Cip30Wallet(walletHandle)).baseAddress

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
  }, [new Cip30Wallet(walletHandle)])

  const [raffles, setRaffles] = useState<Raffle[]>([])

  const [onChainRaffles, setOnChainRaffles] = useState<OnChainRaffle[]>([])
  const [wonNfts, setWonNfts] = useState<WonNft[]>([])
  const [myRaffles, setMyRaffles] = useState<Raffle[]>([])
  const [backendRaffles, setBackendRaffles] = useState([])

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
            mainImgUrl: beRaffle.main_img_url,
            status: beRaffle.status
          }
          return raffle
        } else {
          return null
        }
      }).filter(raffle => raffle) // filters undefined out

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
            numTickets: numTickets,
            deadline: new Date(beRaffle.deadline),
            status: beRaffle.status
          }
          return raffle
        } else {
          return null
        }
      }).filter(raffle => raffle) // filters undefined out

      setRaffles(wonRaffles.concat(raffles))

      const myRaffles = backendRaffles.filter(raffle => {
        if (raffle.participants) {
          return raffle.participants.slice().split(",").indexOf(walletPkh) != -1
        } else {
          return false
        }
      })
      console.log('myRaffles', myRaffles)
      setMyRaffles(myRaffles)
    } else {
      setRaffles([])
    }

  }, [onChainRaffles, backendRaffles, wonNfts, walletPkh])

  interface OnChainRaffle {
    nftPolicyId: string,
    nftAssetName: string,
    ticketPrice: number,
    numMaxTicketPerWallet: number,
    numParticipants: number,
    participants: string[],
    numTickets: number | undefined,
    deadline: Date | undefined
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
    numTickets: number | undefined,
    deadline: Date | undefined,
    status: string
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
    const deadline = Time.fromUplcData(datum.list[7])

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
      numTickets: numTickets,
      deadline: new Date(Number(deadline.value))
    }
    return raffle

  }

  const getRaffles = async (scriptAddress: string, assetId: string) => {

    const blockfrostUrl: string = getBlockfrostUrl(network) + "/addresses/" + scriptAddress + "/utxos/" + assetId;

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

    return parseRaffleDatum(assetId, payload[0].inline_datum);

  }

  const getWinningTickets = async (scriptAddress: string, assetId: string) => {

    const blockfrostUrl: string = getBlockfrostUrl(network) + "/addresses/" + scriptAddress + "/utxos/" + assetId;

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

    try {
      const datum = ListData.fromCbor(hexToBytes(payload[0].inline_datum))

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
    } catch (error) {
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

    const program = Program.new(raffleV2Script).compile(optimizeSmartContracts)
    const address = Address.fromValidatorHash(program.validatorHash);

    const blockfrostUrl: string = getBlockfrostUrl(network) + "/addresses/" + address.toBech32() + "/utxos";

    let resp = await fetch(blockfrostUrl, {
      method: "GET",
      headers: {
        accept: "application/json",
        project_id: getBlockfrostKey(network),
      },
    });

    const response = await resp.json() as [any]

    if (resp.status == 200) {
      const raffles = await Promise.all(response
        .flatMap(utxo => utxo.amount)
        .filter(amount => amount.unit != 'lovelace')
        .map(nft => getRaffles(address.toBech32(), nft.unit)))
      // console.log('onChainRaffles', JSON.stringify(raffles))
      setOnChainRaffles(raffles)
    } else {
      setOnChainRaffles([])
    }

  }

  const findWinningTickets = async () => {

    const program = Program.new(vaultScript).compile(optimizeSmartContracts)
    const address = Address.fromValidatorHash(program.validatorHash);

    const blockfrostUrl: string = getBlockfrostUrl(network) + "/addresses/" + address.toBech32() + "/utxos";

    let resp = await fetch(blockfrostUrl, {
      method: "GET",
      headers: {
        accept: "application/json",
        project_id: getBlockfrostKey(network),
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
      .then(backendRaffles => {
        const filteredRaffles = backendRaffles.filter(raffle => raffle.network == network)
        // console.log('filteredRaffles', JSON.stringify(filteredRaffles))
        setBackendRaffles(filteredRaffles)
      })
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
      {network == 'preview' ? (
        <div
          className="px-6 py-5 my-2 text-base text-blue-600 bg-blue-300 rounded-lg"
          role="alert">
          Raffles are currently running on the Cardano <span className="font-bold">PREVIEW</span> testnet
        </div>
      ) : null}
      {network == 'mainnet' ? (
        <div
          className="px-6 py-5 my-2 text-base text-black bg-yellow-300 rounded-lg">
          Raffles are currently running on <span className="font-bold">Mainnet BETA</span> use at your own risk.
        </div>
      ) : null}
      <div className="my-6 text-4xl font-bold text-slate-600">
        Open Raffles
        <span className="float-right">
          <Link href="#"
            onClick={() => {
              setUpdating(true)
              updatePkh()
                .then(() => inspectAddress())
                .then(() => findWinningTickets)
                .finally(() => setUpdating(false))
            }}>
            <FontAwesomeIcon icon={faRotate} className={updating ? 'animate-spin' : ''} />
          </Link>
        </span>
      </div>
      <hr className="my-8 h-0.5 border-t-0 bg-neutral-100 opacity-100 dark:opacity-50" />
      <div className="flex flex-wrap md:justify-around">
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
            raffleScript={raffleV2Script}
            vaultScript={vaultScript}
            deadline={raffle.deadline}
            callback={inspectAddress}
            userWon={userWon(raffle)} />
        ))}
      </div>
      <hr className="my-8 h-0.5 border-t-0 bg-neutral-100 opacity-100 dark:opacity-50" />

      <div className="my-6 text-4xl font-bold text-slate-600">
        My Raffles
      </div>
      {myRaffles ? (
        <div className="flex flex-col my-6">
          <div className="overflow-x-auto bg-white rounded-lg shadow-lg">
            <div className="inline-block min-w-full">
              <div className="overflow-hidden">
                <table className="min-w-full">
                  <thead className="border-b">
                    <tr>
                      <th scope="col" className="p-2 m-2 text-sm font-medium text-center text-gray-900">
                        Image
                      </th>
                      <th scope="col" className="px-6 py-4 text-sm font-medium text-left text-gray-900">
                        Collection
                      </th>
                      <th scope="col" className="px-6 py-4 text-sm font-medium text-left text-gray-900">
                        Name
                      </th>
                      <th scope="col" className="px-6 py-4 text-sm font-medium text-left text-gray-900">
                        Outcome
                      </th>
                    </tr>
                  </thead>
                  {/* .map(raffle => [raffle.main_img_url, raffle.nft_name, raffle.collection_name, raffle.winner_pkh]) */}
                  <tbody>
                    {myRaffles.filter(raffle => raffle.status == 'closed').map((raffle: any, i) =>
                      <tr className="bg-white border-b" key={i}>
                        <td className="p-2 m-2 text-gray-900 whitespace-nowrap">
                          <div className="relative w-24 h-24">
                            <Image
                              src={raffle.main_img_url}
                              fill={true}
                              className="object-cover rounded-full"
                              alt={raffle.nft_name}
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-light text-gray-900 whitespace-nowrap">
                          {raffle.collection_name}
                        </td>
                        <td className="px-6 py-4 text-sm font-light text-gray-900 whitespace-nowrap">
                          {raffle.nft_name}
                        </td>
                        <td className="px-6 py-4 text-sm font-light text-gray-900 whitespace-nowrap">
                          {raffle.winner_pkh == walletPkh ? (
                            <span
                              className="inline-block px-2 pt-1 pb-1 font-bold leading-none text-center align-baseline bg-green-600 rounded-full">
                              Won
                            </span>
                          ) : (
                            <span
                              className="inline-block px-2 pt-1 pb-1 font-bold leading-none text-center align-baseline bg-red-600 rounded-full">
                              Lost
                            </span>
                          )}
                        </td>
                      </tr>
                    )}

                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      ) : null}
      <hr className="my-8 h-0.5 border-t-0 bg-neutral-100 opacity-100 dark:opacity-50" />
      <div className="my-6 text-4xl font-bold text-slate-600">
        All Raffles
      </div>
      {backendRaffles ? (
        <div className="flex flex-col my-6">
          <div className="overflow-x-auto bg-white rounded-lg shadow-lg">
            <div className="inline-block min-w-full">
              <div className="overflow-hidden">
                <table className="min-w-full">
                  <thead className="border-b">
                    <tr>
                      <th scope="col" className="p-2 m-2 text-sm font-medium text-center text-gray-900">
                        Image
                      </th>
                      <th scope="col" className="px-6 py-4 text-sm font-medium text-left text-gray-900">
                        Collection
                      </th>
                      <th scope="col" className="px-6 py-4 text-sm font-medium text-left text-gray-900">
                        Name
                      </th>
                      <th scope="col" className="px-6 py-4 text-sm font-medium text-left text-gray-900">
                        Winner
                      </th>
                    </tr>
                  </thead>
                  {/* .map(raffle => [raffle.main_img_url, raffle.nft_name, raffle.collection_name, raffle.winner_pkh]) */}
                  <tbody>
                    {backendRaffles.filter(raffle => raffle.status == 'closed').map((raffle: any, i) =>
                      <tr className="bg-white border-b" key={i}>
                        <td className="p-2 m-2 text-gray-900 whitespace-nowrap">
                          <div className="relative w-24 h-24">
                            <Image
                              src={raffle.main_img_url}
                              fill={true}
                              className="object-cover rounded-full"
                              alt={raffle.nft_name}
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-light text-gray-900 whitespace-nowrap">
                          {raffle.collection_name}
                        </td>
                        <td className="px-6 py-4 text-sm font-light text-gray-900 whitespace-nowrap">
                          {raffle.nft_name}
                        </td>
                        <td className="px-6 py-4 text-sm font-light text-gray-900 whitespace-nowrap">
                          {raffle.winner_pkh ? `${raffle.winner_pkh.slice(0, 6)} ... ${raffle.winner_pkh.slice(-3)}` : ''}
                        </td>
                      </tr>
                    )}

                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </Layout>
  )
}

export default NftRaffles
