import express  from "express";
import pedidoRouter from "./routes/Delivery.js"

const app = express();


app.use(express.json());
app.use("/Delivery",pedidoRouter);


app.listen(3000, async() => {
    console.log("API STARTED");
});
 



