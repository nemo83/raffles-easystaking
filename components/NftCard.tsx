import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Image from 'next/image';
import {
    faTicket, faStar,
} from "@fortawesome/free-solid-svg-icons";
import { useState } from 'react';


const TokenCard = () => {


    const [hoverCard, setHoverCard] = useState(true)

    return (
        <div className="flex justify-center">
            <div className="flex flex-col bg-white rounded-lg shadow-lg">
                <img
                    className="object-cover w-full rounded-t-lg h-96"
                    src="https://ipfs.io/ipfs/QmdHiHmWdt2gonmViGwJcvp4gfZiuVyrtub7H7iCc5QSmf"
                    alt="" />
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
                                3600 ADA
                            </span>
                            <img src="cardano-blue.png" alt="cardano Logo" className="w-[22px] h-[21.85px] object-contain" />
                            <span className={`absolute -bottom-2 -right-[4px] rounded bg-buttons py-1 px-2 text-[12px] text-white leading-[15px] dark:bg-[#8FA2B6] bg-[#04152A] ${hoverCard ? 'block' : 'hidden'}`} >
                                Floor Price
                            </span>
                        </div>

                    </div>

                    <div className="flex items-center justify-between gap-1 mb-2">
                        <span className="grid text-gray-900 place-content-center">
                            <p>
                                <FontAwesomeIcon icon={faTicket} /> Tickets: 5/15
                            </p>
                        </span>

                        <div className="flex items-center justify-center gap-1">
                            <span className="text-gray-900 ">
                                <FontAwesomeIcon icon={faStar} /> Entries: 0
                            </span>

                        </div>

                    </div>

                    <div className='w-full my-1'>
                        <button type='button' className='w-full bg-blue-500 rounded'>
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
    )
}

export default TokenCard