

export const Card = () => {
    return (
        <div className="p-2 bg-gray-900 border border-gray-800 rounded shadow">
            <div className="flex flex-row items-center">
                <div className="flex-shrink pr-4">
                    <div className="p-3 bg-pink-600 rounded"><i className="fas fa-users fa-2x fa-fw fa-inverse"></i></div>
                </div>
                <div className="flex-1 text-right md:text-center">
                    <h5 className="font-bold text-gray-400 uppercase">Titolo</h5>
                    <h3 className="text-3xl font-bold text-gray-600">249 <span className="text-pink-500"><i className="fas fa-exchange-alt"></i></span></h3>
                </div>
            </div>
        </div>
    )
}

export default Card