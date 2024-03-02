import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import {
    faCaretUp, faWallet
} from "@fortawesome/free-solid-svg-icons";


export const Card = ({ title, text, icon, iconClassName, iconBackground }) => {
    return (
        <div className="w-full p-3 md:w-1/2 xl:w-1/4">
            <div className="p-2 border rounded shadow border-pink bg-white">
                <div className="flex flex-row items-center">
                    <div className="flex-shrink pr-4">
                        <div className={`p-3 rounded ${iconBackground}`}>
                            <FontAwesomeIcon
                                icon={icon}
                                className={iconClassName}
                            />
                        </div>
                    </div>
                    <div className="flex items-center flex-col flex-1 text-right md:text-left">
                        <h5 className="font-bold text-mypink uppercase"> {title}</h5>
                        <h3 className="text-2xl font-bold text-black-50"> {text} </h3>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Card