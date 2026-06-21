const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: function requiredPassword() {
        return this.authProvider === "local";
      },
      select: false,
    },


    profilePicture: String,

    authProvider: {
      type: String,
      enum: ["local", "google", "linkedin"],
      default: "local",
    },

    googleId: {
      type: String,
      sparse: true,
      index: true,
    },

    linkedinId: {
      type: String,
      sparse: true,
      index: true,
    },

    linkedinHeadline: String,

    isEmailVerified: {
      type: Boolean,
      default: false,
    },


    refreshTokenHash: {
      type: String,
      select: false,
    },
    passwordResetTokenHash: {
      type: String,
      select: false,
    },
    passwordResetExpires: Date,

    emailVerificationTokenHash: {
      type: String,
      select: false,
    },
    emailVerificationExpires: Date,

    role: {
      type: String,
      default: "student",
      enum: ["student", "admin"],
    },
  },
  {
    timestamps: true,
  }
);

userSchema.index(
  { email: 1 },
  {
    unique: true,
    collation: { locale: "en", strength: 2 },
  }
);
userSchema.index({ createdAt: -1 });

module.exports = mongoose.model("User", userSchema);
