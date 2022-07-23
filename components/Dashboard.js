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
                console.log(data.jackpot[0].amount)
                setData({
                    jackpot: data.jackpot[0].amount,
                    participants: data.raffles_participants_total,
                    totalRaffles: data.raffles_num_total,
                    totalWon: data.raffles_prize_total,
                })
            })
    }, [])

    const icons = [
        {
            title: "Jackpot",
            text: "jackpot",
            icon: faDollarSign,
            iconClassName: "fas fa-2x fa-fw fa-inverse",
            iconBackground: "bg-blue-600"
        }, {
            title: "Participants",
            text: "participants",
            icon: faUsers,
            iconClassName: "fas fa-2x fa-fw fa-inverse",
            iconBackground: "bg-green-600"
        }, {
            title: "Total Raffles",
            text: "totalRaffles",
            icon: faDice,
            iconClassName: "fas fa-2x",
            iconBackground: "bg-red-600"
        }, {
            title: "Total Won",
            text: "totalWon",
            icon: faDollarSign,
            iconClassName: "fas fa-2x",
            iconBackground: "bg-blue-600"
        }
    ]


    return (
        // < !--Container-- >


        <div className="w-full px-4 mb-16 leading-normal text-gray-800 md:px-0 md:mt-8">

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