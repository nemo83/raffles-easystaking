import Layout from '../components/Layout';
import { useWalletContext } from "../components/WalletProvider";
import type { NextPage } from 'next'
import React from 'react';
import { useState, useEffect } from 'react';
import { mintNftInWallet, createNftRaffle } from "../components/Offchan/Raffle"

import path from 'path';
import fs from 'fs';
import { WalletHelper } from '@hyperionbt/helios';

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

  const [policyId, setPolicyId] = useState(null);
  const [assetName, setAssetName] = useState(null);
  const [numMaxParticipants, setNumMaxParticipants] = useState(null);
  const [numMaxTicketsPerPerson, setNumMaxTicketsPerPerson] = useState(null);
  const [seed, setSeed] = useState(null);
  const [salt, setSalt] = useState(null);

  const [walletApi, setWalletApi] = useWalletContext();

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


  return (
    <Layout >

      <button
        className="px-6 py-3 mb-1 mr-1 text-sm font-bold text-white uppercase rounded shadow outline-none bg-slate-300 hover:bg-slate-400 focus:outline-none"
        type="button"
        onClick={() => callMintScript()} >
        Mint NFT
      </button>
      <div className="block max-w-sm p-6 rounded-lg shadow-lg">
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
              Max number of Participants
            </label>
            <input type={'number'} value={numMaxParticipants} onChange={(event) => setNumMaxParticipants(event.target.value)}></input>
            <label className="block mb-1 text-sm font-bold text-black">
              Max tickets per Wallet
            </label>
            <input type={'number'} value={numMaxTicketsPerPerson} onChange={(event) => setNumMaxTicketsPerPerson(event.target.value)}></input>
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
              type="submit"
              onClick={() => createRaffle()} >
              Create Raffle
            </button>
          </div>
        </form>
      </div>

    </Layout >
  )
}

export default NftRaffles
