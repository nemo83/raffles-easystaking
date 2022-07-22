import Card from "./Card"

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import {
    faUsers
} from "@fortawesome/free-solid-svg-icons";


function Dashboard({ stats }) {
    console.log(stats)
    return (
        // < !--Container-- >

        <div className="container w-full pt-20 mx-auto">

            <div className="w-full px-4 mb-16 leading-normal text-gray-800 md:px-0 md:mt-8">

                <div className="flex flex-wrap">
                    {/* fas fa-users fa-2x fa-fw fa-inverse */}
                    <Card
                        title="Participants"
                        text={stats.raffles_participants_total}
                        icon={<FontAwesomeIcon icon={faUsers} className="fas fa-2x fa-fw fa-inverse" />}
                    />
                </div>
            </div>
        </div>

    )
}

export default Dashboard