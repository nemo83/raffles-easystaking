import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import Spinner from "../components/Spinner";
import { useEffect, useState } from "react";
import { useWalletContext } from "../components/WalletProvider";
import Link from "next/link";
import { Tx, WalletHelper, Cip30Wallet } from "@hyperionbt/helios";
import { toast } from "react-hot-toast";

export interface RaffleEntry {
  id: number;
  epoch: number;
  prize: string;
  min_stake: string;
  num_participants: number;
  joined: boolean;
  prize_claim_expired: boolean;
  tx_id: undefined | string;
  winner_stake_id: undefined | string;
  friendly_name: undefined | string;
  won: undefined | boolean;
  tx_status: undefined | string;
  status: undefined | string;
}

export interface TsTableData {
  entries: RaffleEntry[];
  title: string;
  closed: boolean;
  base_address: undefined | string;
}

export const TsTable = ({
  entries,
  title,
  closed,
  base_address,
}: TsTableData) => {
  const [showModal, setShowModal] = useState(false);
  const [showSpinner, setShowSpinner] = useState(false);

  const [txHash, setTxHash] = useState<undefined | string>(null);
  const [prize, setPrize] = useState<undefined | string>(null);

  const [raffles, setRaffles] = useState<RaffleEntry[]>(entries);

  const [walletHandle, setWalletHandle] = useWalletContext();

  const raffleWonTweet = `📢 I just won ${prize}!

Delegate to EASY1 Stake Pool and enjoy: 

✅ Low fee
✅ Extra Token Airdrop
✅ Raffles every 5 days (epoch)

Find out more at easy1staking.com

@CryptoJoe101`;

  useEffect(() => {
    setRaffles(entries);
  }, [entries]);

  const collectPrize = async (raffle_id: number) => {
    console.log("raffle id: " + raffle_id);

    const url = `https://lottery.easystaking.online/raffles/${raffle_id}/claim_prize`;

    const body = JSON.stringify({
      payment_address: base_address,
    });

    setShowSpinner(true);

    let resp = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        accept: "application/json",
      },
      body,
    });

    setShowSpinner(false);

    if (resp?.status == 200) {
      let body = await resp.json();
      console.log("nft details: " + JSON.stringify(body));

      let currency;
      if (body.asset_name == null) {
        currency = "₳";
      } else {
        currency = `$${body.asset_name}`;
      }

      let prize = `${body.prize} ${currency}`;

      if (body.already_submitted) {
        console.log("Already submitted! Share on twitter");
        setTxHash(body.tx_id);
        setPrize(prize);
        setShowModal(true);
      } else {
        console.log("To be signed and submitted");
        const tx = Tx.fromCbor(body.transaction_cbor);
        try {
          const signatures = await new Cip30Wallet(walletHandle).signTx(tx);
          tx.addSignatures(signatures);
          const txHash = await new Cip30Wallet(walletHandle).submitTx(tx);
          setTxHash(txHash.hex);
          setPrize(prize);
          setShowModal(true);
        } catch (error) {
          toast.error(
            "There was an error processing the transaction.\nTry again in a few minutes"
          );
        }
      }

      const newRaffles = raffles.slice();
      const index = newRaffles.findIndex((entry) => entry.id == raffle_id);
      entries[index].status = "pending";
      entries[index].tx_id = body.tx_id;
      setRaffles(newRaffles);
    } else {
      toast.error(
        "Error while creating collection Prize Transaction.\nPlease contact an Admin"
      );
    }
  };

  return (
    <>
      {/* Modal */}
      <div
        className={
          `fixed inset-0 z-50 items-center justify-center overflow-x-hidden overflow-y-auto outline-none focus:outline-none ` +
          (showModal ? " flex " : " hidden ")
        }
      >
        <div className="relative w-auto max-w-3xl mx-auto my-6">
          <div className="relative flex flex-col w-full bg-white border-0 rounded-lg shadow-lg outline-none focus:outline-none">
            <div className="flex items-start justify-between p-5 text-black border-b border-gray-300 border-solid rounded-t">
              <h3 className="text-3xl font-semibold capitalize">
                Congratulations!
              </h3>
              <button
                className="float-right text-black bg-transparent border-0"
                onClick={() => setShowModal(false)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="relative flex-auto p-6">
              <form className="w-full px-8 pt-6 pb-8 bg-gray-200 rounded shadow-md">
                <div className="flex justify-center">
                  <div className="mb-3 xl:w-96">
                    <p className="text-xl text-black text-center mb-2">
                      The {prize} prize is on its way!
                    </p>
                    <p className="text-center">
                      <span className="text-black">See on cardanoscan </span>
                      <a
                        className="text-blue-500"
                        href={`https://cardanoscan.io/transaction/${txHash}`}
                      >
                        {txHash
                          ? `${txHash.slice(0, 6)}...${txHash.slice(
                              txHash.length - 3
                            )}`
                          : null}
                      </a>
                    </p>
                  </div>
                </div>
              </form>
            </div>
            <div className="flex items-center justify-end p-6 border-t border-solid rounded-b border-blueGray-200">
              <button
                className="px-6 py-2 mb-1 mr-1 text-sm font-bold text-black uppercase outline-none background-transparent focus:outline-none"
                type="button"
                onClick={() => setShowModal(false)}
              >
                Close
              </button>
              <Link
                className="inline-block py-3 mb-2 text-sm font-medium leading-snug text-slate-100 uppercase transition duration-150 ease-in-out bg-blue-600 rounded px-7 hover:text-blue-700 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none focus:ring-0 active:bg-gray-200"
                href={`https://twitter.com/intent/tweet?text=${encodeURI(
                  raffleWonTweet
                )}&hashtags=Cardano,Staking,EASY1,NFT`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="flex">
                  Share&nbsp;
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 512 512"
                    className="w-4 h-4 fill-current"
                  >
                    <path d="M459.37 151.716c.325 4.548.325 9.097.325 13.645 0 138.72-105.583 298.558-298.558 298.558-59.452 0-114.68-17.219-161.137-47.106 8.447.974 16.568 1.299 25.34 1.299 49.055 0 94.213-16.568 130.274-44.832-46.132-.975-84.792-31.188-98.112-72.772 6.498.974 12.995 1.624 19.818 1.624 9.421 0 18.843-1.3 27.614-3.573-48.081-9.747-84.143-51.98-84.143-102.985v-1.299c13.969 7.797 30.214 12.67 47.431 13.319-28.264-18.843-46.781-51.005-46.781-87.391 0-19.492 5.197-37.36 14.294-52.954 51.655 63.675 129.3 105.258 216.365 109.807-1.624-7.797-2.599-15.918-2.599-24.04 0-57.828 46.782-104.934 104.934-104.934 30.213 0 57.502 12.67 76.67 33.137 23.715-4.548 46.456-13.32 66.599-25.34-7.798 24.366-24.366 44.833-46.132 57.827 21.117-2.273 41.584-8.122 60.426-16.243-14.292 20.791-32.161 39.308-52.628 54.253z" />
                  </svg>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {showSpinner ? <Spinner /> : null}

      <div className="w-full p-3">
        <div className="border border-black rounded shadow bg-white">
          <div className="p-3 border-b border-black">
            <h5 className="font-bold text-mypink uppercase">{title}</h5>
          </div>

          <div className="p-5">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    key="epoch"
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Epoch
                  </th>

                  {closed ? (
                    <>
                      <th
                        key="stake-id"
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Winner
                      </th>
                    </>
                  ) : (
                    <>
                      <th
                        key="stake-req"
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Stake Req.
                      </th>
                      <th
                        key="participants"
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Num Participants
                      </th>
                    </>
                  )}
                  <th
                    key="prize"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Prize
                  </th>

                  {closed ? (
                    <>
                      <th
                        key="tx"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Tx
                      </th>
                      <th
                        key="status"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Status
                      </th>
                    </>
                  ) : (
                    <th
                      key="status"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Joined
                    </th>
                  )}
                </tr>
              </thead>
              {/* Add tbody here */}

              <tbody className="bg-white divide-y divide-gray-200">
                {raffles.map((row, index) => (
                  <tr key={`r${index}`} className="text-slate-50">
                    <td
                      key={`r-epoch-${index}`}
                      className="px-6 py-4 whitespace-nowrap text-black hover:text-indigo-900"
                    >
                      {row.epoch}
                    </td>

                    {closed ? (
                      <>
                        {/* either stake, friendly name or adahandle */}
                        <td
                          key={`r-epoch-${index}`}
                          className="px-6 py-4 whitespace-nowrap"
                        >
                          <a
                            className="text-black hover:text-indigo-900"
                            href={`https://pool.pm/${row.winner_stake_id}`}
                          >
                            {row.winner_stake_id
                              ? row.winner_stake_id.slice(0, 12)
                              : ""}
                          </a>
                        </td>
                      </>
                    ) : (
                      <>
                        <td
                          className="px-6 py-4 whitespace-nowrap text-black hover:text-indigo-900"
                          key={`r-stake-req-${index}`}
                        >
                          {row.min_stake}
                        </td>
                        <td
                          className="px-6 py-4 whitespace-nowrap text-black hover:text-indigo-900"
                          key={`r-participants-${index}`}
                        >
                          {row.num_participants}
                        </td>
                      </>
                    )}

                    <td
                      className="px-6 py-4 whitespace-nowrap text-black hover:text-indigo-900"
                      key={`r-prize-${index}`}
                    >
                      {row.prize}
                    </td>

                    {closed ? (
                      <>
                        <td
                          className="px-6 py-4 whitespace-nowrap text-black hover:text-indigo-900"
                          key={`r-tx${index}`}
                        >
                          <a
                            href={`https://cardanoscan.io/transaction/${row.tx_id}`}
                          >
                            {row.tx_id
                              ? `${row.tx_id.slice(0, 6)}...${row.tx_id.slice(
                                  row.tx_id.length - 3
                                )}`
                              : ""}
                          </a>
                        </td>
                        <td
                          className="px-6 py-4 whitespace-nowrap"
                          key={`r-status-${index}`}
                        >
                          {row.status && row.status == "to_be_claimed" ? (
                            <button
                              type="button"
                              className="w-3/4 bg-blue-800 rounded"
                              onClick={() => collectPrize(row.id)}
                            >
                              Collect prize
                            </button>
                          ) : (
                            row.status
                          )}
                        </td>
                      </>
                    ) : (
                      <td
                        className="px-6 py-4 whitespace-nowrap"
                        key={`r-joined-${index}`}
                      >
                        {row.joined ? (
                          <FontAwesomeIcon icon={faCheck} className="mr-3" />
                        ) : null}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};
