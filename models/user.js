import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      required: function () {
        return !this.provider; // required only if not Google
      },
    },
    lastname: {
      type: String,
      required: function () {
        return !this.provider;
      },
    },
    address: {
      type: String,
      required: function () {
        return !this.provider;
      },
    },
    phoneNumber: {
      type: String,
      required: function () {
        return !this.provider;
      },
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: function () {
        return !this.provider;
      },
    },
    fullName: String,
    provider: String, // "google" for Google login
    role: { type: String, enum: ["user", "admin"], default: "user" }, // ✅ ADDED
  },
  { timestamps: true }
);

// ---------------- PRE-SAVE HOOK ----------------
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// ---------------- METHOD: Compare password ----------------
userSchema.methods.comparePassword = async function (enteredPassword) {
  if (!this.password) return false; // Google users may not have password
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("User", userSchema);
