import Layout from '../components/Layout';
import { useWalletContext } from "../components/WalletProvider";
import type { NextPage } from 'next'
import React from 'react';
import { useState, useEffect } from 'react';
import {
  Address,
  Cip30Wallet,
  StakeAddress,
  WalletHelper
} from "@hyperionbt/helios";
import path, { basename } from 'path';
import fs from 'fs';
import { getNetworkParam, network, getBlockfrostUrl, getBlockfrostKey } from '../constants/blockfrost'
import { lotteryApi, optimizeSmartContracts, useRaffleRefScript, raffleRefScriptAddress, raffleRefScriptHash, raffleRefScriptIndex } from '../constants/lottery'
import toast from 'react-hot-toast'
import { sha256 } from 'js-sha256';
import Spinner from '../components/Spinner'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCopy } from "@fortawesome/free-solid-svg-icons"
import {
  faMoon as farMoon
} from "@fortawesome/free-regular-svg-icons"
import { Blockfrost, Lucid, OutRef, Constr, Data, SpendingValidator, toHex, fromHex } from "lucid-cardano"; // NPM
import { ad } from 'vitest/dist/types-94cfe4b4';
import * as cbor from 'cbor';
export const origin = process.env.NEXT_PUBLIC_ORIGIN

const Incentives: NextPage = (props: any) => {

  const referralScript: SpendingValidator = {
    type: "PlutusV2",
    script: "5902760100003232323232322323223232253330083232533300a3005300b3754601c601e0042646464646464a666020601c60226ea80304c94ccc044cc00cdd6180218099baa3005301337540146eb8c014c04cdd500808008a503322325333013300e30143754002264a66602864a666030602e0022a66602a6020602c002294454ccc054c04cc0580045280b0b1baa300530163754600a602c6ea80104cdc4000801899b89001003375a602e602a6ea80045281803180a1baa300330143754004600a60246ea801cdd6980318091baa00f1325333011330033758600860266ea8c014c04cdd50051bae30153016301630163013375402020022940cc88c94ccc04cc038c050dd5000899299980a19299980c180b8008a99980a9808180b0008a51153330153013301600114a02c2c6ea8c014c058dd51804180b1baa004133710006002266e2400c004dd6980b980a9baa00114a0600c60286ea8c018c050dd5001180298091baa007375a600c60246ea803c8c050c05400488c8cc00400400c894ccc054004528099299980999b8f375c602e00400829444cc00c00c004c05c0048c048c04cc04cc04cc04cc04cc04cc04cc04c0048c0440048c040c044c044c044c044c044c044c0440048c03cc040c040c040c04000458c034004c028dd50008a4c26cac64a66600e600a0022a66601460126ea800c526161533300730020011533300a300937540062930b0b18039baa002370e90012999801980098021baa00213232323232323232323253330103012002149858dd6980800098080011bae300e001300e002375c601800260180046eb4c028004c028008dd7180400098029baa00216370e90002b9a5573aaae7955cfaba157441",
  };

  const [walletHandle, setWalletHandle] = useWalletContext()

  const [baseAddress, setBaseAddress] = useWalletContext()

  const [referralCode, setReferralCode] = useState(null)

  useEffect(() => {
    (async () => {
      if (walletHandle) {
        const walletHelper = new WalletHelper(new Cip30Wallet(walletHandle))
        const baseAddress = await walletHelper.baseAddress
        setBaseAddress(baseAddress.toBech32())
      } else {
        setBaseAddress(null)
      }
    })()
  }, [walletHandle])

  useEffect(() => {

    const body = JSON.stringify({address: baseAddress});

    fetch('http://localhost:8080/referral_codes', {
      method: "POST",
      headers: {
        "content-type": "application/json",
        accept: "application/json",
      },
      body,
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data)
        setReferralCode(data.referralCode)
      });

  }, [baseAddress])

  const delegate = async () => {

    console.log('hello!')

    try {

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

      console.log('network: ' + network)

      const lucid = await Lucid.new(
        new Blockfrost(getBlockfrostUrl(network), getBlockfrostKey(network)),
        lucidNetwork,
      );

      lucid.selectWallet(walletHandle)

      console.log('wallet!')

      const utxoRef: OutRef = { txHash: "5a8f7cf18eb0ae9cfeb7fc30947d12aa0923a7ba65d433cc211d90473c2a8955", outputIndex: 1 }

      const [utxo] = await lucid.utxosByOutRef([utxoRef]);

      console.log('utxo: ')

      const redeemer = Data.to(new Constr(1, []));

      console.log('redeemer!')

      const address = await lucid.wallet.address();

      const tx = await lucid
        .newTx()
        .collectFrom([utxo], redeemer)
        .addSigner(address)
        .attachSpendingValidator(referralScript)
        .validFrom(Date.now() - 1000000)
        .validTo(Date.now() + 1000000)
        .complete()

      console.log(tx);

      const signedTx = await tx.sign().complete();
      await signedTx.submit();




    } catch (err) {
      console.log(err)
      throw "Delegate error"
    }
  }



  return (
    <Layout >
      <section className="my-8 text-center bg-white rounded-lg">
        <div className="px-3 py-6 md:px-12  md:text-left">
          <h2 className="my-6 text-4xl font-bold text-slate-600">
            Referrals <br />
            <p className={`text-base text-slate-400 mt-3 font-normal ` + (walletHandle ? 'hidden' : '')}>Connect your wallet to get your referral code!</p>
            <FontAwesomeIcon
              icon={faCopy}
              className="mr-3"
            />
            <span className={`text-base text-slate-400 mt-3 font-normal ` + (walletHandle ? '' : 'hidden')}> {origin + `/incentives?referrer=` + referralCode} </span>

          </h2>
        </div>
      </section>

      <div className="text-black">
        <p>Optimize Smart Contract: {optimizeSmartContracts ? 'true' : 'false'}</p>
        <p>Network: {network}</p>
        <p>Use Ref Script: {useRaffleRefScript ? 'true' : 'false'}</p>
        <p>Script Address: {raffleRefScriptAddress}</p>
        <p>Script Hash: {raffleRefScriptHash}</p>
        <p>Script Index: {raffleRefScriptIndex}</p>
      </div>
      <button
        className="px-6 py-3 mb-1 mr-1 text-sm font-bold text-white uppercase rounded shadow outline-none bg-slate-300 hover:bg-slate-400 focus:outline-none"
        type="button"
        onClick={() => delegate()} >
        Build Scripts
      </button>

    </Layout >
  )
}

export default Incentives
