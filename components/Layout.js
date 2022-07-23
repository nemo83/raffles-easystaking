import Nav from './Nav'
import Table from './Table'
import Dashboard from './Dashboard'
import { useEffect } from 'react';

function Layout() {

    useEffect(() => {
        document.body.classList.add("bg-black-alt");
        document.body.classList.add("font-sans");
        document.body.classList.add("leading-normal");
        document.body.classList.add("tracking-normal");
    });

    // const openRafflesRows = openRaffles.map(raffle => [raffle.epoch, `${raffle.prize} ₳`, `${raffle.min_stake} ₳`, raffle.num_participants])

    // const openRafflesData = {
    //     title: "Open Raffles",
    //     columnNames: ["Epoch", "Prize", "Stake Req.", "Participants"],
    //     rows: openRafflesRows
    // }

    // const closeRafflesRows = closedRaffles.map(raffle => [raffle.epoch, `${raffle.prize} ₳`, `${raffle.min_stake} ₳`, raffle.num_participants])

    // const closedRafflesData = {
    //     title: "Closed Raffles",
    //     columnNames: ["Epoch", "Prize", "Stake Req.", "Participants"],
    //     rows: closeRafflesRows
    // }

    // function getWinningAmount(winner) {
    //     return winner.asset_name != null ? `${winner.winning_amount} $${winner.asset_name}` : `${winner.winning_amount} ₳`
    // }

    // const recentWinnersRows = recentWinners.map(winner => [winner.epoch, winner.stake_id, winner.user_friendly_name, getWinningAmount(winner), winner.tx_id])

    // const recentWinnersData = {
    //     title: "Recent Winners",
    //     columnNames: ["Epoch", "Stake id", "Name", "Prize", "Tx"],
    //     rows: recentWinnersRows
    // }

    return (
        <>
            <Nav />
            <div className="container w-full pt-20 mx-auto">

                <Dashboard />
                {/* <Table title={openRafflesData.title} columnNames={openRafflesData.columnNames} rows={openRafflesData.rows} />
                <Table title={recentWinnersData.title} columnNames={recentWinnersData.columnNames} rows={recentWinnersData.rows} cardanoScanIndex={4} />
                <Table title={closedRafflesData.title} columnNames={closedRafflesData.columnNames} rows={closedRafflesData.rows} /> */}
            </div>
        </>
    )
}

export default Layout