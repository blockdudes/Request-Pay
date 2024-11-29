import { configureStore } from "@reduxjs/toolkit"
import walletReducer from "./features/integration";

export const makeStore = () => {
    return configureStore({
        reducer: {
            wallet: walletReducer
        },
        middleware: (getDefaultMiddleware) => getDefaultMiddleware({
            serializableCheck: false,
        })
    })
}

export type AppStore = ReturnType<typeof makeStore>
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']