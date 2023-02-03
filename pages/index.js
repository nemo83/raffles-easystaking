import Perks from "../components/Perks";
import Layout from "../components/Layout";

import dynamic from 'next/dynamic';

const StakingAssessment = dynamic(() => import('../components/StakingAssessment'), { ssr: false })

export default function Home() {



  return (
    <Layout>
      <Perks />
      <hr className="mx-4 my-8 border-b-2 border-gray-600"></hr>
      <StakingAssessment />
    </Layout>
  )
}
