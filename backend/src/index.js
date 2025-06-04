import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import {connectDB} from './lib/db.js';
import transactionRoutes from "./routes/transaction.route.js"
import authRoutes from "./routes/auth.route.js"
import path from 'path';


dotenv.config();
const app = express();
const PORT = process.env.PORT;
const __dirname = path.resolve();


app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());
app.use(cors(
    {
        origin: "http://localhost:5173",
        credentials: true
    }
));
app.use("/api/transaction", transactionRoutes);
app.use("/api/auth", authRoutes);

if(process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname,"../frontend/dist")));
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname,"../frontend", "dist", "index.html"));
    });
    
}


app.listen(PORT, () => {
    console.log('Server is running on port '+PORT);
    connectDB();
});