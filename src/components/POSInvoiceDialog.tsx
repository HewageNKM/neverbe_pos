import React, { useState, useEffect } from "react";
import { Modal, Input, Button, Table, Spin, Tag } from "antd";
import {
  IconSearch,
  IconX,
  IconEye,
  IconPrinter,
  IconArrowLeft,
} from "@tabler/icons-react";
import api from "@/lib/api";
import { pdf } from "@react-pdf/renderer";
import POSInvoicePDF from "./POSInvoicePDF";
import { Order } from "@/model/Order";

interface POSInvoiceDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function POSInvoiceDialog({
  open,
  onClose,
}: POSInvoiceDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [invoiceUrl, setInvoiceUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (invoiceUrl) URL.revokeObjectURL(invoiceUrl);
    };
  }, [invoiceUrl]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setSearched(true);
    setInvoiceUrl(null);
    try {
      const { data } = await api.get(`/api/v1/pos/orders/${searchQuery}`);

      if (data && data.orderId) {
        setInvoices([data]);
      } else if (Array.isArray(data)) {
        setInvoices(data);
      } else {
        setInvoices([]);
      }
    } catch (error) {
      console.error("Failed to search invoices:", error);
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleClose = () => {
    setSearchQuery("");
    setInvoices([]);
    setSearched(false);
    setInvoiceUrl(null);
    onClose();
  };

  const handleViewInvoice = async (order: Order) => {
    try {
      if (!order || !order.items) {
        alert("Invalid order data for viewing.");
        return;
      }

      setLoading(true);
      const blob = await pdf(<POSInvoicePDF order={order} />).toBlob();
      const url = URL.createObjectURL(blob);
      setInvoiceUrl(url);
    } catch (err) {
      console.error("Failed to generate invoice", err);
      alert("Failed to generate invoice. See console for details.");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    if (invoiceUrl) {
      const printWindow = window.open(invoiceUrl, "_blank");
      if (printWindow) {
        printWindow.onload = () => printWindow.focus();
      } else {
        alert("Popup blocked! Please allow popups to print invoices.");
      }
    }
  };

  const handleBack = () => {
    setInvoiceUrl(null);
  };

  const columns = [
    {
      title: "Invoice ID",
      dataIndex: "orderId",
      key: "orderId",
      render: (id: string) => <span className="font-semibold">#{id}</span>,
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Items",
      dataIndex: "items",
      key: "items",
      render: (items: any[]) => `${items?.length || 0} items`,
    },
    {
      title: "Total",
      dataIndex: "total",
      key: "total",
      align: "right" as const,
      render: (total: number) => `Rs. ${total?.toLocaleString()}`,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={status === "Completed" ? "green" : "orange"}>{status}</Tag>
      ),
    },
    {
      title: "Action",
      key: "action",
      align: "center" as const,
      render: (_: any, record: any) => (
        <button
          onClick={() => handleViewInvoice(record)}
          className="text-green-600 hover:text-green-800 transition-all"
          title="View Invoice"
        >
          <IconEye size={18} />
        </button>
      ),
    },
  ];

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      width={800}
      footer={null}
      closeIcon={null}
      className="[&_.ant-modal-content]:!rounded-2xl [&_.ant-modal-content]:!border-0 [&_.ant-modal-content]:!shadow-xl [&_.ant-modal-content]:!p-0 [&_.ant-modal-content]:!min-h-[600px]"
    >
      {/* Header */}
      <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50/50 rounded-t-2xl">
        <div className="flex items-center gap-2">
          {invoiceUrl && (
            <button
              onClick={handleBack}
              className="text-gray-500 hover:text-gray-700 mr-1 transition-all"
            >
              <IconArrowLeft size={20} />
            </button>
          )}
          <h2 className="text-xl font-bold text-gray-800">
            {invoiceUrl ? "Invoice Preview" : "Search Invoices"}
          </h2>
        </div>
        <button
          onClick={handleClose}
          className="flex items-center justify-center w-8 h-8 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
        >
          <IconX size={20} />
        </button>
      </div>

      {/* Content */}
      <div className="p-0">
        {invoiceUrl ? (
          <div className="h-[500px] w-full bg-gray-100 flex flex-col">
            <iframe
              src={invoiceUrl}
              width="100%"
              height="100%"
              style={{ border: "none", flex: 1 }}
              title="Invoice Preview"
            />
          </div>
        ) : (
          <div className="flex flex-col gap-4 p-4">
            {/* Search Bar */}
            <div className="flex gap-2">
              <Input
                size="large"
                placeholder="Enter invoice ID (e.g. inv_...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                prefix={<IconSearch size={18} className="text-gray-400" />}
                className="rounded-xl"
              />
              <Button
                type="primary"
                size="large"
                onClick={handleSearch}
                loading={loading}
                className="rounded-xl font-semibold shadow-sm"
                style={{
                  backgroundColor: "#16a34a",
                  minWidth: 100,
                }}
              >
                Search
              </Button>
            </div>

            {/* Results */}
            {loading ? (
              <div className="flex justify-center py-8">
                <Spin size="large" />
              </div>
            ) : searched && invoices.length === 0 ? (
              <div className="flex justify-center py-8">
                <p className="text-gray-500">No invoices found</p>
              </div>
            ) : invoices.length > 0 ? (
              <Table
                dataSource={invoices}
                columns={columns}
                rowKey="orderId"
                size="small"
                pagination={false}
              />
            ) : null}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex justify-end gap-3 p-5 border-t border-gray-100 bg-gray-50/30 rounded-b-2xl">
        {invoiceUrl ? (
          <>
            <Button
              onClick={handleBack}
              className="h-10 px-6 rounded-xl font-medium"
            >
              Back
            </Button>
            <Button
              type="primary"
              onClick={handlePrint}
              icon={<IconPrinter size={18} />}
              className="h-10 px-6 rounded-xl font-medium shadow-sm"
              style={{ backgroundColor: "#16a34a" }}
            >
              Print
            </Button>
          </>
        ) : (
          <Button
            onClick={handleClose}
            className="h-10 px-6 rounded-xl font-medium"
          >
            Close
          </Button>
        )}
      </div>
    </Modal>
  );
}
