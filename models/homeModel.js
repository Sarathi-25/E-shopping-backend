// models/homeModel.js
import mongoose from "mongoose";

const homeSchema = mongoose.Schema(
  {
    slides: [{ type: String }],
  },
  { timestamps: true }
);

const Home = mongoose.model("Home", homeSchema);
export default Home;
