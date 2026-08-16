import express, { Request, Response } from "express";
import cors from "cors";
import authRouter from "./features/auth/auth.routes";

const app = express();
const port = 3000;
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

app.use("/api/auth", authRouter);
