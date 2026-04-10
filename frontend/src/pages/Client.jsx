import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Client() {
  const [clients, setClients] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
  });

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [editId, setEditId] = useState(null);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const getClients = async () => {
    let res = await fetch(
      `http://localhost:7000/api/v12/clients/?page=${page}&search=${search}`,
      {
        method: "GET",
        credentials: "include",
      },
    );
    res = await res.json();
    if (res.success) setClients(res.clients);
  };

  useEffect(() => {
    getClients();
  }, [page, search]);

  const addClient = async (e) => {
    e.preventDefault();
    let res = await fetch("http://localhost:7000/api/v12/clients/", {
      method: "POST",
      credentials: "include",
      headers: { "Content-type": "application/json" },
      body: JSON.stringify(formData),
    });
    res = await res.json();
    if (res.success) {
      setFormData({ name: "", email: "", company: "" });
      getClients();
    }
  };

  const handleEdit = (client) => {
    setFormData({
      name: client.name,
      email: client.email,
      company: client.company,
    });
    setEditId(client._id);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    let res = await fetch(`http://localhost:7000/api/v12/clients/${editId}`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-type": "application/json" },
      body: JSON.stringify(formData),
    });
    res = await res.json();
    if (res.success) {
      setFormData({ name: "", email: "", company: "" });
      setEditId(null);
      getClients();
    }
  };

  const deleteClient = async (id) => {
    let res = await fetch(`http://localhost:7000/api/v12/clients/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    res = await res.json();
    if (res.success) getClients();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">
          Client Manager
        </h1>

        {/* Search */}
        <input
          type="text"
          placeholder="Search clients..."
          className="w-full p-3 mb-6 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* Form */}
        <form
          onSubmit={editId ? handleUpdate : addClient}
          className="bg-white p-4 rounded-2xl shadow-md mb-6 grid grid-cols-1 md:grid-cols-4 gap-3"
        >
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleChange}
            className="p-2 border rounded-lg"
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="p-2 border rounded-lg"
          />

          <input
            type="text"
            name="company"
            placeholder="Company"
            value={formData.company}
            onChange={handleChange}
            className="p-2 border rounded-lg"
          />

          <button className="bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700 transition">
            {editId ? "Update" : "Add"}
          </button>
        </form>

        {/* Client Cards */}
        <div className="grid md:grid-cols-2 gap-4">
          {clients.map((c) => (
            <div
              key={c._id}
              className="bg-white p-5 rounded-2xl shadow-md hover:shadow-xl transition"
            >
              <h2 className="text-xl font-semibold text-gray-800">{c.name}</h2>
              <p className="text-gray-600">{c.email}</p>
              <p className="text-gray-400 text-sm">{c.company}</p>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => handleEdit(c)}
                  className="px-3 py-1 bg-blue-100 text-blue-600 rounded-lg"
                >
                  Edit
                </button>

                <button
                  onClick={() => deleteClient(c._id)}
                  className="px-3 py-1 bg-red-100 text-red-600 rounded-lg"
                >
                  Delete
                </button>

                <button
                  onClick={() => navigate(`/clients/${c._id}/invoices`)}
                  className="px-3 py-1 bg-green-500 text-white rounded-lg"
                >
                  Invoices
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex justify-center items-center gap-4 mt-6">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            className="px-4 py-2 bg-gray-300 rounded-lg"
          >
            Prev
          </button>

          <span className="font-medium">Page {page}</span>

          <button
            onClick={() => setPage(page + 1)}
            className="px-4 py-2 bg-gray-300 rounded-lg"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default Client;
