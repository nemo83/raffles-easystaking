import Layout from '../components/Layout';
import { useWalletContext } from "../components/WalletProvider";
import type { NextPage } from 'next'
import React from 'react';
import { useState, useEffect } from 'react';
import { mintNftInWallet, createNftRaffle, retrieveNft, selectWinner } from "../components/Offchan/Raffle"
import { sha256, sha224 } from 'js-sha256';
import path from 'path';
import fs from 'fs';
import { Program, Address } from '@hyperionbt/helios';
import { network } from '../constants/blockfrost'

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

  const [policyId, setPolicyId] = useState('');
  const [assetName, setAssetName] = useState('');
  const [ticketPrice, setTicketPrice] = useState(5_000_000);
  const [numMaxParticipants, setNumMaxParticipants] = useState(10);
  const [numMaxTicketsPerPerson, setNumMaxTicketsPerPerson] = useState(3);
  const [seed, setSeed] = useState('');
  const [salt, setSalt] = useState('');

  const [mainImgUrl, setMainImgUrl] = useState('https://ipfs.io/ipfs/QmdHiHmWdt2gonmViGwJcvp4gfZiuVyrtub7H7iCc5QSmf');

  const [walletApi, setWalletApi] = useWalletContext();


  const buildScripts = () => {
    const raffleProgram = Program.new(raffleScript).compile(false)
    console.log('raffle script built')

    const raffleAddress = Address.fromValidatorHash(raffleProgram.validatorHash);
    console.log('raffleAddress: ' + raffleAddress.toBech32())

    const vaultProgram = Program.new(vaultScript).compile(false)
    console.log('vault script built')

    const vaultAddress = Address.fromValidatorHash(vaultProgram.validatorHash);
    console.log('vaultAddress: ' + vaultAddress.toBech32())

  }

  const callMintScript = async () => {
    mintNftInWallet(
      "Hello world!",
      walletApi
    )
  }

  const createRaffle = async () => {

    const saltedSeed = `${seed}${salt}`

    createNftRaffle(
      policyId,
      Buffer.from(assetName).toString("hex"),
      numMaxParticipants,
      numMaxTicketsPerPerson,
      ticketPrice,
      saltedSeed,
      raffleScript,
      vaultScript,
      walletApi
    ).then(async (result) => {

    const lotteryApi: string = "https://lottery.easystaking.online/nft_raffles"

    const body = JSON.stringify({
      policy_id: policyId,
      asset_name: Buffer.from(assetName).toString("hex"),
      main_img_url: mainImgUrl,
      network,
      admin_pkh: "asd",
      ticket_price: ticketPrice,
      num_max_tickets_per_wallet: numMaxTicketsPerPerson,
      num_max_participants: numMaxParticipants,
      seed_hash: "asd",
      vault_pkh: "asd"
    })

    console.log('body: ' + body)

    let resp = await fetch(lotteryApi, {
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

    if (payload.length == 0) {
      throw console.error("NFT not found");
    }

    })

  }

  const withdrawAll = async () => {
    return retrieveNft(
      policyId,
      Buffer.from(assetName).toString("hex"),
      raffleScript,
      walletApi
    )
  }

  const selectRaffleWinner = async () => {
    selectWinner(
      seed,
      salt,
      policyId,
      Buffer.from(assetName).toString("hex"),
      raffleScript,
      vaultScript,
      walletApi
    )
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
        onClick={() => callMintScript()} >
        Mint NFT
      </button>
      <button
        className="px-6 py-3 mb-1 mr-1 text-sm font-bold text-white uppercase rounded shadow outline-none bg-slate-300 hover:bg-slate-400 focus:outline-none"
        type="button"
        onClick={() => withdrawAll()} >
        Withdraw all
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
            <button
              className="px-6 py-3 mb-1 mr-1 text-sm font-bold text-white uppercase rounded shadow outline-none bg-slate-300 hover:bg-slate-400 focus:outline-none"
              type="button"
              onClick={() => createRaffle()} >
              Create Raffle
            </button>
            <button
              className="px-6 py-3 mb-1 mr-1 text-sm font-bold text-white uppercase rounded shadow outline-none bg-slate-300 hover:bg-slate-400 focus:outline-none"
              type="button"
              onClick={() => selectRaffleWinner()} >
              Select Winner
            </button>
          </div>
        </form>
      </div>

    </Layout >
  )
}

export default NftRaffles
