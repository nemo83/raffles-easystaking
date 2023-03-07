import Dashboard from '../components/Dashboard'
import OpenRaffles from '../components/OpenRaffles';
import MyRaffles from '../components/MyRaffles';
import ClosedRaffles from '../components/ClosedRaffles';
import RecentWinners from '../components/RecentWinners';
import Layout from '../components/Layout';
import { useWalletContext } from "../components/WalletProvider";
import {
  WalletHelper
} from "@hyperionbt/helios"
import { useState, useEffect } from 'react';

export default function Raffles() {

  const [baseAddress, setBaseAddress] = useState(null);
  const [walletApi, setWalletApi] = useWalletContext();

  useEffect(() => {
    const getBaseAddress = async () => {
      const baseAddress = (await new WalletHelper(walletApi).baseAddress).toBech32()
      setBaseAddress(baseAddress)
    }
    if (walletApi) {
      getBaseAddress()
    } else {
      setBaseAddress(null)
    }
  }, [walletApi])


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
