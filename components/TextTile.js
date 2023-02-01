export default function TextTile({ children, title}) {

    return (
        <div className="w-full p-3 md:w-1/2 xl:w-1/3">

            <div className="bg-gray-900 border border-gray-800 rounded shadow">
                <div className="p-3 border-b border-gray-800">
                    <h5 className="font-bold text-gray-600 uppercase">{title}</h5>
                </div>
                <div className="p-5 text-gray-400">
                    {children}
                </div>
            </div>

        </div>
    )

}
