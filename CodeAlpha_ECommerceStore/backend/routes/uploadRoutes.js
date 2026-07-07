const express = require("express");

const router = express.Router();

const upload = require("../middleware/uploadMiddleware");

const { protect } = require("../middleware/authMiddleware");

router.post(

    "/profile",

    protect,

    upload.single("image"),

    (req, res) => {

        res.json({

            image:
                "/uploads/profiles/" +
                req.file.filename

        });

    }

);

module.exports = router;