import { useWalletContext } from "../components/WalletProvider";
import Perks from "../components/Perks";
import Layout from "../components/Layout";
import { useState, useEffect } from 'react'
import { Address, BaseAddress, RewardAddress, StakeCredential } from "@emurgo/cardano-serialization-lib-browser";

export default function Home() {

  const [baseAddress, setBaseAddress] = useWalletContext()

  const [manualAddress, setManualAddress] = useState('')


  async function checkStaking() {

    let walletAddres = baseAddress != null ? baseAddress : manualAddress

    if (walletAddres != null) {

      const address = Address.from_bech32(walletAddres);
      const base = BaseAddress.from_address(address);
      const stake = RewardAddress.new(address.network_id(), base.stake_cred()).to_address().to_bech32();
      console.log('stake: ' + stake)

      console.log('walletAddres: ' + walletAddres)
      fetch('https://hilltop-api.mainnet.dandelion.blockwarelabs.io/rewards/' + stake)
        .then((res) => res.json())
        .then((data) => console.log(data))

    }


  }

  return (
    <Layout>
      <Perks />
      <hr className="mx-4 my-8 border-b-2 border-gray-600"></hr>
      <div>
        <label className="block mb-1 text-sm font-bold text-black">
          Wallet Address
        </label>
        <input
          className="w-full px-1 py-2 text-black border rounded shadow appearance-none"
          disabled={(baseAddress != null)}
          onChange={(event) => setManualAddress(event.target.value)}
          value={baseAddress != null ? baseAddress : manualAddress} />
        <button className="px-4 py-2 font-bold text-white bg-blue-500 border border-blue-700 rounded hover:bg-blue-700"
          onClick={() => checkStaking()}>
          Check
        </button>
      </div>
    </Layout>


  )
}
