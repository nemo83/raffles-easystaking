import {
  Address,
  Value,
  TxOutput,
  NetworkParams,
  Program,
  Tx,
  WalletHelper,
  Cip30Wallet,
} from "@hyperionbt/helios";
import { getNetworkParam, network } from "../../constants/blockfrost";

export const createReferenceScript = async (
  contractAddress: string,
  script: string,
  walletApi: Cip30Wallet
) => {

  const networkParams = new NetworkParams(
    await fetch(getNetworkParam(network))
      .then(response => response.json())
  )

  const walletHelper = new WalletHelper(walletApi)
  const utxos = await walletHelper.pickUtxos(new Value(BigInt(5_000_000)))

  // Make this an address that you have control of, but that
  // you are happy to just leave! As if you spend the UTxO
  // then the script is no longer usable!
  const CONTRACTS_ADDRESS = Address.fromBech32(contractAddress);

  // Get our Program
  const program = Program.new(script);
  const uplcProgram = program.compile(true)

  // Create a TxOutput for the Script.
  // Notice that we pass the 'program' into the 4th Parameter
  const scriptOutput = new TxOutput(
    CONTRACTS_ADDRESS,
    new Value(BigInt(5_000_000)),
    undefined,
    uplcProgram
  );
  // Calculate the Min Lovelace for the output; this can be fairly large
  scriptOutput.correctLovelace(networkParams);

  const tx: Tx = await new Tx()
    .addInputs(utxos[0])
    .addOutput(scriptOutput)
    .finalize(
      networkParams,
      await walletHelper.changeAddress,
      utxos[1]
    );
  // Sign and Submit the transaction!
  const signatures = await walletApi.signTx(tx);

  tx.addSignatures(signatures);

  const txHash = await walletApi.submitTx(tx);

  console.log('txHash', txHash)

}