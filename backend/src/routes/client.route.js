import { Router } from "express";
import verifyJwt from "../middlewares/auth.middleware.js";
import {
    createClient,
    deleteClient,
    getClients,
    getSingleClient,
    updateClient,
} from "../controllers/client.controller.js";

const router = Router();

router.route("/").post(verifyJwt, createClient).get(verifyJwt, getClients);
router
    .route("/:clientId")
    .get(verifyJwt, getSingleClient)
    .delete(verifyJwt, deleteClient)
    .put(verifyJwt, updateClient);

export default router;
