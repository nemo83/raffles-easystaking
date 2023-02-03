import { useEffect, useState } from "react"
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

export const options = {
    responsive: true,
    plugins: {
        legend: {
            position: 'top',
        },
        title: {
            display: true,
            text: 'Rewards',
        },
    },
};


export default function StakingRewards({ rewards }) {

    const localData = {
        labels: rewards.epochs,
        datasets: [
            {
                label: '₳',
                data: rewards.amounts.map(amount => amount / 1000000),
                precision: 6,
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
            }
        ],
    }

    return (
        <div className="w-full p-3 md:w-1/2 xl:w-1/3">
            <div className="bg-gray-900 border border-gray-800 rounded shadow">
                <div className="p-3 border-b border-gray-800">
                    <h5 className="font-bold text-gray-600 uppercase">Rewards history</h5>
                </div>
                <div className="p-5">
                    <Bar options={options} data={localData} />
                </div>
            </div>

        </div>

    )

}
