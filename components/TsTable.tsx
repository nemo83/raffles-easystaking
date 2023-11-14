import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck} from "@fortawesome/free-solid-svg-icons"


export interface RaffleEntry {
    id: number,
    epoch: number,
    prize: string,
    min_stake: string,
    num_participants: number,
    joined: boolean,
    prize_claim_expired: boolean,
    tx_id: undefined|string,
    winner_stake_id: undefined|string,
    friendly_name: undefined|string,
    won: undefined|boolean,
    tx_status: undefined|string,
    status: undefined|string
}

export interface TsTableData{
    entries: RaffleEntry[], 
    title: string,
    closed: boolean
}

export const TsTable = ({entries, title, closed } : TsTableData) => {

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
                                
                                { closed ? 
                                <>
                                
                                    <th key="stake-id" className="text-left text-gray-300">Winner</th>
                                </>
                                :
                                <>
                                <th key="stake-req" className="text-left text-gray-300">Stake Req.</th>
                                <th key="participants" className="text-left text-gray-300">Num Participants</th>
                                
                                </>
                                }
                                <th key="prize" className="text-left text-gray-300">Prize</th>

                                { closed ? 
                                <>
                                <th key="tx" className="text-left text-gray-300">Tx</th>
                                <th key="status" className="text-left text-gray-300">Status</th>
                                </>
                                : <th key="status" className="text-left text-gray-300">Joined</th> }
                                 
                        </tr>
                        </thead>

                        <tbody>

                            {entries.map((row, index) => (


                                    <tr key={`r${index}`} className="text-slate-50">

                                        <td key={`r-epoch-${index}`}>
                                            {row.epoch}
                                        </td>
                                        
                                        
                                        { closed ? 
                                        <>
                                        {/* either stake, friendly name or adahandle */}
                                        <td key={`r-winner-stake-id-${index}`}>
                                            {row.winner_stake_id ? row.winner_stake_id.slice(0, 12) : ''}
                                        </td>
                                        
                                        </>
                                        :
                                        <>
                                        <td key={`r-stake-req-${index}`}>
                                            {row.min_stake}
                                        </td>
                                        <td key={`r-participants-${index}`}>
                                            {row.num_participants}
                                        </td>
                                        </>
                                        }

                                        <td key={`r-prize-${index}`}>
                                            {row.prize}
                                        </td>

                                        { closed ? 
                                        
                                        <>
                                        <td key={`r-tx${index}`}>
                                            <a href={`https://cardanoscan.io/transaction/${row.tx_id}`}>
                                                {row.tx_id ? `${row.tx_id.slice(0, 6)}...${row.tx_id.slice(row.tx_id.length - 3)}` : ""}
                                            </a>
                                        </td>
                                        <td key={`r-status-${index}`}>
                                            {row.status}
                                        </td>
                                        </>

                                        : <td key={`r-joined-${index}`}>
                                            {row.joined ? <FontAwesomeIcon
                                            icon={faCheck}
                                            className="mr-3"
                                        /> : null}
                                        </td>}


                                    </tr>

                                    
                            ))}

                        </tbody>
                    </table>

                </div>
            </div>

        </div>
    )
}

