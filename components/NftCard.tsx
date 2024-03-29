import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faTicket, faStar, faClock
} from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useWalletContext } from "../components/WalletProvider";
import * as raffleV2 from './Offchan/RaffleV2'
import { toast } from 'react-hot-toast';
import { network } from '../constants/blockfrost';
import Spinner from '../components/Spinner'
import { Cip30Wallet } from '@hyperionbt/helios';

interface NftCard {
    policyIdHex: string,
    assetNameHex: string,
    collectionName: string,
    nftName: string,
    mainImgUrl: string,
    ticketPrices: number,
    maxParticipants: number,
    maxNumTicketsPerWallet: number,
    numPurchasedTickets: number,
    numWalletPurchasedTickets: number | undefined,
    deadline: Date | undefined,
    userWon: boolean,
    raffleScript: string,
    vaultScript: string,
    callback: () => void
}

const NftCard = ({
    policyIdHex,
    assetNameHex,
    collectionName,
    nftName,
    mainImgUrl,
    ticketPrices,
    maxParticipants,
    maxNumTicketsPerWallet,
    numPurchasedTickets,
    numWalletPurchasedTickets,
    deadline,
    userWon,
    raffleScript,
    vaultScript,
    callback
}: NftCard) => {

    const [walletHandle, setWalletHandle] = useWalletContext();

    const [showModal, setShowModal] = useState(false)

    const [hoverCard, setHoverCard] = useState(true)

    // Form values
    const [numTickets, setNumTickets] = useState(1)

    const [options, setOptions] = useState([])

    const [floorPrice, setFloorPrice] = useState('N/A')

    const [expired, setExpired] = useState(false)
    const [cdValue, setCDValue] = useState('')

    const [showSpinner, setShowSpinner] = useState(false)

    useEffect(() => {
        let now = new Date().getTime()
        if (deadline && !userWon && now < deadline.getTime()) {
            const interval = setInterval(() => {
                now = new Date().getTime()
                if (now > deadline.getTime()) {
                    setCDValue("Expired")
                    setExpired(true)
                    clearInterval(interval)
                } else {
                    const countdown = deadline.getTime() - now
                    const days = Math.floor(countdown / (1000 * 60 * 60 * 24));
                    const hours = Math.floor(
                        (countdown % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
                    );
                    const minutes = Math.floor((countdown % (1000 * 60 * 60)) / (1000 * 60));
                    const seconds = Math.floor((countdown % (1000 * 60)) / 1000);

                    setExpired(false)
                    setCDValue(`${days}d ${hours}h ${minutes}m ${seconds}s`)
                }
            }, 1000);

        } else {
            setCDValue("Expired")
            setExpired(true)
        }
    }, [deadline, userWon]);

    useEffect(() => {
        const options = []
        const numAvailTickets = Math.min((maxNumTicketsPerWallet - numWalletPurchasedTickets), maxParticipants - numPurchasedTickets)
        for (let index = 0; index < numAvailTickets; index++) {
            options.push(<option value={index + 1}>{index + 1}</option>)
        }
        setOptions(options)
    }, [maxNumTicketsPerWallet, numWalletPurchasedTickets, numPurchasedTickets, maxParticipants])

    useEffect(() => {

        const getFloorPrice = async () => {

            const response = await fetch(`https://api.cnftjungle.io/api/collections/listings/floor/${policyIdHex}`)

            if (response.status < 300) {
                const floorPrice = await response.json()
                setFloorPrice('' + (Number(floorPrice) / 1_000_000))
            }

        }

        if (network == 'mainnet') {
            getFloorPrice()
        }

    }, [policyIdHex])


    const buyTicket = async () => {
        setShowSpinner(true)
        return raffleV2.buyRaffleTickets(
            policyIdHex,
            assetNameHex,
            numTickets,
            raffleScript,
            new Cip30Wallet(walletHandle)
        ).then(() => {
            toast.success('Transaction successfully submited!')
            setShowModal(false)
            repeatN(callback, 20000, 6)
        }).catch(errorMessage => {
            console.log('error', errorMessage)
            toast.error(errorMessage.message)
        }).finally(() => setShowSpinner(false))
    }

    const collectNft = async () => {
        raffleV2.collectPrize(policyIdHex, assetNameHex, vaultScript, new Cip30Wallet(walletHandle))
            .then(() => {
                toast.success("Success!\nThe NFT it's on his way!")
            })
            .catch(errorMessage => {
                console.log('error', errorMessage)
                toast.error(errorMessage.message)
            })
    }

    const repeatN = async (fn: () => void, delay: number, times: number) => {
        var x = 0;
        var intervalID = window.setInterval(function () {

            callback();

            if (++x === times) {
                window.clearInterval(intervalID);
            }
        }, delay);

    }

    return (
        <>
            {/* Modal */}
            <div className={`fixed inset-0 z-50 items-center justify-center overflow-x-hidden overflow-y-auto outline-none focus:outline-none ` +
                (showModal ? ' flex ' : ' hidden ')} >
                <div className="relative w-auto max-w-3xl mx-auto my-6">
                    <div className="relative flex flex-col w-full bg-white border-0 rounded-lg shadow-lg outline-none focus:outline-none">
                        <div className="flex items-start justify-between p-5 text-black border-b border-gray-300 border-solid rounded-t dark:text-white">
                            <h3 className="text-3xl font-semibold capitalize">Buy Tickets</h3>
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
                                            {options}
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
                                className="px-6 py-3 mb-1 mr-1 text-sm font-bold text-white uppercase bg-blue-400 rounded shadow outline-none hover:bg-blue-500 focus:outline-none"
                                type="button"
                                onClick={() => {
                                    buyTicket()
                                }} >
                                Buy Ticket
                            </button>
                        </div>
                    </div>
                </div>
            </div >

            {showSpinner ? (
                <Spinner />
            ) : null}

            <div className="flex w-full my-6 md:mx-2 md:justify-center md:w-auto">

                <div className="flex w-full bg-white rounded-lg shadow-lg md:flex-col md:w-auto">

                    <div className="relative w-1/2 md:w-auto h-60">
                        <Image
                            fill={true}
                            className="object-cover w-full rounded-l-lg md:rounded-none md:rounded-t-lg h-96"
                            src={mainImgUrl}
                            alt="" />
                    </div>

                    <div className="flex flex-col w-auto p-6">
                        <div className='flex'>
                            <h5 className="mb-2 text-xs font-bold text-gray-900">{collectionName}&nbsp;</h5>
                            <svg viewBox="0 0 20 22" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-blue-600 text-text-link">
                                <path fillRule="evenodd" clipRule="evenodd" d="M11.513 1.94254C11.2246 0.237905 8.77552 0.237904 8.48715 1.94254C8.2805 3.16417 6.78595 3.64978 5.9007 2.78292C4.66545 1.57334 2.6841 3.01289 3.45276 4.56146C4.00363 5.67125 3.07995 6.94258 1.85425 6.76162C0.143939 6.50911 -0.612873 8.83834 0.919219 9.63935C2.0172 10.2134 2.0172 11.7849 0.919218 12.3589C-0.612874 13.1599 0.143939 15.4891 1.85425 15.2366C3.07995 15.0557 4.00363 16.327 3.45276 17.4368C2.6841 18.9854 4.66546 20.4249 5.9007 19.2153C6.78595 18.3485 8.2805 18.8341 8.48715 20.0557C8.77552 21.7603 11.2246 21.7603 11.513 20.0557C11.7196 18.8341 13.2142 18.3485 14.0994 19.2153C15.3347 20.4249 17.316 18.9854 16.5474 17.4368C15.9965 16.327 16.9202 15.0557 18.1459 15.2366C19.8562 15.4891 20.613 13.1599 19.0809 12.3589C17.9829 11.7849 17.9829 10.2134 19.0809 9.63935C20.613 8.83834 19.8562 6.50911 18.1459 6.76162C16.9202 6.94258 15.9965 5.67125 16.5474 4.56146C17.316 3.01289 15.3347 1.57334 14.0994 2.78292C13.2142 3.64978 11.7196 3.16417 11.513 1.94254ZM8.29287 13.6601C8.22746 13.5947 8.173 13.5225 8.1295 13.4457L6.70708 12.0233C6.31656 11.6328 6.31656 10.9996 6.70708 10.6091C7.09761 10.2186 7.73077 10.2186 8.1213 10.6091L9.02548 11.5133L12.2462 8.29262C12.6367 7.9021 13.2698 7.9021 13.6604 8.29262C14.0509 8.68315 14.0509 9.31631 13.6604 9.70684L9.70708 13.6601C9.31656 14.0506 8.6834 14.0506 8.29287 13.6601Z" fill="currentColor">
                                </path>
                            </svg>
                        </div>

                        <div className="flex items-center justify-between gap-1 mb-2">
                            <span className="grid font-bold text-gray-900 rounded-sm place-content-center">
                                {nftName.slice(0, 20)} {nftName && nftName.length > 20 ? '...' : ''}
                            </span>

                            <div className="flex items-center justify-center gap-1">
                                <span className="font-bold text-gray-900"
                                    onMouseEnter={() => setHoverCard(true)}
                                    onMouseLeave={() => setHoverCard(false)}>
                                    <a href="#"
                                        className="transition duration-150 ease-in-out transititext-primary text-primary hover:text-primary-600 focus:text-primary-600 active:text-primary-700 dark:text-primary-400 dark:hover:text-primary-500 dark:focus:text-primary-500 dark:active:text-primary-600"
                                        // data-te-toggle="tooltip"
                                        title="Floor price">
                                        {floorPrice}
                                    </a>
                                </span>
                                <img src="cardano-blue.png" alt="cardano Logo" className="w-[22px] h-[21.85px] object-contain" />
                            </div>

                        </div>

                        <div className="flex items-center justify-between gap-1 mb-2">
                            <span className="grid text-sm text-gray-900 place-content-center">
                                <p>
                                    <FontAwesomeIcon icon={faClock} size="sm" /> {cdValue}
                                </p>
                            </span>

                        </div>
                        <div className="flex items-center justify-between gap-1 mb-2">
                            <span className="grid text-sm text-gray-900 place-content-center">
                                <p>
                                    <FontAwesomeIcon icon={faTicket} size="sm" /> Tickets: {numPurchasedTickets}/{maxParticipants}
                                </p>
                            </span>

                            <div className="flex items-center justify-center gap-1">
                                <span className="text-sm text-gray-900">
                                    <FontAwesomeIcon icon={faStar} size="sm" /> My Entries: {numWalletPurchasedTickets != undefined ? numWalletPurchasedTickets : "N/A"}/{maxNumTicketsPerWallet ? maxNumTicketsPerWallet : "N/A"}
                                </span>

                            </div>

                        </div>

                        <div className={`w-full my-1 ` + (userWon ? ' hidden' : '')}>
                            <button
                                type='button'
                                className={`w-full rounded ` + (numPurchasedTickets < maxParticipants && !expired ? 'bg-blue-500' : 'bg-gray-500')}
                                disabled={numPurchasedTickets >= maxParticipants || expired}
                                onClick={() => {
                                    if (!new Cip30Wallet(walletHandle)) {
                                        toast.error("Wallet not connected")
                                    } else if (numWalletPurchasedTickets >= maxNumTicketsPerWallet) {
                                        toast.error("Max num tickets purchased")
                                    } else {
                                        setShowModal(true)
                                    }
                                }
                                }>
                                {numPurchasedTickets < maxParticipants && !expired ? (
                                    <span>Buy Ticket ({ticketPrices / 1_000_000} ₳)</span>
                                ) : "Drawing winner"}
                            </button>
                        </div>
                        {userWon ? (<div className='w-full my-1'>
                            <button
                                type='button'
                                className='w-full bg-red-500 rounded'
                                onClick={() => collectNft()}>
                                Collect prize
                            </button>
                        </div>) : null}
                        <div className='hidden w-full mt-1'>
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

export default NftCard