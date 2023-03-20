import Layout from "../components/Layout";
import { Distributions } from "../components/Distributions";
import dynamic from 'next/dynamic';
import Link from "next/link";
import nigtsky from '../img/e1r/jpg/night-sky.jpg'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faPiggyBank, faUmbrella, faDice
} from "@fortawesome/free-solid-svg-icons"


const EstimateRewards = dynamic(() => import('../components/EstimateRewards'), { ssr: false })

export default function Home() {


  const offerings = [{
    title: 'Low Staking Fee',
    description: 'Professionally configured Stakepool, running on Cloud powered by 100% Renewable Energy',
    icon: faPiggyBank,
    iconClassName: "fas fa-2x fa-fw",
    linkValue: null,
    linkText: null,
  }, {
    title: 'Airdrops',
    description: 'Powered by Tosidrop.io, you can earn Extra Rewards every 5 days on top of your $ada rewards',
    icon: faUmbrella,
    iconClassName: "fas fa-2x fa-fw",
    linkValue: '#distributions',
    linkText: 'Find out more',
  }, {
    title: 'Raffles',
    description: 'We run raffles every 5 days. Free to join. Forever.',
    icon: faDice,
    iconClassName: "fas fa-2x fa-fw",
    linkValue: '/raffles',
    linkText: 'Find out more',
  }]


  return (
    <Layout>
      <div className="hidden p-6 text-gray-700 bg-white rounded-lg shadow-lg">
        <h2 className="mb-5 text-3xl font-semibold">EASY1 Stake Pool</h2>
        <p className="text-lg">
          Welcome to the EASY1 Stakepool website.
        </p>
        <p className="text-lg">
          Check out below the Extra Tokens you can earn delegating to the EASY1 Stakepool and withdraw via <Link href="https://tosidrop.io/"
            className='mb-4 text-blue-600 transition duration-300 ease-in-out hover:text-blue-700'>Tosidrop.io</Link> below!
        </p>
        <hr className="my-6 border-gray-300" />
        <p className="text-lg">
          Connect your wallet or user search bar to find out how much you can earn extra by delegating to the EASY1 Stakepool
        </p>
      </div>
      <div
        className="relative overflow-hidden text-center bg-no-repeat bg-cover rounded-lg"
        style={{ height: 400 + 'px', backgroundImage: `url(${nigtsky.src})` }}>
        <div
          className="absolute top-0 bottom-0 left-0 right-0 w-full h-full overflow-hidden bg-fixed"
        // style={{backgroundColor: `rgba(0, 0, 0, 0.6)`}}
        >
          <div className="flex items-center justify-center h-full">
            <div className="text-white">
              <h2 className="mb-4 text-4xl font-semibold">EASY1 Stake Pool</h2>
              <h4 className="mb-6 text-xl font-semibold">Staking  | Airdrops | Raffles</h4>
              {/* <a
                className="inline-block py-3 mb-1 text-sm font-medium leading-snug text-gray-200 uppercase transition duration-150 ease-in-out border-2 border-gray-200 rounded px-7 hover:bg-black hover:bg-opacity-5 focus:outline-none focus:ring-0"
                href="#!"
                role="button"
                data-mdb-ripple="true"
                data-mdb-ripple-color="light"
                hidden
              >Call to action</a> */}
            </div>
          </div>
        </div>
      </div>
      <section className="my-8 bg-white rounded-lg">
        <div className="container px-6 py-10 mx-auto">
          <h1 className="text-2xl font-semibold text-center text-black capitalize lg:text-3xl">
            Explore our <span className="text-sky-600">Offerings</span>
          </h1>
          <div className="grid grid-cols-1 gap-8 mt-8 xl:mt-12 xl:gap-16 md:grid-cols-2 xl:grid-cols-3">

            {offerings.map((offering, i) =>
              <div className="flex flex-col items-center p-6 space-y-3 text-center bg-gray-100 rounded-xl dark:bg-gray-800" key={`offering-` + i}>

                <span className="inline-block p-3 text-blue-500 bg-blue-100 rounded-full dark:text-white dark:bg-blue-500">
                  <FontAwesomeIcon
                    icon={offering.icon}
                    className={offering.iconClassName}
                  />
                </span>

                <h1 className="text-xl font-semibold text-gray-700 capitalize dark:text-white">{offering.title}</h1>

                <p className="text-gray-500 dark:text-gray-300">
                  {offering.description}
                </p>

                {offering.linkValue ? (
                  <a href={offering.linkValue} className="flex items-center -mx-1 text-sm text-blue-500 capitalize transition-colors duration-300 transform dark:text-blue-400 hover:underline hover:text-blue-600 dark:hover:text-blue-500">
                    <span className="mx-1">{offering.linkText}</span>
                    <svg className="w-4 h-4 mx-1 rtl:-scale-x-100" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd">
                      </path>
                    </svg>
                  </a>) : null}

              </div>

            )}
          </div>
        </div>
      </section>
      <EstimateRewards />
      <Distributions />


    </Layout>
  )
}
