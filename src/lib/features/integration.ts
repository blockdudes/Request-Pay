import { createSlice } from "@reduxjs/toolkit";
// import toast from 'react-hot-toast';
// import { ERROR_WALLET_IS_NOT_INSTALLED } from "@/utils/error";

export interface intialDataType {
    address: null | string;
    chainId: null | string;
    web3SignatureProvider: string;
    requestClient: string;
    error: string;
    loading: boolean;
}

const initialData: intialDataType = {
    address: null,
    chainId: null,
    web3SignatureProvider: "",
    requestClient: "",
    error: "",
    loading: false
}

// export const integrate = createAsyncThunk("wallet integration", async (_, { rejectWithValue }) => {
//     try {
//         console.log("Hello")
//         if (!(window as any).ethereum.isMetaMask) {
//             toast.error(ERROR_WALLET_IS_NOT_INSTALLED);
//             rejectWithValue(ERROR_WALLET_IS_NOT_INSTALLED);
//         }
//         const TARGET_CHAIN_ID = "0x61";
//         const accounts = await (window as any).ethereum.request({
//             method: "eth_requestAccounts",
//         });
//         let chainId = await (window as any).ethereum.request({ method: "eth_chainId" });
//         if (chainId !== TARGET_CHAIN_ID) {
//             await (window as any).ethereum.request({
//                 method: "wallet_addEthereumChain",
//                 params: [
//                     {
//                         chainId: TARGET_CHAIN_ID,
//                         chainName: "BNB Chain Testnet",
//                         nativeCurrency: {
//                             name: "TBNB",
//                             symbol: "tBNB",
//                             decimals: 18,
//                         },
//                         rpcUrls: ["https://bsc-testnet-rpc.publicnode.com"],
//                         blockExplorerUrls: ["https://testnet.bscscan.com/"],
//                     },
//                 ],
//             });

//             await (window as any).ethereum.request({
//                 method: "wallet_switchEthereumChain",
//                 params: [{ chainId: TARGET_CHAIN_ID }],
//             });
//             chainId = TARGET_CHAIN_ID;
//         }
//         console.log("SHERE")
//         // const provider = new ethers.BrowserProvider((window as any).ethereum);
//         // console.log("THERE")
//         // const web3SignatureProvider = new Web3SignatureProvider(provider);
//         // console.log("WHERE")
//         // const requestClient = new RequestNetwork({
//         //     nodeConnectionConfig: {
//         //         baseURL: "https://sepolia.gateway.request.network/",
//         //     },
//         //     signatureProvider: web3SignatureProvider,
//         // });
//         // console.log("HERE")

//         return {
//             address: accounts[0],
//             chainId: chainId,
//             web3SignatureProvider: "web3SignatureProvider",
//             requestClient: "requestClient"
//         }
//     } catch (error) {
//         rejectWithValue(error);
//     }
// });

const integrateSlice = createSlice({
    name: "wallet integration slice",
    initialState: initialData,
    reducers: {},
    // extraReducers: builder => {
    //     builder
    //         .addCase(integrate.pending, (state, action) => {
    //             state.loading = true;
    //         })
    //         .addCase(integrate.fulfilled, (state, action) => {
    //             state.loading = false;
    //             state.error = null;
    //             state.address = action.payload?.address;
    //             state.chainId = action.payload?.chainId;
    //             state.web3SignatureProvider = action.payload?.web3SignatureProvider;
    //             state.requestClient = action.payload?.requestClient;
    //         })
    //         .addCase(integrate.rejected, (state, action) => {
    //             state.error = action.error.message;
    //             state.loading = false;
    //         })
    // }
});

export default integrateSlice.reducer;