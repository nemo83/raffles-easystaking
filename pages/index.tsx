import Layout from "../components/Layout";
import { Distributions } from "../components/Distributions";
import dynamic from 'next/dynamic';
import { useWalletContext } from "../components/WalletProvider";
import easy1staking from '../img/jpg/easy1staking-full.jpg'
import type { NextPage } from 'next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faPiggyBank, faUmbrella, faDice, faFileImage
} from "@fortawesome/free-solid-svg-icons"
import { useEffect, useState } from "react";
import { Cip30Wallet, StakeAddress, WalletHelper } from "@hyperionbt/helios";
import { network, getBlockfrostUrl, getBlockfrostKey } from "../constants/blockfrost";
import { easy1_stake_pool_bech32_id, easy1_stake_pool_id } from "../constants/lottery"
import { Blockfrost, Lucid, Delegation } from "lucid-cardano"; // NPM
import Link from "next/link";


const EstimateRewards = dynamic(() => import('../components/EstimateRewards'), { ssr: false })


const Home: NextPage = (props: any) => {

  const [walletHandle, setWalletHandle] = useWalletContext()

  const [showModal, setShowModal] = useState(false)

  const [stakingAddress, setStakingAddress] = useState(null)
  const [isEasy1Delegate, setIsEasy1Delegate] = useState(null)

  useEffect(() => {
    const mainnet = network == 'mainnet'
    if (walletHandle && mainnet) {
      (async () => {
        const walletHelper = new WalletHelper(new Cip30Wallet(walletHandle))
        const baseAddress = await walletHelper.baseAddress
        const stakingAddress = StakeAddress.fromHash(!mainnet, baseAddress.stakingHash)
        setStakingAddress(stakingAddress)
        console.log('stakingAddress', stakingAddress.toBech32())


        fetch('https://lottery.easystaking.online/delegator_details/' + stakingAddress.toBech32() + '/staking')
          .then((res) => res.json())
          .then((data) => {
            console.log('data', data)
            if (data.stake_pool_id) {
              if (data.stake_pool_id == easy1_stake_pool_id) {
                setIsEasy1Delegate(true)
              } else {
                setIsEasy1Delegate(false)
              }
            } else {
              setIsEasy1Delegate(null)
            }
          })
      })()
    } else {
      setIsEasy1Delegate(null)
    }
  }, [walletHandle])

  const offerings = [{
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
  }, {
    title: 'Low Staking Fee',
    description: 'Professionally configured Stakepool, running on Cloud powered by 100% Renewable Energy',
    icon: faPiggyBank,
    iconClassName: "fas fa-2x fa-fw",
    linkValue: null,
    linkText: null,
  }, {
    title: 'NFT Raffles',
    description: 'Buy tickets of our on chain raffles and good luck!',
    icon: faFileImage,
    iconClassName: "fas fa-2x fa-fw",
    linkValue: '/nft-raffles',
    linkText: 'Find out more',
  }]

  const newDelegateTweet = `I just delegated to the EASY1 Stake Pool
  
  ✅ Low fee
  ✅ Extra Token Airdrop
  ✅ On Chain Raffles

  Find out more at easy1staking.com

  @CryptoJoe101`

  const existingDelegateTweet = `I am an EASY1 Stake Pool delegate

  ✅ Low fee
  ✅ Extra Token Airdrop
  ✅ On Chain Raffles

  Find out more at easy1staking.com

  @CryptoJoe101`

  const delegate = async () => {

    try {

      let lucidNetwork;
      switch (network) {
        case "preview":
          lucidNetwork = "Preview"
          break;
        case "preprod":
          lucidNetwork = "Preprod"
          break;
        default:
          lucidNetwork = "Mainnet"
          break;
      }

      const lucid = await Lucid.new(
        new Blockfrost(getBlockfrostUrl(network), getBlockfrostKey(network)),
        lucidNetwork,
      );

      lucid.selectWallet(walletHandle)

      let delegation: Delegation = await lucid.wallet.getDelegation();

      if (delegation.poolId === null) {

        let rewardAddress = await lucid.wallet.rewardAddress();

        if (rewardAddress) {
          const tx = await lucid
            .newTx()
            .registerStake(rewardAddress)
            .delegateTo(rewardAddress, easy1_stake_pool_bech32_id)
            .validTo(Date.now() + 1000000).complete()

          console.log(tx);
          const signedTx = await tx.sign().complete();
          await signedTx.submit().then(() => setShowModal(true));

        }

      } else {
        let rewardAddress = await lucid.wallet.rewardAddress();
        if (rewardAddress) {
          const tx = await lucid
            .newTx()
            .delegateTo(rewardAddress, easy1_stake_pool_bech32_id)
            .validTo(Date.now() + 1000000).complete()

          console.log(tx);
          const signedTx = await tx.sign().complete();
          await signedTx.submit().then(() => setShowModal(true));;
        }
      }
      return
    } catch {
      throw "Delegate error"
    }
  }

  return (
    <Layout>

      {/* Modal */}
      <div className={`fixed inset-0 z-50 items-center justify-center overflow-x-hidden overflow-y-auto outline-none focus:outline-none ` + (showModal ? ' flex ' : ' hidden ')} >
        <div className="relative w-auto max-w-3xl mx-auto my-6">

          <div className="relative flex flex-col w-full bg-white border-0 rounded-lg shadow-lg outline-none dark:bg-gray-600 focus:outline-none">

            <div className="flex items-start justify-between p-5 text-black border-b border-gray-300 border-solid rounded-t dark:text-white">
              <span className="flex">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="h-8">
                  <path d="M459.37 151.716c.325 4.548.325 9.097.325 13.645 0 138.72-105.583 298.558-298.558 298.558-59.452 0-114.68-17.219-161.137-47.106 8.447.974 16.568 1.299 25.34 1.299 49.055 0 94.213-16.568 130.274-44.832-46.132-.975-84.792-31.188-98.112-72.772 6.498.974 12.995 1.624 19.818 1.624 9.421 0 18.843-1.3 27.614-3.573-48.081-9.747-84.143-51.98-84.143-102.985v-1.299c13.969 7.797 30.214 12.67 47.431 13.319-28.264-18.843-46.781-51.005-46.781-87.391 0-19.492 5.197-37.36 14.294-52.954 51.655 63.675 129.3 105.258 216.365 109.807-1.624-7.797-2.599-15.918-2.599-24.04 0-57.828 46.782-104.934 104.934-104.934 30.213 0 57.502 12.67 76.67 33.137 23.715-4.548 46.456-13.32 66.599-25.34-7.798 24.366-24.366 44.833-46.132 57.827 21.117-2.273 41.584-8.122 60.426-16.243-14.292 20.791-32.161 39.308-52.628 54.253z" />
                </svg>
                <h3 className="ml-1 text-3xl font-semibold capitalize">
                  Share on Twitter
                </h3>
              </span>

              <button
                type="button"
                className="box-content border-none rounded-none hover:no-underline hover:opacity-75 focus:opacity-100 focus:shadow-none focus:outline-none"
                onClick={() => setShowModal(false)}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  className="w-6 h-6">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

            </div>
            <div className="relative flex-auto p-6">
              Thanks for staking with the EASY1 Stake Pool. <br />
              Share it on Twitter and help to grow the pool
            </div>
            <div className="flex items-center justify-end p-6 border-t border-solid rounded-b border-blueGray-200">
              <button
                className="px-6 py-2 mb-1 mr-1 text-sm font-bold text-black uppercase outline-none background-transparent focus:outline-none dark:text-white"
                type="button"
                onClick={() => setShowModal(false)} >
                Close
              </button>
              <Link
                className="px-6 py-3 mb-1 mr-1 text-sm font-bold text-white uppercase bg-blue-400 rounded shadow outline-none hover:bg-blue-500 focus:outline-none"
                href={`https://twitter.com/intent/tweet?text=${encodeURI(newDelegateTweet)}&hashtags=Cardano,Staking,EASY1,NFT`}
                target="_blank"
                rel="noopener noreferrer">
                Share
              </Link>
            </div>
          </div>
        </div>
      </div >

      <div
        className="relative overflow-hidden text-center bg-center bg-no-repeat bg-cover rounded-lg"
        style={{ height: 400 + 'px', backgroundImage: `url(${easy1staking.src})` }}>
        <div
          className="absolute top-0 bottom-0 left-0 right-0 w-full h-full overflow-hidden bg-fixed"
        // style={{backgroundColor: `rgba(0, 0, 0, 0.6)`}}
        >
          <div className="flex items-end justify-center h-full">
            <div className="text-white">
              {/* <h2 className="mb-4 text-4xl font-semibold">EASY1 Stake Pool</h2> */}
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

      {isEasy1Delegate == true ? (
        <section className="my-8 text-center bg-white rounded-lg">
          <div className="px-6 py-12 md:px-12">
            <h2 className="p-6 my-12 space-y-3 text-5xl font-bold tracking-tight text-gray-800 uppercase bg-gray-100 rounded-lg dark:bg-gray-800 dark:text-white">
              Hello Delegate! <br />
              <span className="text-3xl normal-case text-myblue">Have you checked our perks yet?</span>
            </h2>
            <a className="inline-block py-3 mb-2 text-sm font-medium leading-snug text-white uppercase transition duration-150 ease-in-out rounded shadow-md bg-myblue px-7 hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg md:mr-2"
              href="#offerings" role="button" data-mdb-ripple="true" data-mdb-ripple-color="light">Get started</a>

            <Link
              className="inline-block py-3 mb-2 text-sm font-medium leading-snug text-blue-600 uppercase transition duration-150 ease-in-out bg-transparent rounded px-7 hover:text-blue-700 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none focus:ring-0 active:bg-gray-200"
              href={`https://twitter.com/intent/tweet?text=${encodeURI(existingDelegateTweet)}&hashtags=Cardano,Staking,EASY1,NFT`}
              target="_blank"
              rel="noopener noreferrer">
              <div className="flex">
                Share&nbsp;
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="w-4 h-4 fill-current">
                  <path d="M459.37 151.716c.325 4.548.325 9.097.325 13.645 0 138.72-105.583 298.558-298.558 298.558-59.452 0-114.68-17.219-161.137-47.106 8.447.974 16.568 1.299 25.34 1.299 49.055 0 94.213-16.568 130.274-44.832-46.132-.975-84.792-31.188-98.112-72.772 6.498.974 12.995 1.624 19.818 1.624 9.421 0 18.843-1.3 27.614-3.573-48.081-9.747-84.143-51.98-84.143-102.985v-1.299c13.969 7.797 30.214 12.67 47.431 13.319-28.264-18.843-46.781-51.005-46.781-87.391 0-19.492 5.197-37.36 14.294-52.954 51.655 63.675 129.3 105.258 216.365 109.807-1.624-7.797-2.599-15.918-2.599-24.04 0-57.828 46.782-104.934 104.934-104.934 30.213 0 57.502 12.67 76.67 33.137 23.715-4.548 46.456-13.32 66.599-25.34-7.798 24.366-24.366 44.833-46.132 57.827 21.117-2.273 41.584-8.122 60.426-16.243-14.292 20.791-32.161 39.308-52.628 54.253z" />
                </svg>
              </div>
            </Link>
          </div>
        </section>
      ) : null
      }

      {isEasy1Delegate == false ? (
        <section className="my-8 text-center bg-white rounded-lg">
          <div className="px-6 py-12 md:px-12">
            <h2 className="p-6 my-12 space-y-3 text-5xl font-bold tracking-tight text-gray-800 uppercase bg-gray-100 rounded-lg dark:bg-gray-800 dark:text-white">
              Start earning MORE! <br />
              <span className="text-3xl normal-case text-myblue">Delegate to EASY1 and enjoy extra rewards</span>
            </h2>
            <button
              className="inline-block py-3 mb-2 text-sm font-medium leading-snug text-white uppercase transition duration-150 ease-in-out rounded shadow-md bg-myblue px-7 hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg md:mr-2"
              onClick={() => delegate()}>
              Delegate
            </button>
            <a className="inline-block py-3 mb-2 text-sm font-medium leading-snug uppercase transition duration-150 ease-in-out bg-transparent rounded text-myblue px-7 hover:text-blue-700 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none focus:ring-0 active:bg-gray-200"
              href="#offerings" role="button">Learn more</a>
          </div>
        </section>
      ) : null
      }

      <section className="my-8 bg-white rounded-lg" id="offerings">
        <div className="container px-6 py-10 mx-auto">
          <h1 className="text-2xl font-semibold text-center text-black capitalize lg:text-3xl">
            Explore our <span className="font-bold text-sky-600">Incentives</span>
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
                  <a href={offering.linkValue} className="flex items-center -mx-1 text-sm text-blue-500 capitalize transition-colors duration-300 transform dark:text-blue-400 hover:underline hover:text-myblue dark:hover:text-blue-500">
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


    </Layout >
  )
}

export default Home
