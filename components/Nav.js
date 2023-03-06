import { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Image from 'next/image'
import toast, { Toaster } from 'react-hot-toast'
import {
    faHome, faDice, faQuestion, faHeartbeat
} from "@fortawesome/free-solid-svg-icons"
import { useWalletContext } from "../components/WalletProvider";
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
    Assets,
    Address,
    ByteArrayData,
    Cip30Handle,
    Cip30Wallet,
    ConstrData,
    Datum,
    hexToBytes,
    IntData,
    ListData,
    MintingPolicyHash,
    NetworkParams,
    Program,
    Value,
    TxOutput,
    Tx,
    TxId,
    UTxO,
    WalletHelper,
    ByteArray,
    PubKeyHash,
    ValidatorHash,
    CborData,
    Int
} from "@hyperionbt/helios";

export const Nav = () => {

    const stakingAnalysis = false
    const faq = false

    const router = useRouter();
    const currentRoute = router.pathname;

    const WALLET_NAME_KEY = "wallet-name"
    const FRIENDLY_NAME_KEY = "friendly-name"

    const [showWallets, setShowWallets] = useState(false)
    const [availableWallets, setAvailableWallets] = useState([])
    const [wallet, setWallet] = useState(null)
    const [baseAddress, setBaseAddress] = useWalletContext()
    const [friendlyName, setFriendlyName] = useState('')

    const navSelected = 'text-slate-50 border-slate-50 hover:border-white'
    const navNotSelected = 'text-gray-300 border-gray-300 hover:border-white'

    // Modal
    const [showModal, setShowModal] = useState(false);

    useEffect(async () => {
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

            }
        })
        setAvailableWallets(aWallets)

    }, [])

    async function connect(walletName) {
        cardano[walletName]
            .enable()
            .then(wallet => {
                setWallet(wallet)
                return wallet.getUsedAddresses()
            })
            .then(addresses => {
                const addressHex = Buffer.from(addresses[0], "hex");

                const address = BaseAddress.from_address(
                    Address.from_bytes(addressHex)
                ).to_address();

                const baseAddress = address.to_bech32();

                setBaseAddress(baseAddress)

                const isReconnect = localStorage.getItem(WALLET_NAME_KEY) != null
                if (!isReconnect) {
                    localStorage.setItem(WALLET_NAME_KEY, walletName)
                    toast.success('Wallet correctly connected!')
                }

            })

    }

    async function disconnect() {
        setWallet(null)
        setBaseAddress(null)
        localStorage.removeItem(WALLET_NAME_KEY)
    }

    async function participate() {

        if (wallet == null) return

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
            console.log('json: ' + JSON.stringify(json))
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
        <nav id="header" className="fixed top-0 z-10 w-full shadow bg-sky-600">

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

            <div className="container flex flex-wrap items-center w-full pt-3 pb-3 mx-auto mt-0 md:pb-0">

                <div className="z-20 flex-grow hidden w-full mt-2 bg-sky-600 lg:flex lg:items-center lg:w-auto lg:block lg:mt-0" id="nav-content">
                    <ul className="items-center flex-1 px-4 list-reset lg:flex md:px-0">
                        <li className="my-2 mr-6 md:my-0">
                            <Link href="/" className={`block py-1 pl-1  no-underline align-middle border-b-2  hover:text-gray-100 ` + (currentRoute == '/' ? navSelected : navNotSelected)}>
                                <FontAwesomeIcon
                                    icon={faHome}
                                    className="mr-3 text-blue-400"
                                />
                                <span className="pb-1 text-lg md:pb-0">Home</span>
                            </Link>
                        </li>
                        <li className="my-2 mr-6 md:my-0">
                            <Link href="/raffles" className={`block py-1 pl-1  no-underline align-middle border-b-2  hover:text-gray-100 ` + (currentRoute == '/raffles' ? navSelected : navNotSelected)}>
                                <FontAwesomeIcon
                                    icon={faDice}
                                    className="mr-3"
                                />
                                <span className="pb-1 text-lg md:pb-0">Raffles</span>
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

                    {wallet && baseAddress ? (
                        <span>
                            <button type='button' className='px-3 py-2 rounded-full dropdown-toggle bg-slate-300 hover:bg-slate-400'
                                alt="Click to enter all available raffleR"
                                onClick={() => disconnect()}>Disconnect</button>
                        </span>
                    ) : null}

                    {(currentRoute == '/raffles') ? (
                        <span>
                            {wallet && baseAddress ? (
                                <button type='button' className='px-3 py-2 rounded-full dropdown-toggle bg-slate-300 hover:bg-slate-400'
                                    alt="Click to enter all available raffleR"
                                    onClick={() => setShowModal(!showModal)}>Participate</button>
                            ) : (
                                <button type='button' className='px-3 py-2 rounded-full dropdown-toggle bg-slate-400'
                                    onClick={() => {
                                        toast.error("Please connect wallet!")
                                    }}
                                >Participate</button>
                            )}
                        </span>
                    ) : null}

                </div>


            </div>
        </nav>
    );
};

export default Nav