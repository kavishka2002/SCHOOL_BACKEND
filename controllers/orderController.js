import Order from '../models/order.js';  
import Product from '../models/product.js';

export async function createOrder(req, res) {
    try {
        if (!req.user) {
            res.status(401).json({ message: "Please login to create the order" });
            return;
        }

        // 🔹 Generate new OrderId
        const latestOrder = await Order.find().sort({ date: -1 }).limit(1);
        let orderId = "CBC00201"; // default first ID

        if (latestOrder.length > 0) {
            const lastOrderIdString = latestOrder[0].orderId;
            const lastOrderIdWithoutPrefix = lastOrderIdString.replace("CBC", "");
            const lastOrderIdInteger = parseInt(lastOrderIdWithoutPrefix);
            const newOrderIdInteger = lastOrderIdInteger + 1;
            const newOrderIdWithoutPrefix = newOrderIdInteger.toString().padStart(5, "0");
            orderId = "CBC" + newOrderIdWithoutPrefix;
        }

        // 🔹 Build items list
        const items = [];
        let total = 0;

        if (req.body.items && Array.isArray(req.body.items)) {
            for (let i = 0; i < req.body.items.length; i++) {
                let item = req.body.items[i];

                let product = await Product.findOne({ productId: item.productId });
                if (!product) {
                    res.status(400).json({ message: "Product not found" });
                    return;
                }

                items[i] = {
                    productId: product.productId,
                    name: product.name,
                    image: product.images && product.images.length > 0 ? product.images[0] : "",
                    price: product.price,
                    qty: item.qty,
                };

                total += product.price * item.qty;
            }
        } else {
            res.status(400).json({ message: "Items must be an array" });
            return;
        }

        // 🔹 Create new order
        const order = new Order({
            orderId: orderId,
            email: req.user.email,
            name: req.user.firstName + " " + (req.user.lastName || ""), // fixed typo
            address: req.body.address,
            phone: req.body.phone,
            items: items,
            total: total,
        });

        const result = await order.save();

        res.status(201).json({
            message: "Order created successfully",
            result: result,
        });
    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message,
        });
    }
}

export async function getOrder(req, res) {

    const page = parseInt(req.params.page) || 1;
    const limit = parseInt(req.params.limit) || 10;

    if (!req.user) {
        res.status(401).json({ message: "Please login to get the order" });
        return;
    }

    try {
        if (req.user.role === "admin") {
            const orderCount = await Order.countDocuments();
            const totalPages = Math.ceil(orderCount / limit);
        
            const orders = await Order.find().skip((page-1) *limit ).limit(limit).sort({date: -1});
            res.json(
                {
                  orders: orders,
                  totalPages: totalPages,
                }
            );
        } else {
            const orderCount = await Order.countDocuments({ email: req.user.email });
            const totalPages = Math.ceil(orderCount / limit);
            const orders = await Order.find({ email: req.user.email }).skip((page-1) *limit ).limit(limit).sort({ date: -1 });
            res.json(
                {
                  orders: orders,
                  totalPages: totalPages,
                }
            );
        }
    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message,
        });
    }
}
