import { useCallback, useState, useRef } from "react"
import { RequestByEmployeeParams, Transaction } from "../utils/types"
import { TransactionsByEmployeeResult } from "./types"
import { useCustomFetch } from "./useCustomFetch"

export function useTransactionsByEmployee(): TransactionsByEmployeeResult {
  const { fetchWithCache, loading } = useCustomFetch()
  const [transactionsByEmployee, setTransactionsByEmployee] = useState<Transaction[] | null>(null)

  let abortFn = useRef(() => {})

  const fetchById = useCallback(
    async (employeeId: string) => {
      let fetched = true

      const data = (await Promise.any([
        fetchWithCache<Transaction[], RequestByEmployeeParams>("transactionsByEmployee", {
          employeeId,
        }).then((result) => {
          fetched = true
          return result
        }),
        new Promise((resolve) => {
          abortFn.current = () => resolve(null)
        }),
      ])) as Transaction[] | null

      if (!fetched) {
        return
      }

      setTransactionsByEmployee(data)
    },
    [fetchWithCache]
  )

  const invalidateData = useCallback(() => {
    setTransactionsByEmployee(null)
  }, [])

  const abort = useCallback(() => {
    abortFn.current()
  }, [])

  return { data: transactionsByEmployee, loading, fetchById, invalidateData, abort }
}
