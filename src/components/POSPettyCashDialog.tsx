import React, { useState, useEffect } from "react";
import { Modal, Input, Button, Table, Tag, Form, InputNumber, Select, Upload, Divider } from "antd";
import {
  IconX,
  IconPlus,
  IconFileUpload,
  IconCash,
} from "@tabler/icons-react";
import api from "@/lib/api";
import { usePOS } from "../context/POSContext";
import toast from "react-hot-toast";

interface POSPettyCashDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function POSPettyCashDialog({ open, onClose }: POSPettyCashDialogProps) {
  const { selectedStockId } = usePOS();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<{ id: string; label: string }[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [fileList, setFileList] = useState<any[]>([]);

  useEffect(() => {
    if (open) {
      fetchCategories();
      fetchExpenses();
    }
  }, [open, selectedStockId]);

  const fetchCategories = async () => {
    try {
      const { data } = await api.get("/api/v1/pos/petty-cash/categories");
      setCategories(data);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const fetchExpenses = async () => {
    if (!selectedStockId) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/api/v1/pos/petty-cash?stockId=${selectedStockId}`);
      setExpenses(data.data || []);
    } catch (error) {
      console.error("Failed to fetch expenses:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = async (values: any) => {
    if (!selectedStockId) {
      toast.error("Please select a stock location first");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      const pettyCashData = {
        ...values,
        stockId: selectedStockId,
        date: new Date().toISOString(),
        type: "expense",
      };

      formData.append("data", JSON.stringify(pettyCashData));
      if (fileList.length > 0 && fileList[0].originFileObj) {
        formData.append("attachment", fileList[0].originFileObj);
      }

      await api.post("/api/v1/pos/petty-cash", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Expense added successfully");
      form.resetFields();
      setFileList([]);
      fetchExpenses();
    } catch (error) {
      console.error("Failed to add expense:", error);
      toast.error("Failed to add expense");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      align: "right" as const,
      render: (amount: number) => `Rs. ${amount.toLocaleString()}`,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={status === "APPROVED" ? "green" : status === "REJECTED" ? "red" : "orange"}>
          {status}
        </Tag>
      ),
    },
  ];

  return (
    <Modal
      open={open}
      onCancel={onClose}
      width={900}
      footer={null}
      closeIcon={null}
      className="[&_.ant-modal-content]:!rounded-2xl"
    >
      <div className="flex justify-between items-center p-5 border-b bg-gray-50/50 rounded-t-2xl">
        <div className="flex items-center gap-2">
          <IconCash size={24} className="text-green-600" />
          <h2 className="text-xl font-bold text-gray-800">Petty Cash (Current Month)</h2>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-all">
          <IconX size={20} className="text-gray-400" />
        </button>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Section */}
        <div className="lg:col-span-1">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Add New Expense</h3>
          <Form form={form} layout="vertical" onFinish={handleFinish}>
            <Form.Item name="category" label="Category" rules={[{ required: true, message: "Required" }]}>
              <Select placeholder="Select Category" className="h-11 rounded-xl">
                {categories.map((cat) => (
                  <Select.Option key={cat.id} value={cat.label}>
                    {cat.label}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name="amount" label="Amount (Rs.)" rules={[{ required: true, message: "Required" }]}>
              <InputNumber className="w-full h-11 rounded-xl flex items-center" min={1} />
            </Form.Item>

            <Form.Item name="note" label="Note" rules={[{ required: true, message: "Required" }]}>
              <Input.TextArea rows={3} className="rounded-xl" placeholder="Purpose of expense" />
            </Form.Item>

            <Form.Item label="Attachment">
              <Upload
                beforeUpload={() => false}
                fileList={fileList}
                onChange={({ fileList }) => setFileList(fileList.slice(-1))}
                maxCount={1}
              >
                <Button icon={<IconFileUpload size={18} />} className="w-full h-11 rounded-xl">
                  Select File
                </Button>
              </Upload>
            </Form.Item>

            <Form.Item className="mb-0">
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className="w-full h-12 bg-green-600 hover:bg-green-700 rounded-xl font-bold"
                icon={<IconPlus size={20} />}
              >
                Add Transaction
              </Button>
            </Form.Item>
          </Form>
        </div>

        {/* List Section */}
        <div className="lg:col-span-2 border-l pl-0 lg:pl-8">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Monthly Transactions</h3>
          <Table
            dataSource={expenses}
            columns={columns}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 5 }}
            size="middle"
            className="border rounded-xl overflow-hidden shadow-sm"
          />
        </div>
      </div>
    </Modal>
  );
}
