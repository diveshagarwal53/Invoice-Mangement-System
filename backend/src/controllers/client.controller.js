import Client from "../models/client.model.js";
import asyncHandler from "../utils/asynHandler.js";

const createClient = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    const { name, email, company } = req.body;

    if (!userId) {
        return res
            .status(403)
            .json({ success: false, message: "Unauthorized request" });
    }

    if (!name && !email) {
        return res
            .status(400)
            .json({ success: false, message: "Name and Email are required" });
    }

    const client = await Client.create({
        name,
        email,
        company,
        createdBy: userId,
    });

    return res
        .status(201)
        .json({ success: true, message: "Client created successfully", client });
});

const getClients = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    if (!userId) {
        return res
            .status(403)
            .json({ success: false, message: "Unauthorized request" });
    }

    let { page = 1, limit = 10, search = "" } = req.query;

    page = Math.max(1, Number(page));
    limit = Math.min(50, Number(limit));
    const skip = (page - 1) * limit;

    const filter = {
        createdBy: userId,
        isDeleted: false,
    };
    console.log("search:", search);

    if (search) {
        filter.$or = [
            { name: { $regex: search, $options: "i" } },
            { company: { $regex: search, $options: "i" } }
        ];
    }

    const clients = await Client.find(filter)
        .limit(limit)
        .skip(skip)
        .populate("createdBy", "name company");

    if (clients.length === 0) {
        return res
            .status(200)
            .json({ success: true, message: "clients not found", clients: [] });
    }

    const totalClients = await Client.countDocuments(filter);

    return res.status(200).json({
        success: true,
        message: "Clients fetched successfully",
        clients,
        totalClients,
        currentPage: page,
        totalPages: Math.ceil(totalClients / limit),
    });
});

const getSingleClient = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    if (!userId) {
        return res
            .status(403)
            .json({ success: false, message: "Unauthorized request" });
    }

    const { clientId } = req.params;

    const client = await Client.findOne({
        _id: clientId,
        createdBy: userId,
        isDeleted: false,
    }).populate('createdBy', 'name')
    if (!client) {
        return res
            .status(404)
            .json({ success: false, message: "Client not found" });
    }

    return req
        .status(200)
        .json({ success: true, message: "Client fetched successfully", client });
});

const deleteClient = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    if (!userId) {
        return res
            .status(403)
            .json({ success: false, message: "Unauthorized request" });
    }

    const { clientId } = req.params;

    const client = await Client.findOne({
        _id: clientId,
        createdBy: userId,
        isDeleted: false,
    });
    if (!client) {
        return res
            .status(404)
            .json({ success: false, message: "Client not found" });
    }

    client.isDeleted = true;
    await client.save();

    return res
        .status(200)
        .json({ success: true, message: "Client deleted successfully" });
});

const updateClient = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    if (!userId) {
        return res
            .status(403)
            .json({ success: false, message: "Unauthorized request" });
    }

    const { clientId } = req.params;
    const { name, email, company } = req.body;

    const client = await Client.findOne({
        _id: clientId,
        createdBy: userId,
        isDeleted: false,
    });

    if (!client) {
        return res
            .status(404)
            .json({ success: false, message: "Client not found" });
    }

    if (name) client.name = name;
    if (email) client.email = email;
    if (company) client.company = company;
    await client.save();

    return res
        .status(200)
        .json({ success: true, message: "Client updated successfully", client });
});

export { createClient, getClients, getSingleClient, deleteClient, updateClient }
