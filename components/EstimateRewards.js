import {
    Address,
    Cip30Wallet,
    StakeAddress,
    WalletHelper
} from "@hyperionbt/helios";
import { useWalletContext } from "./WalletProvider";
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import Card from './Card';

import {
    faCoins, faSkull, faHeartPulse
} from "@fortawesome/free-solid-svg-icons";


export default function EstimateRewards() {

    const [walletHandle, setWalletHandle] = useWalletContext()

    const [baseAddress, setBaseAddress] = useState(null)

    const [manualAddress, setManualAddress] = useState('')

    const [currentEpoch, setCurrentEpoch] = useState(null)

    const [delegation, setDelegation] = useState({
        ticker: null,
        name: null,
        description: null,
        homepage: null,
        cost: null,
        margin: null,
        pledge: null,
        saturation: null,
        retiring_at_epoch: null,
    })

    const [rewards, setRewards] = useState({
        'epochs': [],
        'amounts': [],
    })

    const [extraRewards, setExtraRewards] = useState([])

    useEffect(() => {
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

    useEffect(() => {
        fetch('https://hilltop-api.mainnet.dandelion.blockwarelabs.io/epochs/current')
            .then((res) => res.json())
            .then((data) => setCurrentEpoch(data.number))
    }, [])

    useEffect(() => {
        if (!baseAddress) {
            setDelegation({
                ticker: null,
                name: null,
                description: null,
                homepage: null,
                cost: null,
                margin: null,
                pledge: null,
                saturation: null,
                retiring_at_epoch: null,
            })
            setManualAddress('')
            setExtraRewards([])
        }
    }, [baseAddress])


    async function checkStaking() {

        let walletAddres = baseAddress != null ? baseAddress : manualAddress.trim()


        if (walletAddres != null) {

            let stake = null;
            if (walletAddres.startsWith('addr1')) {
                //https://github.com/Emurgo/cardano-serialization-lib/issues/337
                const address = Address.fromBech32(walletAddres);
                const stakeAddress = StakeAddress.fromAddress(address)
                stake = stakeAddress.toBech32()
            } else if (walletAddres.startsWith('stake1')) {
                stake = StakeAddress.fromBech32(walletAddres).toBech32()
            } else {
                toast.error('Unrecognized address format\nPlease enter either a receiving address (addr1..) or\nreward address (stake1..)')
                return
            }

            fetch('https://hilltop-api.mainnet.dandelion.blockwarelabs.io/rewards/' + stake)
                .then((res) => res.json())
                .then((data) => {
                    data.sort((a, b) => a.epoch - b.epoch)
                    let lastRewards = data.slice(-10)
                    let epochs = lastRewards.map(r => r.epoch)
                    let amounts = lastRewards.map(r => r.amount)
                    setRewards({ epochs, amounts })
                })

            fetch('https://hilltop-api.mainnet.dandelion.blockwarelabs.io/delegations/' + stake + '/stakepool')
                .then((res) => res.json())
                .then((data) => {
                    let delegations = data.delegations
                    delegations.sort((a, b) => a.epoch - b.epoch)
                    let currentDelegation = delegations.slice(-1)[0]
                    setDelegation({
                        ticker: currentDelegation.stakepool.metadata.ticker,
                        name: currentDelegation.stakepool.metadata.name,
                        description: currentDelegation.stakepool.metadata.description,
                        homepage: currentDelegation.stakepool.metadata.homepage,
                        cost: currentDelegation.stakepool.cost,
                        margin: currentDelegation.stakepool.margin,
                        pledge: currentDelegation.stakepool.pledge,
                        saturation: currentDelegation.stakepool.saturation,
                        retiring_at_epoch: currentDelegation.stakepool.retiring_at_epoch,
                    })
                })

            fetch('https://lottery.easystaking.online/extra_rewards?staking_address=' + stake)
                .then((res) => res.json())
                .then((data) => {
                    if (data.length == 0) {
                        toast.error('Could not find Extra Rewards for the given StakingAddress\nDo you have enough $ada?')
                    }
                    setExtraRewards(data)
                })

        }

    }

    return (
        <div className="my-6">
            <div className='flex'>
                <input
                    className="w-full text-black border rounded shadow appearance-none"
                    placeholder='Wallet Address'
                    disabled={(baseAddress != null)}
                    onChange={(event) => setManualAddress(event.target.value)}
                    value={baseAddress != null ? baseAddress : manualAddress} />
                <button className={`px-4 py-2 font-bold text-white border-blue-700 rounded ` + (manualAddress || baseAddress ? "bg-blue-500 hover:bg-blue-700" : "bg-gray-300")}
                    disabled={!(manualAddress || baseAddress)}
                    onClick={() => checkStaking()}>
                    Check
                </button>
            </div>
            <div hidden>
                <Card
                    key="stakepool"
                    title="Stakepool"
                    text={delegation.ticker ? delegation.ticker : 'N/A'}
                    icon={faCoins}
                    iconClassName="fas fa-2x fa-fw fa-inverse"
                    iconBackground="bg-blue-600"
                />
                <Card
                    key="stakepool-status"
                    title="Stakepool Status"
                    text={delegation.retiring_at_epoch ? (delegation.retiring_at_epoch < currentEpoch ? "Retired" : "Retiring") : "active"}
                    icon={delegation.retiring_at_epoch ? faSkull : faHeartPulse}
                    iconClassName="fas fa-2x fa-fw fa-inverse"
                    iconBackground="bg-blue-600"
                />
            </div>
            {extraRewards.length > 0 ? (
                <div className="flex flex-col my-6">
                    <div className="overflow-x-auto bg-white rounded-lg shadow-lg">
                        <div className="inline-block min-w-full">
                            <div className="overflow-hidden">
                                <table className="min-w-full">
                                    <thead className="border-b">
                                        <tr>
                                            <th scope="col" className="px-6 py-4 text-sm font-medium text-center text-gray-900">
                                                Logo
                                            </th>
                                            <th scope="col" className="px-6 py-4 text-sm font-medium text-left text-gray-900">
                                                Amount (estimated)
                                            </th>
                                            <th scope="col" className="px-6 py-4 text-sm font-medium text-left text-gray-900">
                                                ₳ value (estimated)
                                            </th>
                                            <th scope="col" className="px-6 py-4 text-sm font-medium text-left text-gray-900">
                                                Min epoch
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {extraRewards.map((extraReward, i) =>
                                            <tr className="bg-white border-b" key={`rwd-` + i}>
                                                <td className="px-6 py-4 text-gray-900 whitespace-nowrap">
                                                    <img
                                                        src={extraReward.logo}
                                                        className="w-16 m-auto rounded-full"
                                                        alt="Hosky Token"
                                                    />
                                                </td>
                                                <td className="px-6 py-4 text-sm font-light text-gray-900 whitespace-nowrap">
                                                    {Number.isInteger(extraReward.amount) ? extraReward.amount : parseFloat(extraReward.amount).toFixed(2)} ${extraReward.symbol}
                                                </td>
                                                <td className="px-6 py-4 text-sm font-light text-gray-900 whitespace-nowrap">
                                                    {parseFloat(extraReward.estimated_value_in_ada).toFixed(2)} ₳
                                                </td>
                                                <td className="px-6 py-4 text-sm font-light text-gray-900 whitespace-nowrap">
                                                    {extraReward.min_age}
                                                </td>
                                            </tr>
                                        )}

                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            ) : null}

        </div>

    )
}
