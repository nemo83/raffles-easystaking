import { useEffect, useState } from "react"
import Table from "./Table"

function OpenRaffles() {

    const [data, setData] = useState([])

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
                return [raffle.epoch, `${raffle.prize} ${currency}`, `${raffle.min_stake} ₳`, raffle.num_participants]
            }))
            .then((data) => setData(data))
    }, [])

    return (
        <Table title="Open Raffles" columnNames={["Epoch", "Prize", "Stake Req.", "Participants"]} rows={data} />
    )
}

export default OpenRaffles