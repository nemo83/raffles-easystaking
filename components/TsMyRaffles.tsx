import { useEffect, useState } from "react"
import {TsTable, RaffleEntry}  from "./TsTable"

export interface TsMyRafflesData {
    baseAddress: string
}

const TsMyRaffles = ({baseAddress}:TsMyRafflesData  ) => {

    const [joinedRaffles, setJoinedRaffles] = useState<RaffleEntry[]>([])

    useEffect(() => {
        fetch(`https://lottery.easystaking.online/raffles/${baseAddress}?status=joined`)
            .then((res) => res.json())
            .then((data) => data.filter(raffle => !raffle.is_closed))
            .then((openRaffles) => openRaffles.map(raffle => {
                let currency: string;
                if (raffle.asset_name == null) {
                    currency = '₳'
                } else {
                    currency = `$${raffle.asset_name}`
                }

                const entry: RaffleEntry = {
                    id: raffle.id,
                    epoch: raffle.epoch,
                    prize: `${raffle.prize} ${currency}`,
                    min_stake: `${raffle.min_stake} ₳`,
                    num_participants: raffle.num_participants,
                    is_closed: false,
                    prize_claim_expired: raffle.prize_claim_expired,
                    tx_id: undefined,
                    winner_stake_id: undefined
                }

                return entry
            }))
            .then((data) => setJoinedRaffles(data))

    }, [])

    return (
        <TsTable entries={joinedRaffles} title="My Raffles" show_status={true} />
    )
}

export default TsMyRaffles
