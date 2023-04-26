import Dashboard from '../components/Dashboard'
import OpenRaffles from '../components/OpenRaffles';
import MyRaffles from '../components/MyRaffles';
import ClosedRaffles from '../components/ClosedRaffles';
import RecentWinners from '../components/RecentWinners';
import Layout from '../components/Layout';
import { useWalletContext } from "../components/WalletProvider";
import {
  WalletHelper,
  Cip30Wallet
} from "@hyperionbt/helios"
import { useState, useEffect } from 'react';
import * as lottery from '../components/Offchan/Lottery'
import { friendly_name_key } from '../constants/lottery';
import { toast } from 'react-hot-toast';

export default function Raffles() {

  const [baseAddress, setBaseAddress] = useState(null);
  const [walletHandle, setWalletHandle] = useWalletContext();

  // Raffle Modal
  const [friendlyName, setFriendlyName] = useState('')
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {

    // Friendly Name restore
    const saveFriendlyName = localStorage.getItem(friendly_name_key)
    if (saveFriendlyName != null) {
      setFriendlyName(saveFriendlyName)
    }


    const getBaseAddress = async () => {
      const baseAddress = (await new WalletHelper(new Cip30Wallet(walletHandle)).baseAddress).toBech32()
      setBaseAddress(baseAddress)
    }
    if (walletHandle) {
      getBaseAddress()
    } else {
      setBaseAddress(null)
    }
  }, [walletHandle])


  return (
    <Layout >

      {showModal ? (
        <>
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none focus:outline-none">
            <div className="relative w-auto max-w-3xl mx-auto my-6">
              <div className="relative flex flex-col w-full bg-white border-0 rounded-lg shadow-lg outline-none dark:bg-gray-600 focus:outline-none">
                <div className="flex items-start justify-between p-5 text-black border-b border-gray-300 border-solid rounded-t dark:text-white">
                  <h3 className="text-3xl font-semibold capitalize">Join Raffles</h3>
                  <button
                    className="float-right text-black bg-transparent border-0"
                    onClick={() => setShowModal(false)} >
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
                  <form className="w-full px-8 pt-6 pb-8 bg-gray-200 rounded shadow-md">
                    <label className="block mb-1 text-sm font-bold text-black">
                      Friendly Name
                    </label>
                    <input
                      className="w-full px-1 py-2 text-black border rounded shadow appearance-none"
                      onChange={(event) => setFriendlyName(event.target.value)}
                      value={friendlyName} />
                    <label className="block mb-1 text-sm font-bold text-black">
                      Address
                    </label>
                    <input
                      className="w-full px-1 py-2 text-black border rounded shadow appearance-none"
                      disabled
                      readOnly
                      value={`${baseAddress.slice(0, 12)} ... ${baseAddress.slice(baseAddress.length - 4)}`} />

                  </form>
                </div>
                <div className="flex items-center justify-end p-6 border-t border-solid rounded-b border-blueGray-200">
                  <button
                    className="px-6 py-2 mb-1 mr-1 text-sm font-bold text-black uppercase outline-none background-transparent focus:outline-none dark:text-white"
                    type="button"
                    onClick={() => setShowModal(false)} >
                    Close
                  </button>
                  <button
                    className="px-6 py-3 mb-1 mr-1 text-sm font-bold text-white uppercase bg-blue-400 rounded shadow outline-none hover:bg-blue-500 focus:outline-none"
                    type="button"
                    onClick={() => { lottery.participate(friendlyName, baseAddress); setShowModal(false) }} >
                    Submit
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : null}

      <Dashboard />

      <section className="my-8 text-center bg-white rounded-lg">
        <div className="px-3 py-6 md:px-12">
          <h2 className="p-3 my-3 text-5xl tracking-tight text-gray-800 bg-gray-100 rounded-lg dark:bg-gray-800 dark:text-white">
            Hey There! <br />
            <span className="text-3xl text-myblue">Have you joined the Raffles?</span>
          </h2>
          <button
            className={`py-3 mb-2 px-7 text-sm font-medium leading-snug text-white uppercase transition duration-150 ease-in-out rounded shadow-md md:mr-2 ` + (walletHandle ?
              `bg-myblue  hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg`
              : `bg-gray-400`
            )}
            onClick={() => walletHandle ? setShowModal(!showModal) : toast.error('Connect wallet to Join Raffles')}
            title={showModal ? `Join Raffles` : `Connect wallet to join`}>
            Participate
          </button>

        </div>
      </section>

      {baseAddress ? (
        <MyRaffles baseAddress={baseAddress} />
      ) : null}
      <OpenRaffles />
      <RecentWinners />
      <ClosedRaffles />
    </Layout>
  )
}
