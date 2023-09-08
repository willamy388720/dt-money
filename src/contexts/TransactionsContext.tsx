import { ReactNode, useState, useEffect, useCallback } from "react";
import { createContext } from "use-context-selector";
import { api } from "../lib/axios";

type Transaction = {
  id: number;
  description: string;
  type: "income" | "outcome";
  category: string;
  price: number;
  createdAt: string;
};

type CreateTransactionInputs = {
  description: string;
  price: number;
  category: string;
  type: "income" | "outcome";
};

type TransactionContextType = {
  transactions: Transaction[];
  fetchTransactions: (query?: string) => Promise<void>;
  createTransaction: ({
    description,
    price,
    category,
    type,
  }: CreateTransactionInputs) => Promise<void>;
};

type TransactionProviderProps = {
  children: ReactNode;
};

export const TransactionsContext = createContext({} as TransactionContextType);

export function TransactionProvider({ children }: TransactionProviderProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const fetchTransactions = useCallback(async (query?: string) => {
    const response = await api.get("/transactions", {
      params: {
        _sort: "createdAt",
        _order: "desc",
        q: query,
      },
    });

    setTransactions(response.data);
  }, []);

  const createTransaction = useCallback(
    async ({ description, price, category, type }: CreateTransactionInputs) => {
      const response = await api.post("/transactions", {
        description,
        price,
        category,
        type,
        createdAt: new Date(),
      });

      setTransactions((prevState) => [response.data, ...prevState]);
    },
    []
  );

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);
  return (
    <TransactionsContext.Provider
      value={{ transactions, fetchTransactions, createTransaction }}
    >
      {children}
    </TransactionsContext.Provider>
  );
}
