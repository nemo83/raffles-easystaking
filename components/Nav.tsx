import { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Image from 'next/image'
import toast, { Toaster } from 'react-hot-toast'
import type { NextPage } from 'next'
import {
    faHome, faDice, faQuestion, faHeartbeat, faFileImage, faWallet, faChevronDown, faChevronUp,
    faSun, faMoon
} from "@fortawesome/free-solid-svg-icons"
import {
    faSun as farSun, faMoon as farMoon
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
import { getBlockfrostKey, getBlockfrostUrl, network, origin } from '../constants/blockfrost'
import { initCardanoDAppConnectorBridge } from '../components/Eternl/cardano-dapp-connector-bridge'
import { useTheme } from "next-themes";

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

    const WALLET_NAME_KEY = "wallet-name"
    const FRIENDLY_NAME_KEY = "friendly-name"

    const [showMenu, setShowMenu] = useState(false)
    const [showSubMenu, setShowSubMenu] = useState(false)
    const [showWallets, setShowWallets] = useState(false)

    const [availableWallets, setAvailableWallets] = useState([])
    const [walletApi, setWalletApi] = useWalletContext()
    const [balance, setBalance] = useState('N/A')
    const [friendlyName, setFriendlyName] = useState('')

    const [baseAddress, setBaseAddress] = useState(null)

    const navSelected = 'text-myblue dark:text-slate-50 border-mypink dark:border-mypink'
    const navNotSelected = 'text-gray-300 border-gray-300 hover:border-mypink dark:hover:border-mypink hover:text-gray-600 hover:text-myblue dark:hover:text-slate-50'

    // Modal
    const [showModal, setShowModal] = useState(false);


    useEffect(() => {

        // Friendly Name restore
        const saveFriendlyName = localStorage.getItem(FRIENDLY_NAME_KEY)
        if (saveFriendlyName != null) {
            setFriendlyName(saveFriendlyName)
        }

        const SUPPORTED_WALLETS = ["eternl", "flint", "nami", "yoroi"]
        const aWallets = []
        const savedWalletName = localStorage.getItem(WALLET_NAME_KEY)
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

        if (!walletApi) {
            initCardanoDAppConnectorBridge(async (eternl) => {

                console.log('init dapp called')

                if (eternl.name === 'eternl') {
                    console.log('eternl!')
                    const handle: Cip30Handle = await eternl.enable();
                    const walletApi = new Cip30Wallet(handle);
                    setWalletApi(walletApi)

                } else {
                    console.log('not eternl!')
                }
            })
        }

    }, [])

    useEffect(() => {

        (async () => {

            if (walletApi) {

                const walletHelper = new WalletHelper(walletApi)
                const baseAddress = await walletHelper.baseAddress
                setBaseAddress(baseAddress.toBech32())

            } else {
                setBaseAddress(null)
            }

        })()


    }, [walletApi])

    useEffect(() => {

        const getBalance = async () => {
            if (baseAddress) {
                const isMainnet = 'mainnet' == network.toString()
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
        const walletApi = new Cip30Wallet(handle);

        setWalletApi(walletApi)

        const isReconnect = localStorage.getItem(WALLET_NAME_KEY) != null
        if (!isReconnect) {
            localStorage.setItem(WALLET_NAME_KEY, walletName)
            toast.success('Wallet correctly connected!')
        }

    }

    async function disconnect() {
        localStorage.removeItem(WALLET_NAME_KEY)
        setWalletApi(null)
    }

    async function participate() {

        if (walletApi == null) return

        localStorage.setItem(FRIENDLY_NAME_KEY, friendlyName)

        const body = JSON.stringify({ payment_address: baseAddress })

        fetch('https://lottery.easystaking.online/raffles', {
            method: 'POST',
            body: body,
            headers: {
                'Content-Type': 'application/json'
            },
        }).then((response) => {
            return new Promise((resolve) => response.json()
                .then((json) => resolve({
                    status: response.status,
                    ok: response.ok,
                    json
                })))
        }).then(({ status, ok, json }) => {

            const message = json
            switch (status) {
                case 200:
                    const numRaffles = json.length
                    toast.success(`Congrats! You joined ${numRaffles} Raflles!`)
                    break
                default:
                    console.error('Error:', message);
                    toast.error(`Error: ${message}`)
            }
        })

    }
    return (
        <nav id="header" className="fixed top-0 z-10 w-full bg-gray-100 shadow dark:bg-gray-600">

            <Toaster />

            {showModal ? (
                <>
                    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none focus:outline-none">
                        <div className="relative w-auto max-w-3xl mx-auto my-6">
                            <div className="relative flex flex-col w-full bg-white border-0 rounded-lg shadow-lg outline-none focus:outline-none">
                                <div className="flex items-start justify-between p-5 border-b border-gray-300 border-solid rounded-t ">
                                    <h3 className="text-3xl font=semibold capitalize">Join Raffles</h3>
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
                                        className="px-6 py-2 mb-1 mr-1 text-sm font-bold text-black uppercase outline-none background-transparent focus:outline-none"
                                        type="button"
                                        onClick={() => setShowModal(false)} >
                                        Close
                                    </button>
                                    <button
                                        className="px-6 py-3 mb-1 mr-1 text-sm font-bold text-white uppercase rounded shadow outline-none bg-slate-300 hover:bg-slate-400 focus:outline-none"
                                        type="button"
                                        onClick={() => { participate(); setShowModal(false) }} >
                                        Submit
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            ) : null}

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

                            <div className={`relative flex p-1` + (walletApi ? ' border-2 border-solid rounded-md divide-x-2 divide-myblue border-myblue dark:divide-white' : '')}>
                                {/* Connect */}
                                <div className={`text-myblue dark:text-slate-50 px-2 font-semibold`}>
                                    <button
                                        className={`px-3 py-2 text-sm bg-gray-300 rounded-md dropdown-toggle hover:bg-slate-50 ` + (walletApi ? 'hidden' : '')}
                                        type="button"
                                        id="menu-button"
                                        aria-expanded="true"
                                        aria-haspopup="true"
                                        onClick={() => setShowWallets(!showWallets)}
                                    >Connect wallet</button>
                                    <div className={walletApi ? ' ' : 'hidden'}>
                                        {balance} ₳
                                    </div>
                                </div>

                                <div
                                    className={`text-myblue dark:text-slate-50 font-semibold px-2 ` + (walletApi ? '' : 'hidden')}
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

                                {false ? (
                                    <div className="absolute flex flex-col w-full mt-10 origin-top-right bg-gray-200 divide-y-2 divide-white rounded-md" role="menu" aria-orientation="vertical" aria-labelledby="menu-button" tabIndex={-1} >
                                        {(currentRoute == '/raffles') ? (
                                            <div
                                                onClick={() => { setShowModal(!showModal); setShowSubMenu(!showSubMenu) }}
                                                className="w-full m-0 text-xl text-center text-black opacity-95 hover:underline hover:cursor-pointer ">
                                                Participate
                                            </div>
                                        ) : null}

                                        <div
                                            onClick={() => { disconnect(); setShowSubMenu(!showSubMenu) }}
                                            className="w-full m-0 text-xl text-center text-black opacity-95 hover:underline hover:cursor-pointer ">
                                            Disconnect
                                        </div>
                                    </div>
                                ) : null}

                            </div>

                            {walletApi && showSubMenu ? (
                                <div className="absolute top-0 right-0 z-30 min-w-full mt-12 overflow-auto bg-gray-200 rounded shadow-md">
                                    <ul >
                                        {(currentRoute == '/raffles') ? (
                                            <>
                                                <li>
                                                    <Link href="#"
                                                        className="block px-4 py-2 no-underline text-myblue hover:bg-gray-800 hover:no-underline"
                                                        onClick={() => { setShowModal(!showModal); setShowSubMenu(!showSubMenu) }}>
                                                        Participate
                                                    </Link>
                                                </li>
                                                <li>
                                                    <hr className="mx-2 border-t border-gray-400" />
                                                </li>
                                            </>
                                        ) : null}
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
