import Card from "./Card"


export const Dashboard = () => {
    return (
        // < !--Container-- >
        <div className="container w-full pt-20 mx-auto">

            <div className="w-full px-4 mb-16 leading-normal text-gray-800 md:px-0 md:mt-8">


                <div className="flex flex-wrap">
                    <div className="w-full p-3 md:w-1/2 xl:w-1/3">

                        <div className="p-2 bg-gray-900 border border-gray-800 rounded shadow">
                            <div className="flex flex-row items-center">
                                <div className="flex-shrink pr-4">
                                    <div className="p-3 bg-green-600 rounded"><i
                                        className="fa fa-wallet fa-2x fa-fw fa-inverse"></i></div>
                                </div>
                                <div className="flex-1 text-right md:text-center">
                                    <h5 className="font-bold text-gray-400 uppercase">Total Revenue</h5>
                                    <h3 className="text-3xl font-bold text-gray-600">$3249 <span className="text-green-500"><i
                                        className="fas fa-caret-up"></i></span></h3>
                                </div>
                            </div>
                        </div>

                    </div>
                    <div className="w-full p-3 md:w-1/2 xl:w-1/3">

                        <div className="p-2 bg-gray-900 border border-gray-800 rounded shadow">
                            <div className="flex flex-row items-center">
                                <div className="flex-shrink pr-4">
                                    <div className="p-3 bg-pink-600 rounded"><i className="fas fa-users fa-2x fa-fw fa-inverse"></i>
                                    </div>
                                </div>
                                <div className="flex-1 text-right md:text-center">
                                    <h5 className="font-bold text-gray-400 uppercase">Total Users</h5>
                                    <h3 className="text-3xl font-bold text-gray-600">249 <span className="text-pink-500"><i
                                        className="fas fa-exchange-alt"></i></span></h3>
                                </div>
                            </div>
                        </div>

                    </div>
                    <div className="w-full p-3 md:w-1/2 xl:w-1/3">

                        <div className="p-2 bg-gray-900 border border-gray-800 rounded shadow">
                            <div className="flex flex-row items-center">
                                <div className="flex-shrink pr-4">
                                    <div className="p-3 bg-yellow-600 rounded"><i
                                        className="fas fa-user-plus fa-2x fa-fw fa-inverse"></i></div>
                                </div>
                                <div className="flex-1 text-right md:text-center">
                                    <h5 className="font-bold text-gray-400 uppercase">New Users</h5>
                                    <h3 className="text-3xl font-bold text-gray-600">2 <span className="text-yellow-600"><i
                                        className="fas fa-caret-up"></i></span></h3>
                                </div>
                            </div>
                        </div>

                    </div>
                    <div className="w-full p-3 md:w-1/2 xl:w-1/3">

                        <div className="p-2 bg-gray-900 border border-gray-800 rounded shadow">
                            <div className="flex flex-row items-center">
                                <div className="flex-shrink pr-4">
                                    <div className="p-3 bg-blue-600 rounded"><i
                                        className="fas fa-server fa-2x fa-fw fa-inverse"></i></div>
                                </div>
                                <div className="flex-1 text-right md:text-center">
                                    <h5 className="font-bold text-gray-400 uppercase">Server Uptime</h5>
                                    <h3 className="text-3xl font-bold text-gray-600">152 days</h3>
                                </div>
                            </div>
                        </div>

                    </div>
                    <div className="w-full p-3 md:w-1/2 xl:w-1/3">

                        <div className="p-2 bg-gray-900 border border-gray-800 rounded shadow">
                            <div className="flex flex-row items-center">
                                <div className="flex-shrink pr-4">
                                    <div className="p-3 bg-indigo-600 rounded"><i
                                        className="fas fa-tasks fa-2x fa-fw fa-inverse"></i></div>
                                </div>
                                <div className="flex-1 text-right md:text-center">
                                    <h5 className="font-bold text-gray-400 uppercase">To Do List</h5>
                                    <h3 className="text-3xl font-bold text-gray-600">7 tasks</h3>
                                </div>
                            </div>
                        </div>

                    </div>
                    <div className="w-full p-3 md:w-1/2 xl:w-1/3">

                        <div className="p-2 bg-gray-900 border border-gray-800 rounded shadow">
                            <div className="flex flex-row items-center">
                                <div className="flex-shrink pr-4">
                                    <div className="p-3 bg-red-600 rounded"><i className="fas fa-inbox fa-2x fa-fw fa-inverse"></i>
                                    </div>
                                </div>
                                <div className="flex-1 text-right md:text-center">
                                    <h5 className="font-bold text-gray-400 uppercase">Issues</h5>
                                    <h3 className="text-3xl font-bold text-gray-600">3 <span className="text-red-500"><i
                                        className="fas fa-caret-up"></i></span></h3>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    )
}

export default Dashboard