import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { onAuthStateChanged } from "firebase/auth";
import { POSCartItem, POSProduct, POSStock, POSOrder } from "@/model/POSTypes";
import { auth } from "@/firebase/firebaseClient";
import api from "@/lib/api";
import toast from "react-hot-toast";

// ================================
// State Interface
// ================================
interface POSState {
  items: POSCartItem[];
  invoiceId: string | null;
  showPaymentDialog: boolean;
  isInvoiceLoading: boolean;
  products: POSProduct[];
  isProductsLoading: boolean;
  selectedStockId: string | null;
  stocks: POSStock[];
  isStocksLoading: boolean;
  showStockDialog: boolean;
  previewInvoice: boolean;
  previewOrder: POSOrder | null;
}

// ================================
// Actions
// ================================
type POSAction =
  | { type: "SET_ITEMS"; payload: POSCartItem[] }
  | { type: "CLEAR_ITEMS" }
  | { type: "SET_INVOICE_LOADING"; payload: boolean }
  | { type: "SET_SHOW_PAYMENT_DIALOG"; payload: boolean }
  | { type: "SET_PREVIEW_INVOICE"; payload: boolean }
  | { type: "SET_PREVIEW_ORDER"; payload: POSOrder | null }
  | { type: "SET_INVOICE_ID"; payload: string }
  | { type: "SET_SELECTED_STOCK_ID"; payload: string | null }
  | { type: "SET_SHOW_STOCK_DIALOG"; payload: boolean }
  | { type: "SET_STOCKS"; payload: POSStock[] }
  | { type: "SET_STOCKS_LOADING"; payload: boolean }
  | { type: "SET_PRODUCTS"; payload: POSProduct[] }
  | { type: "SET_PRODUCTS_LOADING"; payload: boolean };

// ================================
// Context Interface
// ================================
interface POSContextType extends POSState {
  loadCart: () => Promise<void>;
  addItemToCart: (item: POSCartItem) => Promise<void>;
  removeItemFromCart: (item: POSCartItem) => Promise<void>;
  loadStocks: () => Promise<void>;
  selectStock: (stockId: string) => void;
  loadProducts: (stockId: string) => Promise<void>;
  searchProducts: (query: string) => Promise<void>;
  regenerateInvoiceId: () => void;
  openPaymentDialog: () => void;
  closePaymentDialog: () => void;
  openStockDialog: () => void;
  closeStockDialog: () => void;
  setPreview: (order: POSOrder | null) => void;
  closePreview: () => void;
}

// ================================
// Initial State
// ================================
const initialState: POSState = {
  items: [],
  invoiceId: null,
  showPaymentDialog: false,
  isInvoiceLoading: false,
  products: [],
  isProductsLoading: false,
  selectedStockId: null,
  stocks: [],
  isStocksLoading: false,
  showStockDialog: false,
  previewInvoice: false,
  previewOrder: null,
};

// ================================
// Reducer
// ================================
const posReducer = (state: POSState, action: POSAction): POSState => {
  switch (action.type) {
    case "SET_ITEMS":
      return { ...state, items: action.payload };
    case "CLEAR_ITEMS":
      return { ...state, items: [] };
    case "SET_INVOICE_LOADING":
      return { ...state, isInvoiceLoading: action.payload };
    case "SET_SHOW_PAYMENT_DIALOG":
      return { ...state, showPaymentDialog: action.payload };
    case "SET_PREVIEW_INVOICE":
      return { ...state, previewInvoice: action.payload };
    case "SET_PREVIEW_ORDER":
      return { ...state, previewOrder: action.payload };
    case "SET_INVOICE_ID":
      return { ...state, invoiceId: action.payload };
    case "SET_SELECTED_STOCK_ID":
      return { ...state, selectedStockId: action.payload };
    case "SET_SHOW_STOCK_DIALOG":
      return { ...state, showStockDialog: action.payload };
    case "SET_STOCKS":
      return { ...state, stocks: action.payload };
    case "SET_STOCKS_LOADING":
      return { ...state, isStocksLoading: action.payload };
    case "SET_PRODUCTS":
      return { ...state, products: action.payload };
    case "SET_PRODUCTS_LOADING":
      return { ...state, isProductsLoading: action.payload };
    default:
      return state;
  }
};

// ================================
// Utils
// ================================
const generateInvoiceId = () => {
  const now = new Date();
  const datePart = now.toISOString().slice(2, 10).replace(/-/g, "");
  const randPart = Math.floor(100000 + Math.random() * 900000);
  return `${datePart}${randPart}`;
};

// ================================
// Context Creation
// ================================
const POSContext = createContext<POSContextType | undefined>(undefined);

export const POSProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(posReducer, initialState);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        let invId = localStorage.getItem("posInvoiceId");
        if (!invId) {
          invId = generateInvoiceId();
          localStorage.setItem("posInvoiceId", invId);
        }
        dispatch({ type: "SET_INVOICE_ID", payload: invId });

        loadStocks();

        const stockId = localStorage.getItem("neverbePOSStockId");
        if (stockId) {
          dispatch({ type: "SET_SELECTED_STOCK_ID", payload: stockId });
          loadProducts(stockId);
          loadCart(stockId);
        } else {
          dispatch({ type: "SET_SHOW_STOCK_DIALOG", payload: true });
        }
      } else {
        dispatch({ type: "CLEAR_ITEMS" });
        dispatch({ type: "SET_PRODUCTS", payload: [] });
      }
    });
    return () => unsubscribe();
  }, []);

  // ================================
  // Async Actions (axios)
  // ================================

  const loadCart = useCallback(
    async (stockIdOverride?: string) => {
      const targetStockId = stockIdOverride || state.selectedStockId;
      if (!targetStockId || !auth.currentUser) return;

      dispatch({ type: "SET_INVOICE_LOADING", payload: true });
      try {
        const { data } = await api.get("/api/v1/pos/cart", {
          params: { stockId: targetStockId },
        });
        dispatch({ type: "SET_ITEMS", payload: data });
      } catch (error) {
        console.error("Load Cart Error:", error);
        toast.error("Failed to load cart");
      } finally {
        dispatch({ type: "SET_INVOICE_LOADING", payload: false });
      }
    },
    [state.selectedStockId],
  );

  const addItemToCart = useCallback(
    async (item: POSCartItem) => {
      try {
        await api.post("/api/v1/pos/cart", item);
        loadCart();
      } catch (error) {
        console.error("Add Item Error:", error);
        toast.error("Failed to add item");
      }
    },
    [loadCart],
  );

  const removeItemFromCart = useCallback(
    async (item: POSCartItem) => {
      try {
        await api.delete("/api/v1/pos/cart", { data: item });
        loadCart();
      } catch (error) {
        console.error("Remove Item Error:", error);
        toast.error("Failed to remove item");
      }
    },
    [loadCart],
  );

  const loadStocks = useCallback(async () => {
    dispatch({ type: "SET_STOCKS_LOADING", payload: true });
    try {
      if (!auth.currentUser) return;
      const { data } = await api.get("/api/v1/pos/stocks");
      dispatch({ type: "SET_STOCKS", payload: data });
    } catch (error) {
      console.error("Load Stocks Error:", error);
      toast.error("Failed to load stocks");
    } finally {
      dispatch({ type: "SET_STOCKS_LOADING", payload: false });
    }
  }, []);

  const selectStock = useCallback((stockId: string) => {
    dispatch({ type: "SET_SELECTED_STOCK_ID", payload: stockId });
    localStorage.setItem("neverbePOSStockId", stockId);
    dispatch({ type: "SET_SHOW_STOCK_DIALOG", payload: false });
    dispatch({ type: "SET_PRODUCTS", payload: [] });
    loadProducts(stockId);
    loadCart(stockId);
  }, []);

  const loadProducts = useCallback(async (stockId: string) => {
    dispatch({ type: "SET_PRODUCTS_LOADING", payload: true });
    try {
      if (!auth.currentUser) return;
      const { data } = await api.get("/api/v1/pos/products", {
        params: { stockId },
      });
      dispatch({ type: "SET_PRODUCTS", payload: data });
    } catch (error) {
      console.error("Load Products Error:", error);
      toast.error("Failed to load products");
    } finally {
      dispatch({ type: "SET_PRODUCTS_LOADING", payload: false });
    }
  }, []);

  const searchProducts = useCallback(
    async (query: string) => {
      if (!state.selectedStockId) return;
      dispatch({ type: "SET_PRODUCTS_LOADING", payload: true });
      try {
        const { data } = await api.get("/api/v1/pos/products", {
          params: { stockId: state.selectedStockId, query },
        });
        dispatch({ type: "SET_PRODUCTS", payload: data });
      } catch (error) {
        console.error("Search Products Error:", error);
        toast.error("Failed to search products");
      } finally {
        dispatch({ type: "SET_PRODUCTS_LOADING", payload: false });
      }
    },
    [state.selectedStockId],
  );

  const regenerateInvoiceId = useCallback(() => {
    const newId = generateInvoiceId();
    dispatch({ type: "SET_INVOICE_ID", payload: newId });
    localStorage.setItem("posInvoiceId", newId);
  }, []);

  // UI Actions
  const openPaymentDialog = useCallback(
    () => dispatch({ type: "SET_SHOW_PAYMENT_DIALOG", payload: true }),
    [],
  );
  const closePaymentDialog = useCallback(
    () => dispatch({ type: "SET_SHOW_PAYMENT_DIALOG", payload: false }),
    [],
  );
  const openStockDialog = useCallback(
    () => dispatch({ type: "SET_SHOW_STOCK_DIALOG", payload: true }),
    [],
  );
  const closeStockDialog = useCallback(
    () => dispatch({ type: "SET_SHOW_STOCK_DIALOG", payload: false }),
    [],
  );
  const setPreview = useCallback((order: POSOrder | null) => {
    dispatch({ type: "SET_PREVIEW_ORDER", payload: order });
    dispatch({ type: "SET_PREVIEW_INVOICE", payload: !!order });
  }, []);
  const closePreview = useCallback(() => {
    dispatch({ type: "SET_PREVIEW_INVOICE", payload: false });
    dispatch({ type: "SET_PREVIEW_ORDER", payload: null });
  }, []);

  return (
    <POSContext.Provider
      value={{
        ...state,
        loadCart,
        addItemToCart,
        removeItemFromCart,
        loadStocks,
        selectStock,
        loadProducts,
        searchProducts,
        regenerateInvoiceId,
        openPaymentDialog,
        closePaymentDialog,
        openStockDialog,
        closeStockDialog,
        setPreview,
        closePreview,
      }}
    >
      {children}
    </POSContext.Provider>
  );
};

export const usePOS = () => {
  const context = useContext(POSContext);
  if (!context) {
    throw new Error("usePOS must be used within a POSProvider");
  }
  return context;
};
