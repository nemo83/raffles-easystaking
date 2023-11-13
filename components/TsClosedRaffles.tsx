import { useEffect, useState } from "react"
import {TsTable, RaffleEntry}  from "./TsTable"

const TsClosedRaffles = () => {

    const [closedRaffles, setClosedRaffles] = useState<RaffleEntry[]>([])

    useEffect(() => {
        fetch('https://lottery.easystaking.online/raffles?is_closed=true&limit=10')
            .then((res) => res.json())
            .then((openRaffles) => openRaffles.map(raffle => {
                let currency;
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
                    is_closed: true,
                    prize_claim_expired: raffle.prize_claim_expired,
                    tx_id: undefined,
                    winner_stake_id: undefined
                }

                return entry
            }))
            .then((data) => setClosedRaffles(data))
    }, [])

    return (
        <TsTable entries={closedRaffles} title="Closed Raffles" show_status={true} />
    )
}

export default TsClosedRaffles