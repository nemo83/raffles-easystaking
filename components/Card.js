import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import {
    faCaretUp, faWallet
} from "@fortawesome/free-solid-svg-icons";


export const Card = ({ title, text, icon }) => {
    return (
        <div className="w-full p-3 md:w-1/2 xl:w-1/3">
            <div className="p-2 bg-gray-900 border border-gray-800 rounded shadow">
                <div className="flex flex-row items-center">
                    <div className="flex-shrink pr-4">
                        <div className="p-3 bg-green-600 rounded">
                            { icon }
                        </div>
                    </div>
                    <div className="flex-1 text-right md:text-center">
                        <h5 className="font-bold text-gray-400 uppercase"> {title}</h5>
                        <h3 className="text-3xl font-bold text-gray-600"> {text} </h3>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Card