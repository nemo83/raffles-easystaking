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
                    joined: raffle.is_joined,
                    prize_claim_expired: raffle.prize_claim_expired,
                    tx_id: raffle.tx_id,
                    winner_stake_id: raffle.winner_stake_id,
                    friendly_name: raffle.friendly_name,
                    won: null,
                    tx_status: null,
                    status: raffle.status
                }

                return entry
            }))
            .then((data) => setJoinedRaffles(data))

    }, [])

    return (
        <TsTable entries={joinedRaffles} title="My Raffles" closed={false} />
    )
}

export default TsMyRaffles
