export default function TextTile({ children, title }) {

    return (
        <div className="w-full p-3 md:w-1/2 xl:w-1/3">

            <div className="border border-black rounded shadow bg-sky-600">
                <div className="p-3 border-b border-black">
                    <h5 className="font-bold uppercase text-grey-300">{title}</h5>
                </div>
                <div className="p-5 text-slate-50">
                    {children}
                </div>
            </div>

        </div>
    )

}
