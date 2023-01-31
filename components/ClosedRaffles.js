import { useEffect, useState } from "react"
import Table from "./Table"

function ClosedRaffles() {

    const [data, setData] = useState([])

    useEffect(() => {
        fetch('https://lottery.easystaking.online/raffles')
            .then((res) => res.json())
            .then((data) => data.filter(raffle => raffle.is_closed))
            .then((data) => data.slice(0, 10))
            .then((openRaffles) => openRaffles.map(raffle => {
                let currency;
                console.log('raffle: ' + JSON.stringify(raffle))
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
        <Table title="Closed Raffles" columnNames={["Epoch", "Prize", "Stake Req.", "Participants"]} rows={data} />
    )
}

export default ClosedRaffles