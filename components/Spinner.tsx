const Spinner = () => {
    return <div className="fixed top-0 bottom-0 left-0 right-0 z-50 flex flex-col items-center justify-center w-full h-screen overflow-hidden bg-gray-700 opacity-75">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
        <h2 className="text-xl font-semibold text-center text-white">Building transaction...</h2>
        <p className="w-1/3 text-center text-white">This may take a few seconds</p>
    </div>
}

export default Spinner