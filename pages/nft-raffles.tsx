import Dashboard from '../components/Dashboard'
import OpenRaffles from '../components/OpenRaffles';
import MyRaffles from '../components/MyRaffles';
import ClosedRaffles from '../components/ClosedRaffles';
import RecentWinners from '../components/RecentWinners';
import Layout from '../components/Layout';
import { useWalletContext } from "../components/WalletProvider";
import type { NextPage } from 'next'
import React from 'react';

const NftRaffles: NextPage = (props: any) => {

  const [baseAddress, setBaseAddress] = useWalletContext();

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

export default NftRaffles
