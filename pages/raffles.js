import Dashboard from '../components/Dashboard'
import OpenRaffles from '../components/OpenRaffles';
import MyRaffles from '../components/MyRaffles';
import ClosedRaffles from '../components/ClosedRaffles';
import RecentWinners from '../components/RecentWinners';
import Layout from '../components/Layout';
import { useWalletContext } from "../components/WalletProvider";
import {
  WalletHelper,
  Cip30Wallet
} from "@hyperionbt/helios"
import { useState, useEffect } from 'react';

export default function Raffles() {

  const [baseAddress, setBaseAddress] = useState(null);
  const [walletHandle, setWalletHandle] = useWalletContext();

  useEffect(() => {
    const getBaseAddress = async () => {
      const baseAddress = (await new WalletHelper(new Cip30Wallet(walletHandle)).baseAddress).toBech32()
      setBaseAddress(baseAddress)
    }
    if (walletHandle) {
      getBaseAddress()
    } else {
      setBaseAddress(null)
    }
  }, [walletHandle])


  return (
    <Layout >
      <Dashboard />
      {baseAddress ? (
        <MyRaffles baseAddress={baseAddress} />
      ) : null}
      <OpenRaffles />
      <RecentWinners />
      <ClosedRaffles />
    </Layout>
  )
}
