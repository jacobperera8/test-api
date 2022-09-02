const chromium = require('chrome-aws-lambda');
const {S3} = require("aws-sdk");
const fs = require("fs");
const path = require("path");
const json2xls = require('json2xls');

const VIEWPORT_WIDTHS = [
    480,
    620,
    768,
    990,
    1200,
    1600,
    1920
]

// const XY_MAP = {
//     1920: 1600,
//     1600: 1200,
//     1200: 990,
//     990: 768,
//     768: 620,
//     620: 480
// }

async function collectCSSFromPage(page, width) {
    await page.setViewport({width, height: 900});

    return await page.evaluate(() => {

        function traversDOM(element, parent, nodes, variable) {
            nodes = nodes || [];

            if (element.nodeType === 1) {
                let node = {};
                nodes.push(getAllStyles(element, variable));

                for (let i = 0; i < element.childNodes.length; i++) {
                    traversDOM(element.childNodes[i], node, nodes, variable);
                }
            }
            return nodes;
        }

        function getAllStyles(elem, variable) {
            if (!elem) return []; // Element does not exist, empty list.
            let win = document.defaultView || window, style, styleNode = [];
            const allAllStylesMap = {};
            if (win.getComputedStyle) { /* Modern browsers */
                style = win.getComputedStyle(elem, '');

                allAllStylesMap[`Breakpoint-${variable}`] = window.innerWidth;
                allAllStylesMap[`HTML Element-${variable}`] = elem.tagName;
                allAllStylesMap[`CSS Class-${variable}`] = elem.className;

                for (let i = 0; i < style.length; i++) {
                    allAllStylesMap[`${style[i]}-${variable}`] = style.getPropertyValue(style[i]);
                    styleNode.push(allAllStylesMap);
                }
            } else if (elem.currentStyle) { /* IE */
                style = elem.currentStyle;
                for (let name in style) {
                    styleNode.push(name + ':' + style[name]);
                }
            } else { /* Ancient browser..*/
                style = elem.style;
                for (let i = 0; i < style.length; i++) {
                    styleNode.push(style[i] + ':' + style[style[i]]);
                }
            }
            return allAllStylesMap;
        }

        const styleMap = {};
        ['xvar', 'yvar'].forEach(_variable => {
            styleMap[_variable] = traversDOM(document.body, undefined, undefined, _variable)
        })
        return styleMap;
    });
}


async function saveDatasetOnTmpDirAndS3(styleData, tmpDir, fileKeyPath, breakpoint) {
    const tmpFilepath = path.join(tmpDir, "Dataset.xlsx")
    console.log('saveDatasetOnTmpDirAndS3 called')

    const xls = json2xls(styleData);

    fs.writeFileSync(tmpFilepath, xls, 'binary');
    console.log('writeFileSync completed')

    const s3 = new S3();
    const fileContent = fs.readFileSync(tmpFilepath)
    console.log('---------------------------------------------fileContent---------------------------------------------')
    console.log(fileContent)
    console.log('---------------------------------------------fileContent---------------------------------------------')

    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `${fileKeyPath}/datasets/Dataset-${breakpoint}.xlsx`,
        Body: fileContent,
        ContentType: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
    }
    return await s3.upload(params).promise();
}

exports.saveScrappedDataV2 = async (XY_MAP, tmpHTMLPath, tmpDir, fileKeyPath) => {
    console.log("saveScrappedData - REQ RECEIVED: ", tmpHTMLPath)
    const url = 'file://' + tmpHTMLPath
    console.log('this is the url', url)

    const breakpoint = Object.keys(XY_MAP).toString()

    const viewPortDataList = await (async () => {
        // const browser = await puppeteer.launch();

        // launch a headless browser
        const browser = await chromium.puppeteer.launch({
            args: chromium.args,
            defaultViewport: chromium.defaultViewport,
            executablePath: await chromium.executablePath,
            headless: chromium.headless,
        });

        const page = await browser.newPage();
        await page.goto(url, {waitUntil: 'networkidle0', timeout: 0});
        // await page.setDefaultNavigationTimeout(0);
        const styleMap = {};

        for (let index = 0; index < VIEWPORT_WIDTHS.length; index++) {
            const width = VIEWPORT_WIDTHS[index];

            styleMap[width] = await collectCSSFromPage(page, width)
        }

        // console.log("DATA FROM EVAL ", styleMap)
        await browser.close();

        return styleMap;
    })();

    const styleData = [];

    Object.keys(XY_MAP).forEach(key => {
        const styleX = viewPortDataList[key]['xvar'];
        const styleY = viewPortDataList[XY_MAP[key]]['yvar'];

        for (let index = 0; index < styleX.length; index++) {
            const _styleX = styleX[index];
            const _styleY = styleY[index];

            styleData.push({..._styleX, ..._styleY});
        }
    })

    console.log('===================================stylesdata===================================')
    console.log(styleData)
    console.log('===================================stylesdata===================================')


    return await saveDatasetOnTmpDirAndS3(styleData, tmpDir, fileKeyPath, breakpoint)
}

