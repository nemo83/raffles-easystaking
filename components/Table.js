
function Table({ title, columnNames, rows, cardanoScanIndex = -1 }) {
    console.log('cscan: ' + cardanoScanIndex)
    return (
        <div className="w-full p-3">
            <div className="bg-gray-900 border border-gray-800 rounded shadow">

                <div className="p-3 border-b border-gray-800">
                    <h5 className="font-bold text-gray-600 uppercase">{title}</h5>
                </div>

                <div className="p-5">
                    <table className="w-full p-5 text-gray-700">
                        <thead>
                            <tr>
                                {columnNames.map(columnName => (
                                    <th key={columnName} className="text-left text-gray-600">{columnName}</th>
                                ))}
                            </tr>
                        </thead>

                        <tbody>

                            {rows.map((row, index) => (
                                <tr key={`r${index}`}>
                                    {row.map((col, cIndex) =>
                                        cardanoScanIndex === cIndex ? (
                                            <td key={`rc${cIndex}`}>
                                                <a href={`https://cardanoscan.io/transaction/${col}`}>
                                                    {`${col.slice(0, 6)}...${col.slice(col.length - 3)}`}
                                                </a>
                                            </td>
                                        ) : (
                                            <td key={`rc${cIndex}`}>{col}</td>
                                        )
                                    )}
                                </tr>
                            ))}

                        </tbody>
                    </table>

                </div>
            </div>

        </div>
    )
}

export default Table