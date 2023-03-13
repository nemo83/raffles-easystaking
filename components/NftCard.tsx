import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faTicket, faStar,
} from "@fortawesome/free-solid-svg-icons";
import { useState } from 'react';
import Image from 'next/image';
import { useWalletContext } from "../components/WalletProvider";
import { buyRaffleTickets } from './Offchan/Raffle'

interface NftCard {
    policyIdHex: string,
    assetNameHex: string,
    ticketPrices: number,
    maxParticipants: number,
    maxNumTicketsPerWallet: number,
    numPurchasedTickets: number,
    numWalletPurchasedTickets: number | undefined,
    userWon: boolean,
    raffleScript: string
}

const TokenCard = ({
    policyIdHex,
    assetNameHex,
    ticketPrices,
    maxParticipants,
    maxNumTicketsPerWallet,
    numPurchasedTickets,
    numWalletPurchasedTickets,
    userWon: boolean,
    raffleScript
}: NftCard) => {

    const [walletApi, setWalletApi] = useWalletContext();

    const [showModal, setShowModal] = useState(false)

    const [hoverCard, setHoverCard] = useState(true)

    // Form values
    const [numTickets, setNumTickets] = useState(1)


    const buyTicket = async () => {
        console.log('WTF')
        buyRaffleTickets(
            policyIdHex,
            assetNameHex,
            numTickets,
            raffleScript,
            walletApi
        )
    }


    return (
        <>
            {/* Modal */}
            <div className={`fixed inset-0 z-50 items-center justify-center overflow-x-hidden overflow-y-auto outline-none focus:outline-none ` +
                (showModal ? ' flex ' : ' hidden ')} >
                <div className="relative w-auto max-w-3xl mx-auto my-6">
                    <div className="relative flex flex-col w-full bg-white border-0 rounded-lg shadow-lg outline-none focus:outline-none">
                        <div className="flex items-start justify-between p-5 border-b border-gray-300 border-solid rounded-t ">
                            <h3 className="text-3xl font=semibold capitalize">Buy Tickets</h3>
                            <button
                                className="float-right text-black bg-transparent border-0"
                                onClick={() => setShowModal(false)} >
                                <span className="block w-6 h-6 py-0 text-xl text-black bg-gray-400 rounded-full opacity-7">
                                    x
                                </span>
                            </button>
                        </div>
                        <div className="relative flex-auto p-6">
                            <form className="w-full px-8 pt-6 pb-8 bg-gray-200 rounded shadow-md">
                                <label className="block mb-1 text-sm font-bold text-black">
                                    Num Tickets
                                </label>
                                <div className="flex justify-center">
                                    <div className="mb-3 xl:w-96">
                                        <select className='w-full' value={numTickets} onChange={(event) => setNumTickets(Number(event.target.value))}>
                                            <option value="1">One</option>
                                            <option value="2">Two</option>
                                            <option value="3">Three</option>
                                            <option value="4">Four</option>
                                            <option value="5">Five</option>
                                            <option value="6">Six</option>
                                            <option value="7">Seven</option>
                                            <option value="8">Eight</option>
                                        </select>
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div className="flex items-center justify-end p-6 border-t border-solid rounded-b border-blueGray-200">
                            <button
                                className="px-6 py-2 mb-1 mr-1 text-sm font-bold text-black uppercase outline-none background-transparent focus:outline-none"
                                type="button"
                                onClick={() => setShowModal(false)} >
                                Close
                            </button>
                            <button
                                className="px-6 py-3 mb-1 mr-1 text-sm font-bold text-white uppercase rounded shadow outline-none bg-slate-300 hover:bg-slate-400 focus:outline-none"
                                type="button"
                                onClick={() => { buyTicket().then(() => setShowModal(false)) }} >
                                Buy Ticket
                            </button>
                        </div>
                    </div>
                </div>
            </div >
            <div className="flex justify-center w-1/3">

                <div className="flex flex-col bg-white rounded-lg shadow-lg">
                    <div className="relative mt-4 h-60 w-ful">
                        <Image
                            fill={true}
                            className="object-cover w-full rounded-t-lg h-96"
                            src="https://ipfs.io/ipfs/QmdHiHmWdt2gonmViGwJcvp4gfZiuVyrtub7H7iCc5QSmf"
                            alt="" />
                    </div>

                    <div className="flex flex-col justify-start p-6">
                        <div className='flex'>
                            <h5 className="mb-2 text-xs font-bold text-gray-900">SpaceBudz</h5>
                            <svg viewBox="0 0 20 22" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-blue-600 text-text-link">
                                <path fillRule="evenodd" clipRule="evenodd" d="M11.513 1.94254C11.2246 0.237905 8.77552 0.237904 8.48715 1.94254C8.2805 3.16417 6.78595 3.64978 5.9007 2.78292C4.66545 1.57334 2.6841 3.01289 3.45276 4.56146C4.00363 5.67125 3.07995 6.94258 1.85425 6.76162C0.143939 6.50911 -0.612873 8.83834 0.919219 9.63935C2.0172 10.2134 2.0172 11.7849 0.919218 12.3589C-0.612874 13.1599 0.143939 15.4891 1.85425 15.2366C3.07995 15.0557 4.00363 16.327 3.45276 17.4368C2.6841 18.9854 4.66546 20.4249 5.9007 19.2153C6.78595 18.3485 8.2805 18.8341 8.48715 20.0557C8.77552 21.7603 11.2246 21.7603 11.513 20.0557C11.7196 18.8341 13.2142 18.3485 14.0994 19.2153C15.3347 20.4249 17.316 18.9854 16.5474 17.4368C15.9965 16.327 16.9202 15.0557 18.1459 15.2366C19.8562 15.4891 20.613 13.1599 19.0809 12.3589C17.9829 11.7849 17.9829 10.2134 19.0809 9.63935C20.613 8.83834 19.8562 6.50911 18.1459 6.76162C16.9202 6.94258 15.9965 5.67125 16.5474 4.56146C17.316 3.01289 15.3347 1.57334 14.0994 2.78292C13.2142 3.64978 11.7196 3.16417 11.513 1.94254ZM8.29287 13.6601C8.22746 13.5947 8.173 13.5225 8.1295 13.4457L6.70708 12.0233C6.31656 11.6328 6.31656 10.9996 6.70708 10.6091C7.09761 10.2186 7.73077 10.2186 8.1213 10.6091L9.02548 11.5133L12.2462 8.29262C12.6367 7.9021 13.2698 7.9021 13.6604 8.29262C14.0509 8.68315 14.0509 9.31631 13.6604 9.70684L9.70708 13.6601C9.31656 14.0506 8.6834 14.0506 8.29287 13.6601Z" fill="currentColor">
                                </path>
                            </svg>
                        </div>



                        <div className="flex items-center justify-between gap-1 mb-2">
                            <span className="grid font-bold text-gray-900 rounded-sm place-content-center">
                                SpaceBud #1576
                            </span>

                            <div className="flex items-center justify-center gap-1">
                                <span className="font-bold text-gray-900"
                                    onMouseEnter={() => setHoverCard(true)}
                                    onMouseLeave={() => setHoverCard(false)}>
                                    {ticketPrices / 1_000_000} ADA
                                </span>
                                <img src="cardano-blue.png" alt="cardano Logo" className="w-[22px] h-[21.85px] object-contain" />
                            </div>

                        </div>

                        <div className="flex items-center justify-between gap-1 mb-2">
                            <span className="grid text-sm text-gray-900 place-content-center">
                                <p>
                                    <FontAwesomeIcon icon={faTicket} size="sm" /> Tickets: {numPurchasedTickets}/{maxParticipants}
                                </p>
                            </span>

                            <div className="flex items-center justify-center gap-1">
                                <span className="text-sm text-gray-900">
                                    <FontAwesomeIcon icon={faStar} size="sm" /> My Entries: {numWalletPurchasedTickets != undefined ? numWalletPurchasedTickets : "N/A"}
                                </span>

                            </div>

                        </div>

                        <div className='w-full my-1'>
                            <button
                                type='button'
                                className='w-full bg-blue-500 rounded'
                                onClick={() => setShowModal(true)}
                                disabled={numWalletPurchasedTickets >= maxNumTicketsPerWallet}>
                                Buy Ticket (5 ₳)
                            </button>
                        </div>
                        <div className='w-full mt-1'>
                            <p className="text-xs text-center text-gray-600">
                                1 ₳ participation fee for non-EASY1 delegates
                            </p>
                        </div>

                    </div>
                </div>
            </div >
        </>
    )
}

export default TokenCard