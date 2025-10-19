import express from 'express'
import { createOrder } from '../controllers/orderController.js'
import { getOrder } from '../controllers/orderController.js'


const orderRouter = express.Router();
orderRouter.post("/",createOrder) 
orderRouter.get("/:page/:limit",getOrder)


export default orderRouter;
