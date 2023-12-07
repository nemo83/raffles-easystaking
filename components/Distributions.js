import { useEffect, useState } from "react"
import TokenCard from "./TokenCard"
import ReactMarkdown from 'react-markdown'
export const Distributions = () => {

    const [distributions, setDistributions] = useState([])
    const [distributionGroups, setDistributionGroups] = useState([])

    useEffect(() => {
        fetch('https://lottery.easystaking.online/token_distributions?meme_last=true')
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
      <div>
        <div className="flex flex-wrap" id="distributions">
          {distributions.map((distribution, i) => (
            <div className="w-full my-3 xl:px-2 xl:w-1/2" key={i}>
              <TokenCard
                name={distribution.title}
                imageUrl={distribution.token_image_url}
                description={trimLongDescription(distribution.description)}
                amount={
                  distribution.amount / Math.pow(10, distribution.decimals)
                }
                symbol={distribution.symbol}
                distMode={distribution.distribution_model}
                minStakeAmount={distribution.min_stake_required}
              >
                <ReactMarkdown>
                  {trimLongDescription(distribution.description)}
                </ReactMarkdown>
              </TokenCard>
            </div>
          ))}
        </div>
      </div>
    );
}

export default TokenCard