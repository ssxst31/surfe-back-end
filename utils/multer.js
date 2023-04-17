import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads");
  },

  filename: function (req, file, cb) {
    const timestamp = new Date().toISOString().replace(/:/g, "-").slice(0, 13);

    cb(null, timestamp + "-" + decodeURIComponent(file.originalname));
  },
});

export const upload = multer({
  storage: storage,
  limits: { fileSize: 1000000 },
});
