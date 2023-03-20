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
                // const groupedData = Array.from({ length: 2 }, () => data.splice(0, 2))
                // setDistributionGroups(groupedData)
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
        <a name="distributions">
            <div className="flex flex-wrap">
                {distributions.map((distribution, i) =>
                    <div className="w-full px-2 mt-3 lg:w-1/2" key={i}>
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
        </a>
    )
}

export default TokenCard