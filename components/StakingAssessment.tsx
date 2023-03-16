import { useWalletContext } from "./WalletProvider";
import StakingRewards from './StakingRewards';
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import Card from './Card';
import {
    Address,
    StakeAddress,
    Cip30Handle,
    WalletHelper
} from "@hyperionbt/helios";
import type { NextPage } from 'next'
import {
    faCoins, faSkull, faHeartPulse
} from "@fortawesome/free-solid-svg-icons";



const StakingAssessment: NextPage = (props: any) => {

    const [baseAddress, setBaseAddress] = useWalletContext()

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

    useEffect(() => {

        fetch('https://hilltop-api.mainnet.dandelion.blockwarelabs.io/epochs/current')
            .then((res) => res.json())
            .then((data) => setCurrentEpoch(data.number))
    }, [])


    async function checkStaking() {

        let walletAddres = baseAddress != null ? baseAddress : manualAddress.trim()


        if (walletAddres != null) {

            let stake: any = null;
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
                    console.log(data)
                    let delegations = data.delegations
                    delegations.sort((a, b) => a.epoch - b.epoch)
                    console.log(delegations)
                    let currentDelegation = delegations.slice(-1)[0]
                    console.log('currentDelegation: ' + JSON.stringify(currentDelegation))
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

        }

    }

    return (
        <div className="flex flex-row flex-wrap flex-grow mt-2">
            <div>
                <label className="block mb-1 text-sm font-bold text-black">
                    Wallet Address
                </label>
                <input
                    className="w-full px-1 py-2 text-black border rounded shadow appearance-none"
                    disabled={(baseAddress != null)}
                    onChange={(event) => setManualAddress(event.target.value)}
                    value={baseAddress != null ? baseAddress : manualAddress} />
                <button className={`px-4 py-2 font-bold text-white border-blue-700 rounded ` + (manualAddress || baseAddress ? "bg-blue-500 hover:bg-blue-700" : "bg-gray-300")}
                    disabled={!(manualAddress || baseAddress)}
                    onClick={() => checkStaking()}>
                    Check
                </button>
            </div>
            <Card
                key="stakepool"
                title="Stakepool"
                text={delegation.ticker ? delegation.ticker : 'N/A'}
                icon={faCoins}
                iconClassName="fas fa-2x fa-fw fa-inverse"
                iconBackground="bg-blue-600"
            /><Card
                key="stakepool-status"
                title="Stakepool Status"
                text={delegation.retiring_at_epoch ? (delegation.retiring_at_epoch < currentEpoch ? "Retired" : "Retiring") : "active"}
                icon={delegation.retiring_at_epoch ? faSkull : faHeartPulse}
                iconClassName="fas fa-2x fa-fw fa-inverse"
                iconBackground="bg-blue-600"
            />
            <StakingRewards rewards={rewards} />
        </div>

    )
}


export default StakingAssessment