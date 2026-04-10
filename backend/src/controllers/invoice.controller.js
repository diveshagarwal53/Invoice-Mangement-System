import Client from "../models/client.model.js";
import Invoice from "../models/invoice.model.js";
import asyncHandler from "../utils/asynHandler.js";

const createInvoice = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    if (!userId) {
        return res
            .status(403)
            .json({ success: false, message: "Unauthorized request" });
    }

    const { clientId } = req.params;
    const { items, tax, discount, status, dueDate, notes } = req.body;
    console.log(req.body)

    if (!items || items.length === 0 || !dueDate) {
        return res
            .status(400)
            .json({ success: false, message: "Items and dueDate are required" });
    }

    const existingClient = await Client.findOne({
        _id: clientId,
        createdBy: userId,
        isDeleted: false,
    });
    if (!existingClient) {
        return res.status(404).json({
            success: false,
            message: "Client does not exists or not authorized",
        });
    }

    const calculatedItems = items.map((item) => {
        const quantity = Number(item.quantity);
        const price = Number(item.price);

        if (quantity <= 0 || price < 0) {
            throw new Error("Invalid item data");
        }

        return {
            name: item.name,
            quantity,
            price,
            total: quantity * price,
        };
    });

    const invoice = await Invoice.create({
        client: clientId,
        items: calculatedItems,
        tax,
        discount,
        status,
        dueDate,
        notes,
        createdBy: userId,
    });

    return res
        .status(201)
        .json({ success: true, message: "Invoice created successfully", invoice });
});

const getInvoices = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    if (!userId) {
        return res
            .status(403)
            .json({ success: false, message: "Unauthorized request" });
    }

    const { clientId } = req.params;
    let { page = 1, limit = 10, search = "" } = req.query;
    page = Number(page);
    limit = Number(limit);

    const skip = (page - 1) * limit;

    const filter = {
        client: clientId,
        createdBy: userId,
        isDeleted: false,
    };

    if (search) {
        filter.$or = [{ status: { $regex: search, $options: "i" } }];
    }

    const invoices = await Invoice.find(filter)
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .populate("client", "name company")
        .populate("createdBy", "name");
    if (invoices.length === 0) {
        return res
            .status(200)
            .json({ success: true, message: "No invoice found", invoices: [] });
    }

    const totalInvoices = await Invoice.countDocuments(filter);

    return res.status(200).json({
        success: true,
        message: "Invoices fetched successfully",
        invoices,
        totalInvoices,
        totalPages: Math.ceil(totalInvoices / limit),
        currentPage: page,
    });
});

const getSingleInvoice = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    if (!userId) {
        return res
            .status(403)
            .json({ success: false, message: "Unauthorized request" });
    }

    const { clientId, invoiceId } = req.params;

    const invoice = await Invoice.findOne({
        _id: invoiceId,
        client: clientId,
        createdBy: userId,
        isDeleted: false,
    });
    if (!invoice) {
        return res
            .status(404)
            .json({ success: false, message: "Invoice does not exists" });
    }

    return res
        .status(200)
        .json({ success: true, message: "Invoice fetched successfully", invoice });
});

const deleteInvoice = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    if (!userId) {
        return res
            .status(403)
            .json({ success: false, message: "Unauthorized request" });
    }

    const { clientId, invoiceId } = req.params;

    const invoice = await Invoice.findOne({
        _id: invoiceId,
        client: clientId,
        createdBy: userId,
        isDeleted: false,
    });
    if (!invoice) {
        return res
            .status(404)
            .json({ success: false, message: "Invoice does not exists" });
    }

    invoice.isDeleted = true;
    await invoice.save();

    return res
        .status(200)
        .json({ success: true, message: "Invoice deleted successfully" });
});

const updateInvoice = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    if (!userId) {
        return res
            .status(403)
            .json({ success: false, message: "Unauthorized request" });
    }

    const { clientId, invoiceId } = req.params;
    const { items, tax, discount, status, dueDate, notes } = req.body;

    const invoice = await Invoice.findOne({
        _id: invoiceId,
        client: clientId,
        createdBy: userId,
        isDeleted: false,
    });
    if (!invoice) {
        return res
            .status(404)
            .json({ success: false, message: "Invoice does not exists" });
    }

    if (items) {
        const calculatedItems = items.map((item) => {
            const quantity = Number(item.quantity);
            const price = Number(item.price);

            if (quantity <= 0 || price < 0) {
                throw new Error("Invalid item data");
            }

            return {
                name: item.name,
                quantity,
                price,
                total: quantity * price,
            };
        });

        invoice.items = calculatedItems;
    }

    if (tax !== undefined) invoice.tax = tax;
    if (discount) invoice.discount = discount;
    if (status) invoice.status = status;
    if (dueDate) invoice.dueDate = dueDate;
    if (notes) invoice.notes = notes;
    await invoice.save();

    return res
        .status(200)
        .json({ success: true, message: "Invoice updated successfully", invoice });
});

const dashboardStats = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    if (!userId) {
        return res
            .status(403)
            .json({ success: false, message: "Unauthorized request" });
    }

    const invoices = await Invoice.aggregate([
        {
            $match: {
                createdBy: userId,
                isDeleted: false,
            },
        },
        {
            $group: {
                _id: "$status",
                total: { $sum: "$totalAmount" },
            },
        },
    ]);

    const defaultStats = {
        paid: 0,
        unpaid: 0,
        overdue: 0,
    };

    invoices.forEach((invoice) => {
        defaultStats[invoice._id] = invoice.total;
    });


    const monthlyStats = await Invoice.aggregate([
        {
            $match: {
                createdBy: userId,
                isDeleted: false
            }
        },
        {
            $group: {
                _id: { $month: "$createdAt" },
                total: { $sum: "$totalAmount" }
            }
        },
        {
            $sort: { _id: 1 },
        },
    ])

    const months = [
        "", "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    const formattedMonthlyStats = monthlyStats.map((stats) => ({
        name: months[stats._id],
        total: stats.total
    }))

    const totalRevenue =
        defaultStats.paid + defaultStats.unpaid + defaultStats.overdue;

    const recentInvoices = await Invoice.find({ createdBy: userId, isDeleted: false }).sort({ createdAt: -1 }).limit(5).populate("client", "name email")

    return res
        .status(200)
        .json({
            success: true,
            message: "Dashboard stats fetched successfully",
            totalRevenue,
            ...defaultStats,
            recentInvoices,
            monthlyData: formattedMonthlyStats
        });
});

export {
    createInvoice,
    getInvoices,
    getSingleInvoice,
    deleteInvoice,
    updateInvoice,
    dashboardStats
};
