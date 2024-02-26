import { useState, useEffect } from "react";
import Card from "./Card"

import {
    faUsers, faDice, faDollarSign
} from "@fortawesome/free-solid-svg-icons";

import Participants from '../constants/Dashboard/participants.json'


function Dashboard() {

    const [data, setData] = useState({
        jackpot: "",
        participants: "",
        totalRaffles: "",
        totalWon: "",
    })

    useEffect(() => {

        fetch('https://lottery.easystaking.online/raffles/stats')
            .then((res) => res.json())
            .then((data) => {
                
                setData({
                    jackpot: parseFloat(data.current_jackpot).toFixed(2) + ' ₳',
                    participants: data.raffles_participants_total,
                    totalRaffles: data.raffles_num_total,
                    totalWon: parseFloat(data.raffles_prize_all_token_total).toFixed(2) + ' ₳',
                })
            })
    }, [])

    const icons = [
        {
            title: "Jackpot",
            text: "jackpot",
            icon: faDollarSign,
            iconClassName: "fas fa-2x fa-fw fa-inverse",
            iconBackground: "bg-mypink"
        }, {
            title: "Participants",
            text: "participants",
            icon: faUsers,
            iconClassName: "fas fa-2x fa-fw fa-inverse",
            iconBackground: "bg-mypink"
        }, {
            title: "Total Raffles",
            text: "totalRaffles",
            icon: faDice,
            iconClassName: "fas fa-2x",
            iconBackground: "bg-mypink text-white"
        }, {
            title: "Total Won",
            text: "totalWon",
            icon: faDollarSign,
            iconClassName: "fas fa-2x",
            iconBackground: "bg-mypink text-white min-w-8"
        }
    ]


    return (
        // < !--Container-- >


        <div className="w-full px-4 mb-16 leading-normal md:px-0 md:mt-8">

            <div className="flex flex-wrap">
                {icons.map(details => (
                    <Card
                        key={details.title}
                        title={details.title}
                        text={data[details.text]}
                        icon={details.icon}
                        iconClassName={details.iconClassName}
                        iconBackground={details.iconBackground}
                    />
                ))}
            </div>

        </div>


    )
}

export default Dashboard