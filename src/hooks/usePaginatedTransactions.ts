import { useCallback, useState, useRef } from "react"
import { PaginatedRequestParams, PaginatedResponse, Transaction } from "../utils/types"
import { PaginatedTransactionsResult } from "./types"
import { useCustomFetch } from "./useCustomFetch"

export function usePaginatedTransactions(): PaginatedTransactionsResult {
  const { fetchWithCache, loading } = useCustomFetch()
  const [paginatedTransactions, setPaginatedTransactions] = useState<PaginatedResponse<
    Transaction[]
  > | null>(null)

  let abortFn = useRef(() => {})

  const fetchAll = useCallback(async () => {
    let fetched = false

    const response = (await Promise.any([
      fetchWithCache<PaginatedResponse<Transaction[]>, PaginatedRequestParams>("paginatedTransactions", {
        page: paginatedTransactions === null ? 0 : paginatedTransactions.nextPage,
      }).then((result) => {
        fetched = true
        return result
      }),
      new Promise((resolve) => {
        abortFn.current = () => resolve(null)
      }),
    ])) as PaginatedResponse<Transaction[]> | null

    if (!fetched) {
      return
    }

    setPaginatedTransactions((previousResponse) => {
      if (response === null || previousResponse === null) {
        return response
      }

      return {
        data: [...previousResponse.data, ...response.data],
        nextPage: response.nextPage,
      }
    })
  }, [fetchWithCache, paginatedTransactions])

  const invalidateData = useCallback(() => {
    setPaginatedTransactions(null)
  }, [])

  const abort = useCallback(() => {
    abortFn.current()
  }, [])

  return { data: paginatedTransactions, loading, fetchAll, invalidateData, abort }
}
