import Layout from "../components/Layout";
import { Distributions } from "../components/Distributions";
import dynamic from 'next/dynamic';
import { useWalletContext } from "../components/WalletProvider";
import easy1staking from '../img/jpg/easy1staking-full.jpg'
import type { NextPage } from 'next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faPiggyBank, faUmbrella, faDice
} from "@fortawesome/free-solid-svg-icons"
import { useEffect, useState } from "react";
import { Cip30Wallet, StakeAddress, WalletHelper } from "@hyperionbt/helios";
import { network, getBlockfrostUrl, getBlockfrostKey } from "../constants/blockfrost";
import { easy1_stake_pool_bech32_id, easy1_stake_pool_id } from "../constants/lottery"
import { Blockfrost, Lucid, Delegation } from "lucid-cardano"; // NPM


const EstimateRewards = dynamic(() => import('../components/EstimateRewards'), { ssr: false })


const Home: NextPage = (props: any) => {

  const [walletHandle, setWalletHandle] = useWalletContext()

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


        fetch('https://hilltop-api.mainnet.dandelion.blockwarelabs.io/delegations/' + stakingAddress.toBech32() + '/stakepool')
          .then((res) => res.json())
          .then((data) => {
            console.log('data', data)
            if (data.delegations) {
              let delegations = data.delegations
              delegations.sort((a, b) => a.epoch - b.epoch)
              let currentDelegation = delegations.slice(-1)[0]
              console.log('currentDelegation: ' + JSON.stringify(currentDelegation))

              if (currentDelegation.stakepool) {
                if (currentDelegation.stakepool.id == easy1_stake_pool_id) {
                  setIsEasy1Delegate(true)
                } else {
                  setIsEasy1Delegate(false)
                }
              } else {
                setIsEasy1Delegate(null)
              }
            }
          })
      })()
    }
  }, [walletHandle])

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
          const txHash = await signedTx.submit();
          console.log(txHash)
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
          const txHash = await signedTx.submit();
        }
      }
      return
    } catch {
      throw "Delegate error"
    }
  }

  return (
    <Layout>
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

      {isEasy1Delegate ? (
        <section className="my-8 bg-white rounded-lg">
          <div className="container px-6 py-10 mx-auto">
            <h1 className="text-2xl font-semibold text-center text-black capitalize lg:text-3xl">
              Thanks for Staking w/ EASY1 Stake Pool
            </h1>

          </div>
        </section>
      ) : (
        <section className="mb-32">
          <div className="relative overflow-hidden bg-no-repeat bg-cover"
          // style={{ height: 400 + 'px', backgroundImage: `url(${easy1staking.src})` }}>
            style={`background-position: 50%; background-image: url('https://mdbcdn.b-cdn.net/img/new/slides/006.webp'); height: 500px;`}>
            <div className="absolute top-0 bottom-0 left-0 right-0 w-full h-full overflow-hidden bg-fixed"
              style="background-color: rgba(0, 0, 0, 0.75)">
              <div className="flex items-center justify-center h-full">
                <div className="px-6 text-center text-white md:px-12">
                  <h2 className="mb-12 text-5xl font-bold leading-tight tracking-tight">
                    Are you ready <br /><span>for an adventure</span>
                  </h2>
                  <button type="button"
                    className="inline-block py-3 text-sm font-medium leading-snug text-white uppercase transition duration-150 ease-in-out border-2 border-white rounded px-7 hover:bg-black hover:bg-opacity-5 focus:outline-none focus:ring-0"
                    data-mdb-ripple="true" data-mdb-ripple-color="light">
                    Get started
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}



      <EstimateRewards />
      <Distributions />


    </Layout>
  )
}

export default Home
