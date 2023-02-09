import Layout from "../components/Layout";
import { Distributions } from "../components/Distributions";
import dynamic from 'next/dynamic';
import EstimateRewards from "../components/EstimateRewards";
import Link from "next/link";

const StakingAssessment = dynamic(() => import('../components/StakingAssessment'), { ssr: false })

export default function Home() {

  return (
    <Layout>
      <div className="p-6 text-gray-700 bg-white rounded-lg shadow-lg">
        <h2 className="mb-5 text-3xl font-semibold">EASY1 Stakepool</h2>
        <p>
          Welcome to the EASY1 Stakepool website.
        </p>
        <p>
          Check out below the Extra Tokens you can earn delegating to the EASY1 Stakepool and withdraw via <Link href="https://tosidrop.io/">Tosidrop.io</Link> below!
        </p>
        <hr className="my-6 border-gray-300" />
        <p>
          Connect your wallet or user search bar to find out how much you can earn extra by delegating to the EASY1 Stakepool
        </p>
 
      </div>
      <EstimateRewards />
      <Distributions />
      

    </Layout>
  )
}
