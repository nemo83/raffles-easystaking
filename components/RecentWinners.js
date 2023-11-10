import { useEffect, useState } from "react"
import Table from "./Table"

function RecentWinners() {

    const [data, setData] = useState([])

    function getWinningAmount(winner) {
        return winner.asset_name != null ? `${winner.winning_amount} $${winner.asset_name}` : `${winner.winning_amount} ₳`
    }

    useEffect(() => {
        fetch('https://lottery.easystaking.online/winners?limit=10')
            .then((res) => res.json())
            .then((recentWinners) => recentWinners.map(winner => [winner.epoch, winner.stake_id, winner.user_friendly_name, getWinningAmount(winner), winner.tx_id]))
            .then((data) => setData(data))
    }, [])

    return (
        <Table title="Recent Winners" columnNames={["Epoch", "Stake id", "Name", "Prize", "Tx"]} rows={data} cardanoScanIndex={4} />
    )
}

export default RecentWinners