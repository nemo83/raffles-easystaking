import { useState, useEffect } from 'react'
import { BaseAddress, Address } from '@emurgo/cardano-serialization-lib-browser'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Image from 'next/image'
import toast, { Toaster } from 'react-hot-toast';
import {
    faHome, faDice, faQuestion
} from "@fortawesome/free-solid-svg-icons";


export const Nav = () => {

    const [showWallets, setShowWallets] = useState(false)
    const [availableWallets, setAvailableWallets] = useState([])
    const [wallet, setWallet] = useState(null)
    const [baseAddress, setBaseAddress] = useState(null)

    useEffect(() => {
        const SUPPORTED_WALLETS = ["eternl", "flint", "nami", "yoroi"]
        const aWallets = []
        SUPPORTED_WALLETS.map(walletName => {
            if (window.cardano[walletName]) {
                const { apiVersion, icon } = window.cardano[walletName]
                aWallets.push({
                    name: walletName,
                    apiVersion,
                    icon,
                    top
                })

            }
        })
        setAvailableWallets(aWallets)
    }, [])

    async function connect(walletName) {
        const wallet = await cardano[walletName].enable();
        console.log(wallet);

        setWallet(wallet)

        const addresses = await wallet.getUsedAddresses();

        const addressHex = Buffer.from(addresses[0], "hex");

        const address = BaseAddress.from_address(
            Address.from_bytes(addressHex)
        ).to_address();

        const baseAddress = address.to_bech32();

        setBaseAddress(baseAddress)

        toast.success('Wallet correctly connected!')

    }

    async function participate() {

        console.log('wallet? ' + wallet)
        if (wallet == null) return
        console.log('wallet not null')
        console.log('baseAddress: ' + baseAddress)

        const body = JSON.stringify({ payment_address: baseAddress })
        console.log('body: (' + body + ')')

        const res = fetch('https://lottery.easystaking.online/raffles', {
            method: 'POST',
            body: body,
            headers: {
                'Content-Type': 'application/json'
            },
        })
            .then(data => data.json())
            .then(data => {
                const numRaffles = data.length
                toast.success(`Congrats! You joined ${numRaffles} Raflles!`)
            })
            .catch((error) => {
                console.error('Error:', error);
                toast.error(`Error ${error}`)
            })



    }
    return (
        <nav id="header" className="fixed top-0 z-10 w-full bg-gray-900 shadow">

            <Toaster />
            <div className="container flex flex-wrap items-center w-full pt-3 pb-3 mx-auto mt-0 md:pb-0">

                <div className="z-20 flex-grow hidden w-full mt-2 bg-gray-900 lg:flex lg:items-center lg:w-auto lg:block lg:mt-0" id="nav-content">
                    <ul className="items-center flex-1 px-4 list-reset lg:flex md:px-0">
                        <li className="my-2 mr-6 md:my-0">
                            <a href="#" className="block py-1 pl-1 text-blue-400 no-underline align-middle border-b-2 border-blue-400 md:py-3 hover:text-gray-100 hover:border-blue-400">
                                <FontAwesomeIcon
                                    icon={faHome}
                                    className="mr-3 text-blue-400"
                                />
                                <span className="pb-1 text-sm md:pb-0">Home</span>
                            </a>
                        </li>
                        <li className="my-2 mr-6 md:my-0">
                            <a href="#" className="block py-1 pl-1 text-gray-500 no-underline align-middle border-b-2 border-gray-900 md:py-3 hover:text-gray-100 hover:border-pink-400">
                                <FontAwesomeIcon
                                    icon={faDice}
                                    className="mr-3"
                                />
                                <span className="pb-1 text-sm md:pb-0">Raffles</span>
                            </a>
                        </li>
                        <li className="my-2 mr-6 md:my-0">
                            <a href="#" className="block py-1 pl-1 text-gray-500 no-underline align-middle border-b-2 border-gray-900 md:py-3 hover:text-gray-100 hover:border-pink-400">
                                <FontAwesomeIcon
                                    icon={faQuestion}
                                    className="mr-3"
                                />
                                <span className="pb-1 text-sm md:pb-0">F.A.Q.</span>
                            </a>
                        </li>

                    </ul>

                </div>

                <div className="relative pl-4 pr-4 space-x-2 dropdown pull-right md:pr-0">
                    <div className="relative inline-block">
                        <div>
                            <button
                                className='px-3 py-2 rounded-full dropdown-toggle bg-slate-300 hover:bg-slate-400'
                                type="button"
                                id="menu-button"
                                aria-expanded="true"
                                aria-haspopup="true"
                                onClick={() => setShowWallets(!showWallets)}
                            >Connect</button>
                        </div>
                        {showWallets && availableWallets ? (
                            <div className="absolute right-0 mt-2 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none" role="menu" aria-orientation="vertical" aria-labelledby="menu-button" tabIndex="-1">
                                <div className="py-1" role="none">
                                    {availableWallets.map(wallet => (
                                        <button key={wallet.name}
                                            onClick={() => {
                                                setShowWallets(false)
                                                connect(wallet.name)
                                            }}
                                            className={"m-1 p-0 w-16 h-16 text-black opacity-95 hover:scale-140 shadow-lg hover:shadow-xl hidden md:block right-2 lg:right-10 top-" + wallet.top}>
                                            {
                                                wallet.icon ? <Image className="px-2 text-md" src={wallet.icon} width="30" height="30" alt={wallet.name} /> : <span className="capitalize">{wallet.name}</span>
                                            }
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : <></>}
                    </div>
                    <span>
                        {wallet ? (
                            <button type='button' className='px-3 py-2 rounded-full dropdown-toggle bg-slate-300 hover:bg-slate-400'
                                alt="Click to enter all available raffleR"
                                onClick={() => participate()}>Participate</button>
                        ) : (
                            <button type='button' className='px-3 py-2 rounded-full dropdown-toggle bg-slate-400'
                                onClick={() => {
                                    toast.error("Please connect wallet!")
                                }}
                            >Participate</button>
                        )}

                    </span>

                </div>


            </div>
        </nav>
    );
};

export default Nav