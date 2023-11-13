import { useEffect, useState } from "react"
import {TsTable, RaffleEntry}  from "./TsTable"

const TsOpenRaffles = () => {

    const [openRaffles, setOpenRaffles] = useState<RaffleEntry[]>([])

    useEffect(() => {
        fetch('https://lottery.easystaking.online/raffles?is_closed=false')
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
                    is_closed: false,
                    prize_claim_expired: raffle.prize_claim_expired,
                    tx_id: undefined,
                    winner_stake_id: undefined
                }

                return entry
            }))
            .then((data) => setOpenRaffles(data))
    }, [])

    return (
        <TsTable entries={openRaffles} title="Open Raffles" show_status={false} />
    )
}

export default TsOpenRaffles