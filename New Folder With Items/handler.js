require("dotenv").config();
const serverless = require("serverless-http");
const express = require("express");
const app = express();
const multer = require("multer");
const fs = require("fs");
const os = require("os");
const path = require("path");
const uuid = require("uuid").v4;

const {s3UploadV2} = require("./src/controller/s3UploadController");
const {saveScrappedDataV1} = require("./src/controller/scrapeController-v1");
const {saveScrappedDataV2} = require("./src/controller/scrapeController-v2");
const {write} = require("./src/controller/tmpDirWriteController");
const {PostData} = require("./src/controller/dbController");
const {Generate_CSS} = require("./src/controller/generateCSSController");

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    console.log('file', file)
    if (file.mimetype === 'text/html' && file.fieldname === 'html') {
        cb(null, true);
    } else if (file.mimetype === 'text/css' && file.fieldname === 'css') {
        cb(null, true);
    } else {
        cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE"), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {fileSize: 1000000000, files: 2},
});

const multiUpload = upload.fields([
    {name: "html", maxCount: 1},
    {name: "css", maxCount: 1},
]);

app.get("/", (req, res) => {
    return res.status(200).json({
        message: "Hello from root!",
    });
});

app.get("/hello", (req, res) => {
    return res.status(200).json({
        message: "Hello from path!",
    });
});

app.post("/database-post", async (req, res) => {
    const resp = await PostData({
        "userId": "11234"  ,
        "name": "John Doe",
        "country": "USA",
    });
    return res.status(200).json({
        resp: resp
    });
});

app.post("/upload", multiUpload, async (req, res) => {
    try {
        const uploadResults = await s3UploadV2(req.files);

        return res.json({
            status: "success",
            uploadResults: uploadResults,
        });

    } catch (err) {
        console.log(err);
    }
});

// const uploadToS3V22 = async (filepath, key) => {
//     const s3 = new S3();
//     const fileContent = fs.readFileSync(filepath)
//     console.log(fileContent)
//     const params = {
//         Bucket: process.env.AWS_BUCKET_NAME,
//         Key: key,
//         Body: fileContent
//     }
//     return await s3.upload(params).promise();
// }


app.get("/test-tmp", async (req, res) => {
    const appPrefix = `${uuid()}-`;

    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), appPrefix));
    let filepathHTML = path.join(tmpDir, 'index.html')
    let filepathCSS = path.join(tmpDir, 'styles.css')

    const fileKeyHTML = 'unprocessed-data/2022-07-22T18:20:31.292Z-f52c283c-bd42-4b89-b5f7-18ebd2b80536/index.html';
    const fileKeyCSS = 'unprocessed-data/2022-07-22T18:20:31.292Z-f52c283c-bd42-4b89-b5f7-18ebd2b80536/styles.css';
    const fileKeyPath = 'unprocessed-data/2022-07-22T18:20:31.292Z-f52c283c-bd42-4b89-b5f7-18ebd2b80536';

    await write(fileKeyHTML, tmpDir, filepathHTML).then(function (successMessage1) {
        console.log(successMessage1);
        write(fileKeyCSS, tmpDir, filepathCSS).then(async function (successMessage2) {
            console.log(successMessage2);


            // const resultsHTML = await uploadToS3V22(filepathHTML, `unprocessed-data/testing-temp/login-index.html`)
            // const resultsCSS = await uploadToS3V22(filepathCSS, `unprocessed-data/testing-temp/login-styles.css`);
            const styleDataResp = await saveScrappedDataV1(filepathHTML, tmpDir, fileKeyPath)

            return res.status(200).json({
                tmpResp: {successMessage1, successMessage2},
                // resultsHTML: resultsHTML,
                // resultsCSS: resultsCSS,
                styleDataResp: styleDataResp
            });

        }, function (errorMessage) {
            console.log(errorMessage);
        })
    }, function (errorMessage) {
        console.log(errorMessage);
    })
});

app.post("/upload-scrape", multiUpload, async (req, res) => {
    try {
        console.log('loading func')
        const uploadResults = await s3UploadV2(req.files);

        const fileKeyHTML = uploadResults[0].key
        const fileKeyCSS = uploadResults[1].key
        const fileKeyPath = uploadResults[0].key.split("/")[0] + "/" + uploadResults[0].key.split("/")[1]

        const appPrefix = `${uuid()}-`;

        const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), appPrefix));

        console.log(`tmpDir - ${tmpDir}`)

        let filepathHTML = path.join(tmpDir, 'index.html')
        let filepathCSS = path.join(tmpDir, 'styles.css')

        await write(fileKeyHTML, tmpDir, filepathHTML).then(function (successMessage1) {
            console.log(successMessage1);
            write(fileKeyCSS, tmpDir, filepathCSS).then(async function (successMessage2) {
                console.log(successMessage2);

                console.log('filepathHTML, tmpDir, fileKeyPat', filepathHTML, tmpDir, fileKeyPath)
                const styleDataResp = await saveScrappedDataV1(filepathHTML, tmpDir, fileKeyPath)

                return res.status(200).json({
                    uploadResults: uploadResults,
                    tmpResp: {successMessage1, successMessage2},
                    Dataset: styleDataResp
                });

            }, function (errorMessage) {
                console.log(errorMessage);
            })
        }, function (errorMessage) {
            console.log(errorMessage);
        })

    } catch (err) {
        console.log(err);
    }
});


app.post("/upload-scrape-v2", multiUpload, async (req, res) => {
    try {
        const XY_MAP = [
            {1920: 1600},
            {1600: 1200},
            {1200: 990},
            {990: 768},
            {768: 620},
            {620: 480},
        ]

        console.log('loading')
        const uploadResults = await s3UploadV2(req.files);

        const fileKeyHTML = uploadResults[0].key
        const fileKeyCSS = uploadResults[1].key
        const fileKeyPath = uploadResults[0].key.split("/")[0] + "/" + uploadResults[0].key.split("/")[1]

        const appPrefix = `${uuid()}-`;

        const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), appPrefix));
        let filepathHTML = path.join(tmpDir, 'index.html')
        let filepathCSS = path.join(tmpDir, 'styles.css')

        await write(fileKeyHTML, tmpDir, filepathHTML).then(function (successMessage1) {
            console.log(successMessage1);
            write(fileKeyCSS, tmpDir, filepathCSS).then(async function (successMessage2) {
                console.log(successMessage2);

                console.log('filepathHTML, tmpDir, fileKeyPat', filepathHTML, tmpDir, fileKeyPath)
                // const styleDataResp = await saveScrappedData(filepathHTML, tmpDir, fileKeyPath)


                const styleDataRespArr = []

                for (const value of XY_MAP) {
                    console.log('value -00-000', value)
                    const styleDataResp = await saveScrappedDataV2(value, filepathHTML, tmpDir, fileKeyPath)
                    styleDataRespArr.push(styleDataResp)
                }

                return res.status(200).json({
                    uploadResults: uploadResults,
                    tmpResp: {successMessage1, successMessage2},
                    Dataset: styleDataRespArr
                });

            }, function (errorMessage) {
                console.log(errorMessage);
            })
        }, function (errorMessage) {
            console.log(errorMessage);
        })

    } catch (err) {
        console.log(err);
    }
});

app.post("/generate-css", async (req, res) => {

    const url = 'https://grammarly-v3.netlify.app'
    const fileKeyPath = 'testing'

    const resp = await Generate_CSS(url, fileKeyPath)

    return res.status(200).json({
        url: url,
        resp: resp
    });
});

app.use(express.json())

app.use((req, res) => {
    return res.status(404).json({
        error: "Not Found",
    });
});

module.exports.handler = serverless(app);
