import { Router, type IRouter } from "express";
import healthRouter from "./health";
import storageRouter from "./storage";
import geminiRouter from "./gemini";

const router: IRouter = Router();

router.use(healthRouter);
router.use(storageRouter);
router.use(geminiRouter);

export default router;
