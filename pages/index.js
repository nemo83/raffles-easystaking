import Dashboard from '../components/Dashboard'
import OpenRaffles from '../components/OpenRaffles';
import MyRaffles from '../components/MyRaffles';
import ClosedRaffles from '../components/ClosedRaffles';
import RecentWinners from '../components/RecentWinners';
import Layout from '../components/Layout';
import { useWalletContext } from "../components/WalletProvider";

export default function Home() {

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
