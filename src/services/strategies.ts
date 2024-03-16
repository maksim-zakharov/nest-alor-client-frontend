// Need to use the React-specific entry point to import createApi
import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react'

// Define a service using a base URL and expected endpoints
export const strategiesApi = createApi({
    reducerPath: 'strategiesApi',
    baseQuery: fetchBaseQuery({
        baseUrl: 'http://5.35.13.70:3005/strategies/', headers: process.env.REACT_APP_AUTH ? {
            Authorization: `Basic ${process.env.REACT_APP_AUTH}`
        } : undefined
    }),
    endpoints: (builder) => ({
        getChatStats: builder.query<any, { fromDate: string; chatId: string; }>({
            query: ({fromDate, chatId}) => `chat_stats?fromDate=${fromDate}&chatId=${chatId}`,
        }),
    }),
})

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const {useGetChatStatsQuery} = strategiesApi