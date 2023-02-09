import { useEffect, useState } from "react"
import TokenCard from "./TokenCard"
import ReactMarkdown from 'react-markdown'
export const Distributions = () => {

    const [distributions, setDistributions] = useState([])
    const [distributionGroups, setDistributionGroups] = useState([])

    useEffect(() => {
        fetch('https://lottery.easystaking.online/token_distributions')
            .then((res) => res.json())
            .then((data) => {
                console.log(data)
                setDistributions(data)
                const groupedData = Array.from({ length: 2 }, () => data.splice(0, 2))
                setDistributionGroups(groupedData)
            })
    }, [])

    function trimLongDescription(description) {
        if (description.length > 300) {
            let trimmedDescription = description.slice(0, 250)
            return trimmedDescription.slice(0, trimmedDescription.lastIndexOf(' ')) + ' [...]'
        } else {
            return description
        }
    }

    return (
        <div className="px-2 m-6">
            {distributionGroups.map((group, i) =>
                <div className="flex mt-3 -mx-2" key={`key-` + i}>
                    {group.map((distribution, k) =>
                        <div className="flex w-1/2 px-2" key={`key-` + i + '-' + k}>
                            <TokenCard
                                name={distribution.title}
                                imageUrl={distribution.token_image_url}
                                description={trimLongDescription(distribution.description)}
                                amount={distribution.amount / Math.pow(10, distribution.decimals)}
                                symbol={distribution.symbol}
                                distMode={distribution.distribution_model}
                                minStakeAmount={distribution.min_stake_required}
                            >
                                <ReactMarkdown className="mb-4 text-sm text-gray-700">{trimLongDescription(distribution.description)}</ReactMarkdown>
                            </TokenCard>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default TokenCard