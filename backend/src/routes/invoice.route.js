import { Router } from "express";
import verifyJwt from "../middlewares/auth.middleware.js";
import {
    createInvoice,
    dashboardStats,
    deleteInvoice,
    getInvoices,
    getSingleInvoice,
    updateInvoice,
} from "../controllers/invoice.controller.js";

const router = Router();

router.route('/dashboard').get(verifyJwt, dashboardStats)
router
    .route("/:clientId")
    .post(verifyJwt, createInvoice)
    .get(verifyJwt, getInvoices);
router
    .route("/:clientId/invoice/:invoiceId")
    .get(verifyJwt, getSingleInvoice)
    .delete(verifyJwt, deleteInvoice)
    .put(verifyJwt, updateInvoice);



export default router;
