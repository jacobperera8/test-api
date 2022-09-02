const {S3} = require("aws-sdk");
const fs = require("fs");

exports.write =  (fileKey, tmpDir, filepath) => {
    return new Promise((resolve, reject) => {
        const s3 = new S3();
        const options = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: fileKey,
        };

        const stream = fs.createWriteStream(filepath);

        const streamY = s3.getObject(options).createReadStream().pipe(stream);

        streamY.on('close', async function () {
            if (fs.existsSync(filepath)) {
                console.log('file exists.');

                resolve({
                    message: `file created : ${filepath}`
                })
            } else {
                reject('no files')
            }
        });

    });
}