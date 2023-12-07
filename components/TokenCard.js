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
        <div className="flex justify-center h-full">
            <div class="flex flex-col items-center bg-white border border-gray-200 rounded-lg shadow md:flex-row md:max-w-xl hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 gap-3">
                <img
                    className="object-cover w-full rounded-t-lg h-96 md:h-auto md:w-48 md:rounded-none md:rounded-s-lg flex-1 ml-4"
                    src={imageUrl}
                    alt=""
                />
                <div class="flex flex-col justify-between p-4 leading-normal flex-2">
                    <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white mb-4">
                        {name}
                    </h5>
                    {children}
                    <p className="my-4">
                        Here are the biggest enterprise technology acquisitions of 2021 so
                        far, in reverse chronological order.
                    </p>
                    <p className="my-4">
                        <span className="font-bold text-mypink">
                            {" "}
                            {amount} ${symbol}
                        </span>{" "}
                        {distModeDescription}
                    </p>
                    {minStakeAmount ? (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {" "}
                            {minStakeAmount / 1000000} ₳ min stake required
                        </p>
                    ) : null}
                </div>
            </div>
        </div>
    );
}

export default TokenCard