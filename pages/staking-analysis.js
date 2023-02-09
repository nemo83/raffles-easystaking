import Perks from "../components/Perks";
import Layout from "../components/Layout";
import { Distributions } from "../components/Distributions";
import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic';

const StakingAssessment = dynamic(() => import('../components/StakingAssessment'), { ssr: false })

export default function StakingAnalysis() {

  useEffect(() => {
    fetch('https://lottery.easystaking.online/token_distributions')
      .then((res) => res.json())
      .then((data) => console.log(data))
  }, [])


  return (
    <Layout>
     
      <Perks />
      <hr className="mx-4 my-8 border-b-2 border-gray-600"></hr>
      <StakingAssessment />
    </Layout>
  )
}
