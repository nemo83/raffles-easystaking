import Card from "./Card"

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import {
    faUsers, faDice, faDollarSign
} from "@fortawesome/free-solid-svg-icons";

import Participants from '../constants/Dashboard/participants.json'


function Dashboard({ stats }) {
    console.log(stats)

    const icons = [
        {
            title: "Jackpot",
            text: stats.jackpot[0].amount,
            icon: faDollarSign,
            iconClassName: "fas fa-2x fa-fw fa-inverse",
            iconBackground: "bg-blue-600"
        }, {
            title: "Participants",
            text: stats.raffles_participants_total,
            icon: faUsers,
            iconClassName: "fas fa-2x fa-fw fa-inverse",
            iconBackground: "bg-green-600"
        }, {
            title: "Total Raffles",
            text: stats.raffles_num_total,
            icon: faDice,
            iconClassName: "fas fa-2x",
            iconBackground: "bg-red-600"
        }, {
            title: "Total Won",
            text: stats.raffles_jackpot_total[0].amount,
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
                        text={details.text}
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