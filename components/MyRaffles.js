import { useEffect, useState } from "react"
import Table from "./Table"

function MyRaffles({ baseAddress }) {

    const [joinedRaffles, setJoinedRaffles] = useState([])

    useEffect(() => {
        fetch(`https://lottery.easystaking.online/raffles/${baseAddress}?status=joined`)
            .then((res) => res.json())
            .then((data) => data.filter(raffle => !raffle.is_closed))
            .then((openRaffles) => openRaffles.map(raffle => {
                let currency;
                console.log('raffle: ' + JSON.stringify(raffle))
                if (raffle.asset_name == null) {
                    currency = '₳'
                } else {
                    currency = `$${raffle.asset_name}`
                }
                return [raffle.epoch, `${raffle.prize} ${currency}`, `${raffle.min_stake} ₳`, raffle.num_participants, "Open"]
            }))
            .then((data) => setJoinedRaffles(data))

    }, [])

    return (
        <Table title="My Raffles" columnNames={["Epoch", "Prize", "Stake Req.", "Participants", "Status"]} rows={joinedRaffles} />
    )
}

export default MyRaffles