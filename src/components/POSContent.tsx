"use client";

import { Spin } from "antd";
import POSHero from "./POSHero";
import POSProducts from "./POSProducts";
import POSInvoiceDetails from "./POSInvoiceDetails";
import POSPaymentForm from "./POSPaymentForm";
import POSStockDialog from "./POSStockDialog";
import { usePOS } from "../context/POSContext";

export default function POSContent() {
  const { isProductsLoading } = usePOS();

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-screen w-full p-4 lg:p-6 bg-gray-50 overflow-hidden">
      {/* Left Panel - Products */}
      <div className="flex-1 flex flex-col gap-2 min-h-[50vh] lg:min-h-0">
        <POSHero />
        {isProductsLoading ? (
          <div className="flex justify-center items-center flex-1">
            <Spin size="large" />
          </div>
        ) : (
          <POSProducts />
        )}
      </div>

      {/* Right Panel - Invoice Details */}
      <div className="flex-1 flex flex-col min-h-[50vh] lg:min-h-0">
        <POSInvoiceDetails />
      </div>

      {/* Dialogs */}
      <POSStockDialog />
      <POSPaymentForm />
    </div>
  );
}
