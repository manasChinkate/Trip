import express from "express";
import cors from "cors";
import authRouter from "./features/auth/auth.routes";
import planRouter from "./features/plan/plan.routes";

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRouter);
app.use("/api/plans", planRouter);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
