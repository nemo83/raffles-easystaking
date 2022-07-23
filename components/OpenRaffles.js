import { useEffect, useState } from "react"
import Table from "./Table"

function OpenRaffles() {

    const [data, setData] = useState([])

    useEffect(() => {
        fetch('https://lottery.easystaking.online/raffles')
            .then((res) => res.json())
            .then((data) => data.filter(raffle => !raffle.is_closed))
            .then((openRaffles) => openRaffles.map(raffle => [raffle.epoch, `${raffle.prize} ₳`, `${raffle.min_stake} ₳`, raffle.num_participants]))
            .then((data) => setData(data))
    }, [])

    return (
        <Table title="Open Raffles" columnNames={["Epoch", "Prize", "Stake Req.", "Participants"]} rows={data} />
    )
}

export default OpenRaffles