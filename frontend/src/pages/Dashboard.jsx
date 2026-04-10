import React from "react";
import { useState } from "react";
import { useEffect } from "react";
import {
  Bar,
  BarChart,
  LabelList,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function Dashboard() {
  const [data, setData] = useState(null);

  const getDasboard = async () => {
    let res = await fetch("http://localhost:7000/api/v12/invoices/dashboard", {
      method: "GET",
      credentials: "include",
    });
    res = await res.json();
    if (res.success) {
      setData(res);
    }
  };

  useEffect(() => {
    getDasboard();
  }, []);

  if (!data) return <p className="p-6">Loading...</p>;
  const chartData = [
    { name: "Paid", value: data.paid },
    { name: "Unpaid", value: data.unpaid },
    { name: "Overdue", value: data.overdue },
  ];

  console.log(data.monthlyData);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard</h1>

        {/* STATS card */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className="bg-zinc-400 p-6 rounded-2xl shadow">
            <p className="text-white-500">Total Revenue</p>
            <h2 className="text-2xl font-bold">₹ {data.totalRevenue}</h2>
          </div>

          <div className="bg-green-100 p-6 rounded-2xl">
            <p className="text-green-700">Paid</p>
            <h2 className="text-2xl font-bold text-green-800">₹ {data.paid}</h2>
          </div>

          <div className="bg-yellow-100 p-6 rounded-2xl">
            <p className="text-yellow-700">Unpaid</p>
            <h2 className="text-2xl font-bold text-yellow-800">
              ₹ {data.unpaid}
            </h2>
          </div>

          <div className="bg-red-100 p-6 rounded-2xl">
            <p className="text-red-700">Overdue</p>
            <h2 className="text-2xl font-bold text-red-800">
              ₹ {data.overdue}
            </h2>
          </div>
        </div>

        {/* Chart section */}
        <div className="bg-white p-6 rounded-2xl shadow mb-10">
          <h2 className="text-xl font-semibold mb-4">Revenue overview</h2>

          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Chart */}
        <div className="bg-white p-6 rounded-2xl shadow mb-10">
          <h2 className="text-xl font-semibold mb-4">Monthly Revenue</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data?.monthlyData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="total" strokeWidth={3}>
                <LabelList dataKey="total" position="top" />
              </Line>
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Invoices */}
        <div className="bg-white p-6 rounded-2xl shadow">
          <h2 className="text-xl text-red-600 font-semibold mb-4">
            Recent Invoices
          </h2>

          {data.recentInvoices.length === 0 && (
            <p className="text-gray-500">No invoices found</p>
          )}

          <div className="space-y-4">
            {data.recentInvoices.map((inv) => (
              <div
                key={inv._id}
                className="flex justify-between items-center border-b pb-3"
              >
                <div>
                  <p className="font-medium">{inv.client?.name || "Client"}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(inv.dueDate).toLocaleDateString()}
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-semibold">₹ {inv.totalAmount}</p>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      inv.status === "paid"
                        ? "bg-green-100 text-green-600"
                        : inv.status === "unpaid"
                          ? "bg-yellow-100 text-yellow-600"
                          : "bg-red-100 text-red-600"
                    }`}
                  >
                    {inv.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
