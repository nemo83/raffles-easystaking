import { useEffect, useState } from "react"
import {TsTable, RaffleEntry}  from "./TsTable"
import { useWalletContext } from "../components/WalletProvider";
import {
    WalletHelper,
    Cip30Wallet
  } from "@hyperionbt/helios"

const TsOpenRaffles = () => {

    const [baseAddress, setBaseAddress] = useState(null);
    const [walletHandle, setWalletHandle] = useWalletContext();
  
    // Raffle Modal
    const [friendlyName, setFriendlyName] = useState('')
    const [showModal, setShowModal] = useState(false);
  
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
    
    const [openRaffles, setOpenRaffles] = useState<RaffleEntry[]>([])

    useEffect(() => {

        const fetchOpenRaffles = async () => {

            console.log('open raffles baseAddress: ' + baseAddress)

            const url = baseAddress ? `https://lottery.easystaking.online/raffles/${baseAddress}?is_closed=false&limit=10` : `https://lottery.easystaking.online/raffles?is_closed=false&limit=10`

            const openRaffles = await fetch(url)
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
                    won: null,
                    tx_status: null,
                    status: raffle.status
                }

                return entry
            }));

            setOpenRaffles(openRaffles)

        }

        fetchOpenRaffles()
       
    }, [baseAddress])

    return (
        <TsTable entries={openRaffles} title="Open Raffles" closed={false} base_address={baseAddress} />
    )
}

export default TsOpenRaffles