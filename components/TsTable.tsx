
export interface RaffleEntry {
    id: number,
    epoch: number,
    prize: string,
    min_stake: string,
    num_participants: number,
    is_closed: boolean,
    prize_claim_expired: boolean,
    tx_id: undefined|string,
    winner_stake_id: undefined|string
}

export interface TsTableData{
    entries: RaffleEntry[], 
    title: string, 
    show_status: boolean 
}

export const TsTable = ({entries, title, show_status } : TsTableData) => {

    return (
        <div className="w-full p-3">
            <div className="border border-black rounded shadow bg-sky-600">

                <div className="p-3 border-b border-black">
                    <h5 className="font-bold text-gray-300 uppercase">{title}</h5>
                </div>

                <div className="p-5">
                    <table className="w-full p-5 text-gray-300">
                        <thead>
                        <tr>
                                <th key="epoch" className="text-left text-gray-300">Epoch</th>
                                <th key="prize" className="text-left text-gray-300">Prize</th>
                                <th key="stake-req" className="text-left text-gray-300">Stake Req.</th>
                                <th key="participants" className="text-left text-gray-300">Num Participants</th>
                                { show_status ? <th key="status" className="text-left text-gray-300">Status</th> : null }
                        </tr>
                        </thead>

                        <tbody>

                            {entries.map((row, index) => (


                                    <tr key={`r${index}`} className="text-slate-50">

                                        <td key={`r-epoch-${index}`}>
                                            {row.epoch}
                                        </td>
                                        
                                        <td key={`r-prize-${index}`}>
                                            {row.prize}
                                        </td>
                                        <td key={`r-stake-req-${index}`}>
                                            {row.min_stake}
                                        </td>
                                        <td key={`r-participants-${index}`}>
                                            {row.num_participants}
                                        </td>

                                        { show_status ? <td key={`r-status-${index}`}>
                                            {row.is_closed ? 'Close' : 'Open' }
                                        </td> : null }

                                    </tr>

                                    
                            ))}

                        </tbody>
                    </table>

                </div>
            </div>

        </div>
    )
}

