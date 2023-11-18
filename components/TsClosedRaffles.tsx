import { useEffect, useState } from "react"
import {TsTable, RaffleEntry}  from "./TsTable"
import { useWalletContext } from "../components/WalletProvider";
import {
    WalletHelper,
    Cip30Wallet
  } from "@hyperionbt/helios"

const TsClosedRaffles = () => {

    const [baseAddress, setBaseAddress] = useState(null);
    const [walletHandle, setWalletHandle] = useWalletContext();
  
    useEffect(() => {
  
      const getBaseAddress = async () => {
        const baseAddress = (await new WalletHelper(new Cip30Wallet(walletHandle)).baseAddress).toBech32()
        setBaseAddress(baseAddress)
      }
      if (walletHandle) {
        getBaseAddress()
      } else {
        setBaseAddress(null)
      }
    }, [walletHandle])

    const [closedRaffles, setClosedRaffles] = useState<RaffleEntry[]>([])

// unelegible
// lost
// won-to-be-claimed 
// won-claimed => Won
// won-expired

    useEffect(() => {

        const fetchClosedRaffles = async () => {

            console.log('closed raffles baseAddress: ' + baseAddress)

            const limit = 20

            const url = baseAddress ? `https://lottery.easystaking.online/raffles/${baseAddress}?is_closed=true&limit=${limit}` : `https://lottery.easystaking.online/raffles?is_closed=true&limit=${limit}`

            fetch(url)
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
                        joined: raffle.is_joined,
                        prize_claim_expired: raffle.prize_claim_expired,
                        tx_id: raffle.tx_id,
                        winner_stake_id: raffle.winner_stake_id,
                        friendly_name: raffle.friendly_name,
                        won: raffle.won,
                        tx_status: raffle.tx_status,
                        status: raffle.status
                    }

                    return entry
                }))
                .then((data) => setClosedRaffles(data))
        }

        fetchClosedRaffles()

    }, [baseAddress])

    return (
        <TsTable entries={closedRaffles} title="Recent Closed Raffles" closed={true} base_address={baseAddress} />
    )
}

export default TsClosedRaffles