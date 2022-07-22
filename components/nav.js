import Image from 'next/image';
import logo from '../img/e1r/svg/nft.svg'
import Link from 'next/link';

export const Nav = () => {

    return (
        <nav id="header" className="fixed top-0 z-10 w-full bg-gray-900 shadow">

            <div className="container flex flex-wrap items-center w-full pt-3 pb-3 mx-auto mt-0 md:pb-0">

                <div className="z-20 flex-grow hidden w-full mt-2 bg-gray-900 lg:flex lg:items-center lg:w-auto lg:block lg:mt-0"
                    id="nav-content">
                    <ul className="items-center flex-1 px-4 list-reset lg:flex md:px-0">
                        <li className="my-2 mr-6 md:my-0">
                            <a href="#"
                                className="block py-1 pl-1 text-blue-400 no-underline align-middle border-b-2 border-blue-400 md:py-3 hover:text-gray-100 hover:border-blue-400">
                                <i className="mr-3 text-blue-400 fas fa-home fa-fw"></i><span
                                    className="pb-1 text-sm md:pb-0">Home</span>
                            </a>
                        </li>
                        <li className="my-2 mr-6 md:my-0">
                            <a href="#"
                                className="block py-1 pl-1 text-gray-500 no-underline align-middle border-b-2 border-gray-900 md:py-3 hover:text-gray-100 hover:border-pink-400">
                                <i className="mr-3 fas fa-tasks fa-fw"></i><span className="pb-1 text-sm md:pb-0">Tasks</span>
                            </a>
                        </li>
                        <li className="my-2 mr-6 md:my-0">
                            <a href="#"
                                className="block py-1 pl-1 text-gray-500 no-underline align-middle border-b-2 border-gray-900 md:py-3 hover:text-gray-100 hover:border-purple-400">
                                <i className="mr-3 fa fa-envelope fa-fw"></i><span className="pb-1 text-sm md:pb-0">Messages</span>
                            </a>
                        </li>
                        <li className="my-2 mr-6 md:my-0">
                            <a href="#"
                                className="block py-1 pl-1 text-gray-500 no-underline align-middle border-b-2 border-gray-900 md:py-3 hover:text-gray-100 hover:border-green-400">
                                <i className="mr-3 fas fa-chart-area fa-fw"></i><span
                                    className="pb-1 text-sm md:pb-0">Analytics</span>
                            </a>
                        </li>
                        <li className="my-2 mr-6 md:my-0">
                            <a href="#"
                                className="block py-1 pl-1 text-gray-500 no-underline align-middle border-b-2 border-gray-900 md:py-3 hover:text-gray-100 hover:border-red-400">
                                <i className="mr-3 fa fa-wallet fa-fw"></i><span className="pb-1 text-sm md:pb-0">Payments</span>
                            </a>
                        </li>
                    </ul>

                </div>

            </div>
        </nav>
    );
};

export default Nav