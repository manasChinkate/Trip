import express from "express";
import cors from "cors";
import path from "path";
import authRouter from "./features/auth/auth.routes";
import planRouter from "./features/plan/plan.routes";
import itineraryRouter from "./features/itinerary/itinerary.routes";
import bookingRouter from "./features/booking/booking.routes";
import attachmentRouter from "./features/attachment/attachment.routes";

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use("/api/auth", authRouter);
app.use("/api/plans", planRouter);
app.use("/api", itineraryRouter);
app.use("/api", bookingRouter);
app.use("/api", attachmentRouter);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

