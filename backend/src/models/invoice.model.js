import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    total: {
        type: Number,
        required: true,
        min: 0
    }

}, { _id: false })

const invoiceSchema = new mongoose.Schema({
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
        required: true
    },
    items: {
        type: [itemSchema],
        validate: [(val) => val.length > 0, "At least one item is required"]
    },
    subTotal: {
        type: Number,
        required: true,
        min: 0
    },
    tax: {
        type: Number,
        default: 0,
        min: 0,
    },
    discount: {
        type: Number,
        default: 0,
        min: 0,
    },
    totalAmount: {
        type: Number,
        required: true,
        min: 0,
    },
    status: {
        type: String,
        enum: ['paid', 'unpaid', 'overdue'],
        default: 'unpaid'
    },
    issueDate: {
        type: Date,
        default: Date.now,
    },
    dueDate: {
        type: Date,
        required: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    notes: {
        type: String,
        trim: true,
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },

}, { timestamps: true })

invoiceSchema.index({ createdBy: 1, status: 1 })
invoiceSchema.index({ client: 1 })

invoiceSchema.pre("validate", function () {
    if (this.items && this.items.length > 0) {
        this.subTotal = this.items.reduce((acc, item) => acc + item.total, 0)
        this.totalAmount = this.subTotal + this.tax - this.discount
    }
    return
})

const Invoice = mongoose.model('Invoice', invoiceSchema)

export default Invoice;