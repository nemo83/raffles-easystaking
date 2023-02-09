import Perks from "../components/Perks";
import Layout from "../components/Layout";
import { Distributions } from "../components/Distributions";
import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic';
import EstimateRewards from "../components/EstimateRewards";

const StakingAssessment = dynamic(() => import('../components/StakingAssessment'), { ssr: false })

export default function Home() {

  useEffect(() => {
    fetch('https://lottery.easystaking.online/token_distributions')
      .then((res) => res.json())
      .then((data) => console.log(data))
  }, [])


  return (
    <Layout>
      <div className="p-6 text-gray-700 bg-white rounded-lg shadow-lg">
        <h2 className="mb-5 text-3xl font-semibold">EASY1 Stakepool</h2>
        <p>
          Welcome to the EASY1 Stakepool delegators website.
        </p>
        <hr className="my-6 border-gray-300" />
        <p>
          Check out the extra tokens you can withdraw via Tosidrop below!
        </p>
        <button
          type="button"
          className="inline-block px-6 py-2.5 mt-4 bg-blue-600 text-white font-medium text-xs leading-tight uppercase rounded shadow-md hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg transition duration-150 ease-in-out"
          data-mdb-ripple="true"
          data-mdb-ripple-color="light"
        >
          Go!
        </button>
      </div>
      <Distributions />
      <EstimateRewards />

    </Layout>
  )
}
