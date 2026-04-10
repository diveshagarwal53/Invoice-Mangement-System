import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

function Invoice() {
  const [invoices, setInvoices] = useState([]);
  const [formData, setFormData] = useState({
    items: [{ name: "", quantity: "", price: "" }],
    tax: "",
    discount: "",
    status: "",
    dueDate: "",
    notes: "",
  });

  const { clientId } = useParams();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [editId, setEditId] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (field, value) => {
    setFormData({
      ...formData,
      items: [
        {
          ...formData.items[0],
          [field]: value,
        },
      ],
    });
  };

  const getInvoices = async () => {
    let res = await fetch(
      `http://localhost:7000/api/v12/invoices/${clientId}?search=${search}&page=${page}`,
      { method: "GET", credentials: "include" },
    );
    res = await res.json();
    if (res.success) setInvoices(res.invoices);
  };

  useEffect(() => {
    getInvoices();
  }, [search, page]);

  const addInvoice = async (e) => {
    e.preventDefault();
    let res = await fetch(
      `http://localhost:7000/api/v12/invoices/${clientId}`,
      {
        method: "POST",
        credentials: "include",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify(formData),
      },
    );
    res = await res.json();
    if (res.success) {
      setFormData({
        items: [{ name: "", quantity: "", price: "" }],
        tax: "",
        discount: "",
        status: "",
        dueDate: "",
        notes: "",
      });
      getInvoices();
    }
  };

  const deleteInvoice = async (id) => {
    let res = await fetch(
      `http://localhost:7000/api/v12/invoices/${clientId}/invoice/${id}`,
      { method: "DELETE", credentials: "include" },
    );
    res = await res.json();
    if (res.success) getInvoices();
  };

  const handleEdit = (invoice) => {
    setFormData({
      items: [
        {
          name: invoice.items[0].name,
          quantity: invoice.items[0].quantity,
          price: invoice.items[0].price,
        },
      ],
      tax: invoice.tax,
      discount: invoice.discount,
      status: invoice.status,
      dueDate: invoice.dueDate,
      notes: invoice.notes,
    });
    setEditId(invoice._id);
  };

  const updateInvoice = async (e) => {
    e.preventDefault();

    let res = await fetch(
      `http://localhost:7000/api/v12/invoices/${clientId}/invoice/${editId}`,
      {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify(formData),
      },
    );
    res = await res.json();
    if (res.success) {
      alert(res.message);
      setFormData({
        items: [{ name: "", quantity: "", price: "" }],
        tax: "",
        discount: "",
        status: "",
        dueDate: "",
        notes: "",
      });
      setEditId(null);
      getInvoices();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* HEADER */}
        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          Create Invoice
        </h1>

        {/* BILLING FORM */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-10">
          {/* ITEM TABLE STYLE */}
          <div className="overflow-x-auto">
            <table className="w-full border rounded-xl overflow-hidden">
              <thead className="bg-gray-100 text-left">
                <tr>
                  <th className="p-3">Item</th>
                  <th className="p-3">Qty</th>
                  <th className="p-3">Price</th>
                  <th className="p-3">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t">
                  <td className="p-3">
                    <input
                      type="text"
                      placeholder="Item name"
                      value={formData.items[0].name}
                      onChange={(e) => handleItemChange("name", e.target.value)}
                      className="w-full p-2 border rounded-lg"
                    />
                  </td>

                  <td className="p-3">
                    <input
                      type="number"
                      placeholder="Qty"
                      value={formData.items[0].quantity}
                      onChange={(e) =>
                        handleItemChange("quantity", e.target.value)
                      }
                      className="w-full p-2 border rounded-lg"
                    />
                  </td>

                  <td className="p-3">
                    <input
                      type="number"
                      placeholder="Price"
                      name="price"
                      value={formData.items[0].price}
                      onChange={(e) =>
                        handleItemChange("price", e.target.value)
                      }
                      className="w-full p-2 border rounded-lg"
                    />
                  </td>

                  <td className="p-3 font-semibold text-gray-700">
                    ₹{" "}
                    {formData.items[0].quantity * formData.items[0].price || 0}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* SUMMARY */}
          <div className="grid md:grid-cols-2 gap-6 mt-6">
            <div className="space-y-4">
              <input
                type="number"
                name="tax"
                placeholder="Tax"
                value={formData.tax}
                onChange={handleChange}
                className="w-full p-3 border rounded-xl"
              />

              <input
                type="number"
                name="discount"
                placeholder="Discount"
                value={formData.discount}
                onChange={handleChange}
                className="w-full p-3 border rounded-xl"
              />

              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                className="w-full p-3 border rounded-xl"
              />

              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full p-3 border rounded-xl"
              >
                <option value="">Select Status</option>
                <option value="paid">Paid</option>
                <option value="unpaid">Unpaid</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl">
              <h3 className="font-semibold mb-4">Summary</h3>
              <p>
                Subtotal: ₹{" "}
                {formData.items[0].quantity * formData.items[0].price || 0}
              </p>
              <p>Tax: ₹ {formData.tax || 0}</p>
              <p>Discount: ₹ {formData.discount || 0}</p>
              <hr className="my-2" />
              <p className="font-bold">
                Total: ₹
                {(formData.items[0].quantity * formData.items[0].price || 0) +
                  Number(formData.tax || 0) -
                  Number(formData.discount || 0)}
              </p>
            </div>
          </div>

          {/* NOTES */}
          <textarea
            name="notes"
            placeholder="Notes..."
            value={formData.notes}
            onChange={handleChange}
            className="w-full mt-6 p-3 border rounded-xl"
          />

          <button
            onClick={editId ? updateInvoice : addInvoice}
            className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-xl"
          >
            {editId ? "Update Invoice" : "Create Invoice"}
          </button>
        </div>

        {/* INVOICE LIST */}
        <div className="bg-gray-100 p-4 rounded-xl">
          <div className="grid gap-4">
            {invoices.map((inv) => (
              <div
                key={inv._id}
                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition duration-300 p-4 flex justify-between items-center"
              >
                {/* Left Side - Invoice Info */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">
                    {inv.client.name}
                  </h2>
                  <h4 className="text-lg font-semibold text-gray-800">
                    {inv.client.company}
                  </h4>

                  <p className="text-sm text-gray-600">
                    Total: ₹ {inv.totalAmount}
                  </p>

                  {/* Status Badges */}
                  <div className="flex gap-2 mt-1">
                    <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-600">
                      Due Date: {new Date(inv.dueDate).toLocaleDateString()}
                    </span>

                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        inv.status === "paid"
                          ? "bg-green-100 text-green-600"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {inv.status}
                    </span>
                  </div>
                </div>

                {/* Right Side - Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(inv)}
                    className="px-3 py-1 text-sm bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition"
                  >
                    ✏️ Edit
                  </button>

                  <button
                    onClick={() => deleteInvoice(inv._id)}
                    className="px-3 py-1 text-sm bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                  >
                    🗑 Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* <div className="grid md:grid-cols-2 gap-6">
          {invoices.map((inv) => (
            <div key={inv._id} className="bg-white p-6 rounded-2xl shadow-md">
              <h2 className="font-bold">{inv.client.name}</h2>
              <h3 className="font-bold text-red-500">{inv.client.company}</h3>
              <p className="font-semibold">Status: {inv.status}</p>
              <p>Total: ₹ {inv.totalAmount}</p>
              <p className="text-sm text-gray-500">
                Due: {new Date(inv.dueDate).toLocaleDateString()}
              </p>

              <button
                onClick={() => deleteInvoice(inv._id)}
                className="mt-4 px-3 py-1 bg-red-100 text-red-600 rounded"
              >
                Delete
              </button>
            </div>
          ))}
        </div> */}
      </div>
    </div>
  );
}

export default Invoice;
