import { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Image from 'next/image'
import toast, { Toaster } from 'react-hot-toast'
import type { NextPage } from 'next'
import {
    faHome, faDice, faQuestion, faHeartbeat, faFileImage, faWallet, faChevronDown, faChevronUp,
    faSun,
} from "@fortawesome/free-solid-svg-icons"
import {
    faMoon as farMoon
} from "@fortawesome/free-regular-svg-icons"
import { useWalletContext } from "../components/WalletProvider";
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
    Address,
    StakeAddress,
    Cip30Handle,
    Cip30Wallet,
    WalletHelper
} from "@hyperionbt/helios";
import { getBlockfrostKey, getBlockfrostUrl, network } from '../constants/blockfrost'
import { initCardanoDAppConnectorBridge } from '../components/Eternl/cardano-dapp-connector-bridge'
import { useTheme } from "next-themes";
import { friendly_name_key, wallet_name_key } from '../constants/lottery'

declare global {
    interface Window {
        cardano: any;
    }
}


const Nav: NextPage = (props: any) => {

    // Theme
    const { systemTheme, theme, setTheme } = useTheme();

    const stakingAnalysis = false
    const faq = false

    const router = useRouter();
    const currentRoute = router.pathname;

    const [showMenu, setShowMenu] = useState(false)
    const [showSubMenu, setShowSubMenu] = useState(false)
    const [showWallets, setShowWallets] = useState(false)

    const [availableWallets, setAvailableWallets] = useState([])
    const [walletHandle, setWalletHandle] = useWalletContext()
    const [balance, setBalance] = useState('N/A')

    const [baseAddress, setBaseAddress] = useState(null)

    const navSelected = 'text-myblue dark:text-slate-50 border-mypink dark:border-mypink'
    const navNotSelected = 'text-gray-300 border-gray-300 hover:border-mypink dark:hover:border-mypink hover:text-gray-600 hover:text-myblue dark:hover:text-slate-50'

    useEffect(() => {

        const SUPPORTED_WALLETS = ["eternl", "flint", "nami", "yoroi"]
        const aWallets = []
        const savedWalletName = localStorage.getItem(wallet_name_key)
        SUPPORTED_WALLETS.map(walletName => {
            if (window.cardano && window.cardano[walletName]) {
                const { apiVersion, icon } = window.cardano[walletName]
                aWallets.push({
                    name: walletName,
                    apiVersion,
                    icon,
                    top
                })

                const attemptConnectWallet = async () => {
                    const isEnabled = await window.cardano[walletName].isEnabled
                    if (isEnabled) {
                        await connect(walletName)
                    }
                }
                if (savedWalletName == walletName) {
                    attemptConnectWallet()
                }

            } else {
                console.log('No window.cardano object')
            }
        })

        setAvailableWallets(aWallets)

        if (!walletHandle) {
            initCardanoDAppConnectorBridge(async (eternl) => {

                console.log('init dapp called')

                if (eternl.name === 'eternl') {
                    console.log('eternl!')
                    const handle: Cip30Handle = await eternl.enable();
                    setWalletHandle(handle)

                } else {
                    console.log('not eternl!')
                }
            })
        }

    }, [])

    useEffect(() => {

        (async () => {

            if (walletHandle) {

                const walletHelper = new WalletHelper(new Cip30Wallet(walletHandle))
                const baseAddress = await walletHelper.baseAddress
                setBaseAddress(baseAddress.toBech32())

            } else {
                setBaseAddress(null)
            }

        })()


    }, [walletHandle])

    useEffect(() => {

        const getBalance = async () => {
            if (baseAddress) {
                const isMainnet = 'mainnet' == network.toString()
                console.log('isMainnet', isMainnet)
                console.log('network', network)
                const stakingAddress = StakeAddress.fromHash(!isMainnet, Address.fromBech32(baseAddress).stakingHash).toBech32()
                let resp = await fetch(getBlockfrostUrl(network) + `/accounts/${stakingAddress}`, {
                    method: "GET",
                    headers: {
                        accept: "application/json",
                        project_id: getBlockfrostKey(network),
                    },
                });

                if (resp?.status > 299) {
                    throw console.error("NFT not found", resp);
                }
                const payload = await resp.json();

                console.log('payload: ' + JSON.stringify(payload))

                if (payload.controlled_amount) {
                    const controlledAmount = payload.controlled_amount
                    const balance = controlledAmount / 1_000_000
                    setBalance('' + balance.toFixed(2))
                }
            } else {
                setBalance('N/A')
            }


        }

        getBalance()

    }, [baseAddress])

    async function connect(walletName: string) {

        const handle: Cip30Handle = await window.cardano[walletName].enable();

        setWalletHandle(handle)

        const isReconnect = localStorage.getItem(wallet_name_key) != null
        if (!isReconnect) {
            localStorage.setItem(wallet_name_key, walletName)
            toast.success('Wallet correctly connected!')
        }

    }

    async function disconnect() {
        localStorage.removeItem(wallet_name_key)
        setWalletHandle(null)
    }

    return (
        <nav id="header" className="fixed top-0 z-10 w-full bg-gray-100 shadow dark:bg-gray-600">

            <Toaster />

            <div className="container flex flex-wrap items-center w-full pt-2 pb-3 mx-auto my-1 mt-0 lg:pb-0">

                <div className="flex justify-center w-full pl-2 sm:block sm:w-1/3 md:w-1/2 md:pl-0">
                    <a className="flex text-xl font-bold no-underline text-myblue dark:text-gray-100 xl:text-xl hover:no-underline text" href="#">
                        <Image src="easy1staking-logo.svg" width={35} height={25} alt="EASY1 Staking" />
                        <div className='ml-3'>EASY1 Staking</div>
                    </a>
                </div>
                <div className="w-full pr-0 sm:w-2/3 md:w-1/2">
                    <div className="relative flex justify-between sm:float-right sm:justify-end">

                        <div className="relative flex text-sm text-gray-100">

                            <div className='flex flex-col justify-center mr-3'>
                                <FontAwesomeIcon
                                    icon={theme == 'light' ? farMoon : faSun}
                                    onClick={() => theme == 'light' ? setTheme('dark') : setTheme('light')}
                                    className={theme == 'light' ? 'text-myblue' : ''}
                                    size="xl"
                                />
                            </div>

                            <div className={`relative flex p-1` + (walletHandle ? ' border-2 border-solid rounded-md divide-x-2 divide-myblue border-myblue dark:divide-white' : '')}>
                                {/* Connect */}
                                <div className={`text-myblue dark:text-slate-50 px-2 font-semibold`}>
                                    <button
                                        className={`px-3 py-2 text-sm bg-gray-300 rounded-md dropdown-toggle hover:bg-slate-50 ` + (walletHandle ? 'hidden' : '')}
                                        type="button"
                                        id="menu-button"
                                        aria-expanded="true"
                                        aria-haspopup="true"
                                        onClick={() => setShowWallets(!showWallets)}
                                    >Connect wallet</button>
                                    <div className={walletHandle ? ' ' : 'hidden'}>
                                        {balance} ₳
                                    </div>
                                </div>

                                <div
                                    className={`text-myblue dark:text-slate-50 font-semibold px-2 ` + (walletHandle ? '' : 'hidden')}
                                    onClick={() => setShowSubMenu(!showSubMenu)}>
                                    <FontAwesomeIcon
                                        icon={faWallet}
                                        className="mr-3"
                                    />
                                    {baseAddress ? baseAddress.slice(0, 12) : null} &nbsp;
                                    <FontAwesomeIcon
                                        icon={showSubMenu ? faChevronUp : faChevronDown}
                                        className="mr-3"
                                    />
                                </div>

                            </div>

                            {walletHandle && showSubMenu ? (
                                <div className="absolute top-0 right-0 z-30 min-w-full mt-12 overflow-auto bg-gray-200 rounded shadow-md">
                                    <ul >
                                        <li>
                                            <Link href="#"
                                                className="block px-4 py-2 no-underline text-myblue hover:bg-gray-800 hover:no-underline"
                                                onClick={() => { disconnect(); setShowSubMenu(!showSubMenu) }}>
                                                Disconnect
                                            </Link>
                                        </li>
                                    </ul>
                                </div>
                            ) : null}

                            {showWallets && availableWallets ? (
                                <div className="absolute top-0 right-0 z-30 min-w-full mt-12 overflow-auto text-lg capitalize bg-gray-200 rounded shadow-md text-myblue">
                                    <ul>
                                        {availableWallets.map((wallet, i) => (
                                            <>
                                                <li key={i}>
                                                    <Link
                                                        href="#"
                                                        onClick={() => { setShowWallets(false); connect(wallet.name) }}
                                                        className={"mx-1 my-2 p-0 w-28 h-8 bg-gray-200 flex opacity-95 flex-container justify-start items-center right-2 hover:underline hover:cursor-pointer top-" + wallet.top}>
                                                        {wallet.icon ? (
                                                            <Image src={wallet.icon} width="30" height="30" alt={wallet.name} />
                                                        ) : null}
                                                        {wallet.name}
                                                    </Link>
                                                </li>
                                                {i < availableWallets.length - 1 ? (
                                                    <li>
                                                        <hr className="mx-2 border-t border-gray-400" />
                                                    </li>
                                                ) : null}

                                            </>
                                        ))}
                                    </ul>
                                </div>
                            ) : null}

                        </div>


                        <div className="flex-grow order-first block px-4 sm:order-none lg:hidden">
                            <button id="nav-toggle"
                                className="flex items-center px-3 py-2 text-gray-300 border border-gray-300 rounded appearance-none hover:text-slate-50 hover:border-slate-50 focus:outline-none"
                                onClick={() => setShowMenu(!showMenu)}>
                                <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                    <title>Menu</title>
                                    <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z" />
                                </svg>
                            </button>
                        </div>
                    </div>

                </div>

                <div className={`z-20 flex-grow w-full mt-2 bg-gray-100 dark:bg-gray-600 lg:flex lg:items-center lg:w-auto lg:block lg:mt-0` + (showMenu ? ' ' : ' hidden')} id="nav-content">

                    <ul className="items-center flex-1 px-4 list-reset lg:flex md:px-0">
                        <li className="my-2 mr-6 md:my-0">
                            <Link href="/" className={`block py-1 pl-1 no-underline align-middle border-b-2 ` +
                                (currentRoute == '/' ? navSelected : navNotSelected)}>
                                <FontAwesomeIcon
                                    icon={faHome}
                                    className="mr-3"
                                />
                                <span className="pb-1 text-lg md:pb-0">Home</span>
                            </Link>
                        </li>
                        <li className="my-2 mr-6 md:my-0">
                            <Link href="/raffles" className={`block py-1 pl-1  no-underline align-middle border-b-2 ` +
                                (currentRoute == '/raffles' ? navSelected : navNotSelected)}>
                                <FontAwesomeIcon
                                    icon={faDice}
                                    className="mr-3"
                                />
                                <span className="pb-1 text-lg md:pb-0">Raffles</span>
                            </Link>
                        </li>
                        <li className="my-2 mr-6 md:my-0">
                            <Link href="/nft-raffles" className={`block py-1 pl-1  no-underline align-middle border-b-2  hover:text-gray-100 ` + (currentRoute == '/nft-raffles' ? navSelected : navNotSelected)}>
                                <FontAwesomeIcon
                                    icon={faFileImage}
                                    className="mr-3"
                                />
                                <span className="pb-1 text-lg md:pb-0">NFT Raffles</span>
                            </Link>
                        </li>
                        {stakingAnalysis ? (
                            <li className="my-2 mr-6 md:my-0">
                                <Link href="/staking-analysis" className={`block py-1 pl-1  no-underline align-middle border-b-2  hover:text-gray-100 ` + (currentRoute == '/staking-analysis' ? navSelected : navNotSelected)}>
                                    <FontAwesomeIcon
                                        icon={faHeartbeat}
                                        className="mr-3"
                                    />
                                    <span className="pb-1 text-lg md:pb-0">Staking Analysis</span>
                                </Link>
                            </li>
                        ) : null}
                        {faq ? (
                            <li className="my-2 mr-6 md:my-0">
                                <Link href="/faw" className={`block py-1 pl-1  no-underline align-middle border-b-2  hover:text-gray-100 ` + (currentRoute == '/faq' ? navSelected : navNotSelected)}>
                                    <FontAwesomeIcon
                                        icon={faQuestion}
                                        className="mr-3"
                                    />
                                    <span className="pb-1 text-lg md:pb-0">F.A.Q.</span>
                                </Link>
                            </li>
                        ) : null}

                    </ul>

                </div>

            </div>
        </nav>
    );
};

export default Nav
