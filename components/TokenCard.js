import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Image from 'next/image';
import {
    faCaretUp, faWallet
} from "@fortawesome/free-solid-svg-icons";


export const TokenCard = ({ children, name, imageUrl, description, amount, symbol, distMode, minStakeAmount }) => {

    let distModeDescription;
    switch (distMode) {
        case 0:
            distModeDescription = 'per delegate'
            break;
        case 1:
            distModeDescription = 'N/A'
            break;
        case 2:
            distModeDescription = 'split by stake amount'
            break;
        default:
            distModeDescription = 'N/A'
    }


    return (
        <div className="flex justify-center">
            <div className="flex flex-col bg-white rounded-lg shadow-lg md:flex-row md:max-w-xl">
                <img
                    className="object-cover w-full rounded-t-lg h-96 md:h-auto md:w-48 md:rounded-none md:rounded-l-lg"
                    src={imageUrl}
                    alt="" />
                <div className="flex flex-col justify-start p-6">
                    <h5 className="mb-2 text-xl font-medium text-gray-900">{name}</h5>
                    {children}
                    <p className="mb-4 text-base text-gray-700">
                        <span className='font-bold'> {amount} ${symbol}</span> {distModeDescription}
                    </p>
                    {minStakeAmount ?
                        <p className="text-xs text-gray-600"> {minStakeAmount / 1000000} ₳ min stake required</p>
                        : null
                    }
                </div>
            </div>
        </div>
    )
}

export default TokenCard