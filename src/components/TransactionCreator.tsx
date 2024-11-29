"use client"
import "@rainbow-me/rainbowkit/styles.css";
import { parseUnits, zeroAddress } from "viem";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useWalletClient, useAccount } from "wagmi";
import { currencies } from "@/config/currency";
import { storageChains } from "@/config/storage-chain";
import {
    RequestNetwork,
    Types,
    Utils,
} from "@requestnetwork/request-client.js";
import { Web3SignatureProvider } from "@requestnetwork/web3-signature";
import { useState, useEffect } from "react";

enum APP_STATUS {
    AWAITING_INPUT = "awaiting input",
    SUBMITTING = "submitting",
    PERSISTING_TO_IPFS = "persisting to ipfs",
    PERSISTING_ON_CHAIN = "persisting on-chain",
    REQUEST_CONFIRMED = "request confirmed",
    ERROR_OCCURRED = "error occurred",
}

export default function TransactionCreator() {
    const [storageChain, setStorageChain] = useState(
        storageChains.keys().next().value,
    );
    const [currency, setCurrency] = useState(currencies.keys().next().value);
    const [expectedAmount, setExpectedAmount] = useState("");
    const [paymentRecipient, setPaymentRecipient] = useState("");
    const [payerIdentity, setPayerIdentity] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [reason, setReason] = useState("");
    const [status, setStatus] = useState(APP_STATUS.AWAITING_INPUT);
    const { data: walletClient, isError, isLoading } = useWalletClient();
    const { address, isConnecting, isDisconnected } = useAccount();
    const [requestData, setRequestData] =
        useState<Types.IRequestDataWithEvents>();

    async function createRequest() {
        const signatureProvider = new Web3SignatureProvider(walletClient);
        if (!storageChain) {
            throw new Error("Storage chain is not defined.");
        }
        const requestClient = new RequestNetwork({
            nodeConnectionConfig: {
                baseURL: storageChains.get(storageChain)!.gateway,
            },
            signatureProvider,
        });
        if (!currency) {
            throw new Error("Currency is not defined.");
        }
        const requestCreateParameters: Types.ICreateRequestParameters = {
            requestInfo: {
                currency: {
                    type: currencies.get(currency)!.type,
                    value: currencies.get(currency)!.value,
                    network: currencies.get(currency)!.network,
                },
                expectedAmount: parseUnits(
                    expectedAmount as `${number}`,
                    currencies.get(currency)!.decimals,
                ).toString(),
                payee: {
                    type: Types.Identity.TYPE.ETHEREUM_ADDRESS,
                    value: address as string,
                },
                timestamp: Utils.getCurrentTimestampInSecond(),
            },
            paymentNetwork: {
                id: Types.Extension.PAYMENT_NETWORK_ID.ERC20_FEE_PROXY_CONTRACT,
                parameters: {
                    paymentNetworkName: currencies.get(currency)!.network,
                    paymentAddress: paymentRecipient || address,
                    feeAddress: zeroAddress,
                    feeAmount: "0",
                },
            },
            contentData: {
                reason: reason,
                dueDate: dueDate,
                builderId: "request-network",
                createdWith: "CodeSandBox",
            },
            signer: {
                type: Types.Identity.TYPE.ETHEREUM_ADDRESS,
                value: address as string,
            },
        };

        if (payerIdentity.length > 0) {
            requestCreateParameters.requestInfo.payer = {
                type: Types.Identity.TYPE.ETHEREUM_ADDRESS,
                value: payerIdentity,
            };
        }


        try {
            setStatus(APP_STATUS.PERSISTING_TO_IPFS);
            const request = await requestClient.createRequest(
                requestCreateParameters,
            );

            setStatus(APP_STATUS.PERSISTING_ON_CHAIN);
            setRequestData(request.getData());
            const confirmedRequestData = await request.waitForConfirmation();

            setStatus(APP_STATUS.REQUEST_CONFIRMED);
            setRequestData(confirmedRequestData);
        } catch (err) {
            setStatus(APP_STATUS.ERROR_OCCURRED);
            alert(err);
        }
    }

    function canSubmit() {
        return (
            status !== APP_STATUS.SUBMITTING &&
            !isDisconnected &&
            !isConnecting &&
            !isError &&
            !isLoading &&
            storageChain &&
            storageChain.length > 0 &&
            (paymentRecipient.length === 0 ||
                (paymentRecipient.startsWith("0x") &&
                    paymentRecipient.length === 42)) &&
            (payerIdentity.length === 0 ||
                (payerIdentity.startsWith("0x") && payerIdentity.length === 42)) &&
            expectedAmount.length > 0 &&
            currency &&
            currency.length > 0
        );
    }

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!canSubmit()) {
            return;
        }
        setRequestData(undefined);
        setStatus(APP_STATUS.SUBMITTING);
        createRequest();
    }

    // function handleClear(_: React.MouseEvent<HTMLButtonElement>) {
    //     setRequestData(undefined);
    //     setStatus(APP_STATUS.AWAITING_INPUT);
    // }

    function unused() {
        setPaymentRecipient("");
    }

    const [site, setSite] = useState("");
    useEffect(() => {
        setSite(window.location.origin)
    }, [])
    return (
        <div className="p-8 h-screen">
            <div>
                <div className="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto">
                    <form onSubmit={handleSubmit}>
                        <h2 className="text-2xl font-semibold mb-4">Create Transaction</h2>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Payee Wallet</label>
                            <ConnectButton chainStatus="none" showBalance={false} />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Chain *</label>
                            <select
                                name="storage-chain"
                                onChange={(e) => setStorageChain(e.target.value)}
                                defaultValue={storageChain}
                                className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                            >
                                {Array.from(storageChains.entries()).map(([key, value]) => (
                                    <option key={key} value={key}>
                                        {value.name} ({value.type})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Amount *</label>
                            <input
                                type="number"
                                name="expected-amount"
                                step="any"
                                onChange={(e) => setExpectedAmount(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Currency *</label>
                            <select
                                name="currency"
                                onChange={(e) => setCurrency(e.target.value)}
                                defaultValue={currency}
                                className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                            >
                                {Array.from(currencies.entries()).map(([key, value]) => (
                                    <option key={key} value={key}>
                                        {value.symbol} ({value.network})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Payer Identity</label>
                            <input
                                type="text"
                                name="payer-identity"
                                placeholder="0x..."
                                onChange={(e) => setPayerIdentity(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                            <input
                                type="date"
                                name="due-date"
                                onChange={(e) => setDueDate(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                            <input
                                type="text"
                                name="reason"
                                onChange={(e) => setReason(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={!canSubmit()}
                            className="w-full bg-purple-600 text-white py-2 rounded-lg text-sm hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Submit
                        </button>
                    </form>

                    {requestData?.requestId && (
                        <div className="bg-white p-6 mt-4 rounded-lg shadow-md w-full border overflow-auto">
                            <h3 className="text-lg font-semibold mb-2">Payment Link Generated!</h3>
                            <p className="truncate w-full text-gray-700">{`${site}/transaction/${requestData.requestId}`}</p>
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(`${site}/transaction/${requestData.requestId}`);
                                    alert("Link copied to clipboard!");
                                }}
                                className="mt-2 bg-blue-500 text-white py-1 px-3 rounded hover:bg-blue-600"
                            >
                                Copy Link
                            </button>
                        </div>
                    )}
                </div>

            </div>
            <button
                style={{ display: 'none' }} // This will hide the button and it won't take up space
                onClick={unused} // Replace with your click handler
            >
                Hidden Button
            </button>
        </div>
    );
}