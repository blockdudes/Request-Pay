"use client";

import "@rainbow-me/rainbowkit/styles.css";
import { useEffect, useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
    useWalletClient,
    useAccount,
    useNetwork,
    useSwitchNetwork,
} from "wagmi";

import { storageChains } from "@/config/storage-chain";
import {
    RequestNetwork,
    Types,
} from "@requestnetwork/request-client.js";
import {
    approveErc20,
    hasErc20Approval,
    hasSufficientFunds,
    payRequest,
} from "@requestnetwork/payment-processor";
import { getPaymentNetworkExtension } from "@requestnetwork/payment-detection";
import { useEthersV5Provider } from "@/hooks/use-ethers-v5-provider";
import { useEthersV5Signer } from "@/hooks/use-ethers-v5-signer";

enum APP_STATUS {
    AWAITING_INPUT = "awaiting input",
    SUBMITTING = "submitting",
    PERSISTING_TO_IPFS = "persisting to ipfs",
    PERSISTING_ON_CHAIN = "persisting on-chain",
    REQUEST_CONFIRMED = "request confirmed",
    APPROVING = "approving",
    APPROVED = "approved",
    PAYING = "paying",
    REQUEST_PAID = "request paid",
    ERROR_OCCURRED = "error occurred",
}

export default function TransactionComplete({ transactionId }: { transactionId: string }) {
    console.log(transactionId);

    const [storageChain, setStorageChain] = useState(
        storageChains.keys().next().value,
    );
    const [status, setStatus] = useState(APP_STATUS.AWAITING_INPUT);
    const { data: walletClient, isError, isLoading } = useWalletClient();
    const { address, isConnecting, isDisconnected } = useAccount();
    const { chain } = useNetwork();
    const {
        chains,
        error,
        isLoading: isSwitchNetworkLoading,
        switchNetwork,
    } = useSwitchNetwork();
    const [requestData, setRequestData] =
        useState<Types.IRequestDataWithEvents>();
    const provider = useEthersV5Provider();
    const signer = useEthersV5Signer();

    async function payTheRequest() {
        if (!storageChain) {
            throw new Error("Storage chain is not defined.");
        }

        const storageChainConfig = storageChains.get(storageChain);
        if (!storageChainConfig) {
            throw new Error(`Storage chain not found for: ${storageChain}`);
        }

        const requestClient = new RequestNetwork({
            nodeConnectionConfig: {
                baseURL: storageChainConfig.gateway,
            },
        });

        try {
            const _request = await requestClient.fromRequestId(
                requestData!.requestId,
            );
            let _requestData = _request.getData();
            const paymentTx = await payRequest(_requestData, signer);
            await paymentTx.wait(2);

            // Poll the request balance once every second until payment is detected
            // TODO Add a timeout
            while ((_requestData.balance?.balance ?? 0) < _requestData.expectedAmount) {
                _requestData = await _request.refresh();
                alert(`balance = ${_requestData.balance?.balance}`);
                await new Promise((resolve) => setTimeout(resolve, 1000));
            }
            alert(`payment detected!`);
            setRequestData(_requestData);
            setStatus(APP_STATUS.REQUEST_PAID);
        } catch (err) {
            setStatus(APP_STATUS.APPROVED);
            alert(err);
        }
    }

    function canPay() {
        return (
            status === APP_STATUS.APPROVED &&
            !isDisconnected &&
            !isConnecting &&
            !isError &&
            !isLoading &&
            !isSwitchNetworkLoading &&
            requestData?.currencyInfo.network === chain?.network
        );
    }

    function handlePay(e: React.MouseEvent<HTMLButtonElement>) {
        e.preventDefault();
        if (!canPay()) {
            return;
        }
        setStatus(APP_STATUS.PAYING);
        payTheRequest();
    }

    async function approve() {
        if (!storageChain) {
            throw new Error("Storage chain is not defined.");
        }
        const storageChainConfig = storageChains.get(storageChain);
        if (!storageChainConfig) {
            throw new Error(`Storage chain not found for: ${storageChain}`);
        }

        const requestClient = new RequestNetwork({
            nodeConnectionConfig: {
                baseURL: storageChainConfig.gateway,
            },
        });

        try {
            const _request = await requestClient.fromRequestId(
                requestData!.requestId,
            );
            const _requestData = _request.getData();
            alert(`Checking if payer has sufficient funds...`);
            const _hasSufficientFunds = await hasSufficientFunds({
                request: _request.getData(),
                address: `0x${address}`,
                providerOptions: { provider: provider }
                // address as string,
                // { provider: provider },
            }

            );
            alert(`_hasSufficientFunds = ${_hasSufficientFunds}`);
            if (!_hasSufficientFunds) {
                setStatus(APP_STATUS.REQUEST_CONFIRMED);
                return;
            }
            if (
                getPaymentNetworkExtension(_requestData)?.id ===
                Types.Extension.PAYMENT_NETWORK_ID.ERC20_FEE_PROXY_CONTRACT
            ) {
                alert(`ERC20 Request detected. Checking approval...`);
                const _hasErc20Approval = await hasErc20Approval(
                    _requestData,
                    address as string,
                    provider,
                );
                alert(`_hasErc20Approval = ${_hasErc20Approval}`);
                if (!_hasErc20Approval) {
                    const approvalTx = await approveErc20(_requestData, signer);
                    await approvalTx.wait(2);
                }
            }
            setStatus(APP_STATUS.APPROVED);
        } catch (err) {
            setStatus(APP_STATUS.REQUEST_CONFIRMED);
            alert(JSON.stringify(err));
        }
    }

    function canApprove() {
        return (
            // status === APP_STATUS.REQUEST_CONFIRMED &&
            !isDisconnected &&
            !isConnecting &&
            !isError &&
            !isLoading &&
            !isSwitchNetworkLoading &&
            requestData?.currencyInfo.network === chain?.network
        );
    }

    function handleApprove(e: React.MouseEvent<HTMLButtonElement>) {
        e.preventDefault();
        if (!canApprove()) {
            return;
        }
        setStatus(APP_STATUS.APPROVING);
        approve();
    }

    async function createRequest() {
        if (!storageChain) {
            throw new Error("Storage chain is not defined.");
        }
        const requestClient = new RequestNetwork({
            nodeConnectionConfig: {
                baseURL: storageChains.get(storageChain)!.gateway,
            },
            // signatureProvider,
        });

        try {
            const request = await requestClient.fromRequestId(
                transactionId
            );

            setRequestData(request.getData());

            console.log(request.getData());
        } catch (err) {
            setStatus(APP_STATUS.ERROR_OCCURRED);
            alert(err);
        }
    }

    useEffect(() => {
        createRequest();
    }, [])

    console.log(requestData);

    // function canSubmit() {
    //     return (
    //         status !== APP_STATUS.SUBMITTING &&
    //         !isDisconnected &&
    //         !isConnecting &&
    //         !isError &&
    //         !isLoading &&
    //         storageChain.length > 0 &&
    //         // Payment Recipient is empty || isAddress
    //         (paymentRecipient.length === 0 ||
    //             (paymentRecipient.startsWith("0x") &&
    //                 paymentRecipient.length === 42)) &&
    //         // Payer is empty || isAddress
    //         (payerIdentity.length === 0 ||
    //             (payerIdentity.startsWith("0x") && payerIdentity.length === 42)) &&
    //         expectedAmount.length > 0 &&
    //         currency.length > 0
    //     );
    // }

    // function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    //     e.preventDefault();
    //     if (!canSubmit()) {
    //         return;
    //     }
    //     setRequestData(undefined);
    //     setStatus(APP_STATUS.SUBMITTING);
    //     // createRequest();
    // }

    // function handleClear(_: React.MouseEvent<HTMLButtonElement>) {
    //     setRequestData(undefined);
    //     setStatus(APP_STATUS.AWAITING_INPUT);
    // }

    function unused() {
        setStorageChain("");
        console.log(walletClient);
        console.log(error);
    }

    return (
        <div className="border flex flex-col items-center justify-center w-full h-screen">
            <div className="w-[600px]  bg-white rounded-md p-5">
                <h2 className="text-2xl font-semibold mb-4">Payment Portal</h2>
                {/* <br></br> */}
                <ConnectButton showBalance={false} />
                <br></br>
                <button
                    disabled={
                        !switchNetwork ||
                        !requestData ||
                        requestData?.currencyInfo.network === chain?.network
                    }
                    onClick={() =>
                        switchNetwork?.(
                            chains.find(
                                (chain) => chain.network === requestData?.currencyInfo.network,
                            )?.id,
                        )
                    }
                    className=" mr-2 border bg-blue-600 text-white py-2 px-4 rounded-lg text-sm hover:bg-blue-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Switch to Payment Chain: {requestData?.currencyInfo.network}
                    {isSwitchNetworkLoading && " (switching)"}
                </button>
                <br></br>
                <br></br>
                <div className="bg-gray-100 p-4 rounded-lg shadow-md">
                    <h4 className="text-lg font-bold text-gray-800">Payee Address</h4>
                    <p className="text-gray-600">{requestData?.payee?.value}</p>
                    <h4 className="text-lg font-bold text-gray-800">Payer Address</h4>
                    <p className="text-gray-600">{requestData?.payer?.value}</p>
                    <h4 className="text-lg font-bold text-gray-800">Transaction Reason</h4>
                    <p className="text-gray-600">{requestData?.contentData?.reason}</p>
                    <h4 className="text-lg font-bold text-gray-800">Due Date</h4>
                    <p className="text-gray-600">{requestData?.contentData?.dueDate}</p>
                </div>
                <br></br>
                <div className="flex w-fit">
                    <button
                        type="button"
                        disabled={!canApprove()}
                        onClick={handleApprove}
                        className=" mr-2 border bg-blue-600 text-white py-2 px-4 rounded-lg text-sm hover:bg-blue-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Approve
                    </button>
                    {/* <br></br>
                    <div>
                        {!switchNetwork &&
                            "Programmatic switch network not supported by wallet."}
                    </div>
                    <div>{error && error.message}</div>
                    <br></br> */}
                    <button
                        type="button"
                        onClick={handlePay}
                        disabled={!canPay()}
                        className=" ml-2 bg-blue-500 text-white py-2 px-4 rounded-lg text-sm transition duration-200 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    >
                        Pay now
                    </button>
                </div>

            </div>

            {/* <br></br>
            <br></br>
            <h4>Request info</h4>
            <br></br>
            <button type="button" onClick={handleClear} className={styles.h9_w24}>
                Clear
            </button>
            <p>App status: {status}</p>
            <p>Request state: {requestData?.state}</p>
            <pre>{JSON.stringify(requestData, undefined, 2)}</pre> */}

            <button
                style={{ display: 'none' }} // This will hide the button and it won't take up space
                onClick={unused} // Replace with your click handler
            >
                Hidden Button
            </button>
        </div>
    );
}
