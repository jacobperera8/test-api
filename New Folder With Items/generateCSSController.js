const chromium = require('chrome-aws-lambda');
const fs = require("fs");
// const stream = require('stream');
const path = require("path");
const os = require("os");
const json2xls = require("json2xls");
const {S3} = require("aws-sdk");
const uuid = require("uuid").v4;
const util = require('util')
// import CSS_ELEMENTS from '../utils/css.properties.with.default.values.js'

const CSS_ELEMENTS = {
    "accent-color": "auto",
    "align-content": "stretch",
    "align-items": "stretch",
    "align-self": "auto",
    "alignment-baseline": "auto",
    "animation-delay": "0s",
    "animation-direction": "normal",
    "animation-duration": "0s",
    "animation-fill-mode": "none",
    "animation-iteration-count": "1",
    "animation-name": "none",
    "animation-play-state": "running",
    "animation-timing-function": "ease",
    // "app-region": "none",
    "appearance": "none",
    "backdrop-filter": "none",
    "backface-visibility": "visible",
    "background-attachment": "scroll",
    "background-blend-mode": "normal",
    "background-clip": "border-box",
    "background-color": "transparent",
    "background-image": "none",
    "background-origin": "padding-box",
    "background-position": "0% 0%",
    "background-repeat": "repeat",
    "background-size": "auto",
    "baseline-shift": "0px", //need to check again
    "block-size": "auto", //need to check again
    // "border-block-end-color": "rgb(13, 17, 43)",
    "border-block-end-style": "none",
    // "border-block-end-width": "0px",
    // "border-block-start-color": "rgb(13, 17, 43)",
    "border-block-start-style": "none",
    "border-block-start-width": "0px",
    // "border-bottom-color": "rgb(13, 17, 43)",
    "border-bottom-left-radius": "0px",
    "border-bottom-right-radius": "0px",
    "border-bottom-style": "none",
    // "border-bottom-width": "0px",
    "border-collapse": "separate",
    "border-end-end-radius": "0px",
    "border-end-start-radius": "0px",
    "border-image-outset": "0",
    "border-image-repeat": "stretch",
    "border-image-slice": "100%",
    "border-image-source": "none",
    "border-image-width": "1",
    // "border-inline-end-color": "rgb(13, 17, 43)",
    "border-inline-end-style": "none",
    "border-inline-end-width": "0px",
    // "border-inline-start-color": "rgb(13, 17, 43)",
    "border-inline-start-style": "none",
    "border-inline-start-width": "0px",
    // "border-left-color": "rgb(13, 17, 43)",
    "border-left-style": "none",
    "border-left-width": "0px",
    // "border-right-color": "rgb(13, 17, 43)",
    "border-right-style": "none",
    "border-right-width": "0px",
    "border-start-end-radius": "0px",
    "border-start-start-radius": "0px",
    // "border-top-color": "rgb(13, 17, 43)",
    "border-top-left-radius": "0px",
    "border-top-right-radius": "0px",
    "border-top-style": "none",
    "border-top-width": "0px",
    "bottom": "auto",
    "box-shadow": "none",
    "box-sizing": "border-box",
    "break-after": "auto",
    "break-before": "auto",
    "break-inside": "auto",
    "buffered-rendering": "auto",
    "caption-side": "top",
    // "caret-color": "rgb(13, 17, 43)",
    "clear": "none",
    "clip": "auto",
    "clip-path": "none",
    "clip-rule": "nonzero",
    // "color": "rgb(13, 17, 43)",
    "color-interpolation": "srgb",
    "color-interpolation-filters": "linearrgb",
    "color-rendering": "auto",
    "column-count": "auto",
    "column-gap": "normal",
    // "column-rule-color": "rgb(13, 17, 43)",
    "column-rule-style": "none",
    "column-rule-width": "0px",
    "column-span": "none",
    "column-width": "auto",
    "contain-intrinsic-block-size": "auto",
    "contain-intrinsic-height": "auto",
    "contain-intrinsic-inline-size": "auto",
    "contain-intrinsic-size": "auto",
    "contain-intrinsic-width": "auto",
    "content": "normal",
    "cursor": "auto",
    "cx": "0px",
    "cy": "0px",
    "d": "none",
    "direction": "ltr",
    "display": "block",
    "dominant-baseline": "auto",
    "empty-cells": "show",
    "fill": "rgb(0, 0, 0)",
    "fill-opacity": "1",
    "fill-rule": "nonzero",
    "filter": "none",
    "flex-basis": "auto",
    "flex-direction": "row",
    "flex-grow": "0",
    "flex-shrink": "1",
    "flex-wrap": "nowrap",
    "float": "none",
    "flood-color": "rgb(0, 0, 0)",
    "flood-opacity": "1",
    // "font-family": "\"Whitney SSm A\", \"Whitney SSm B\", \"Helvetica Neue\", Helvetica, Arial, sans-serif",
    "font-kerning": "auto",
    "font-optical-sizing": "auto",
    "font-size": "medium",
    "font-stretch": "100%",
    "font-style": "normal",
    "font-variant": "normal",
    "font-variant-caps": "normal",
    "font-variant-east-asian": "normal",
    "font-variant-ligatures": "normal",
    "font-variant-numeric": "normal",
    "font-weight": "normal",
    "grid-auto-columns": "auto",
    "grid-auto-flow": "row",
    "grid-auto-rows": "auto",
    "grid-column-end": "auto",
    "grid-column-start": "auto",
    "grid-row-end": "auto",
    "grid-row-start": "auto",
    "grid-template-areas": "none",
    "grid-template-columns": "none",
    "grid-template-rows": "none",
    "height": "auto",
    "hyphens": "manual",
    "image-orientation": "from-image",
    "image-rendering": "auto",
    "inline-size": "1349px",
    "inset-block-end": "auto",
    "inset-block-start": "auto",
    "inset-inline-end": "auto",
    "inset-inline-start": "auto",
    "isolation": "auto",
    "justify-content": "normal",
    "justify-items": "normal",
    "justify-self": "auto",
    "left": "auto",
    "letter-spacing": "-0.16px",
    // "lighting-color": "rgb(255, 255, 255)",
    "line-break": "auto",
    "line-height": "28.8px",
    "list-style-image": "none",
    "list-style-position": "outside",
    "list-style-type": "disc",
    "margin-block-end": "0px",
    "margin-block-start": "0px",
    "margin-bottom": "0px",
    "margin-inline-end": "0px",
    "margin-inline-start": "0px",
    "margin-left": "0px",
    "margin-right": "0px",
    "margin-top": "0px",
    "marker-end": "none",
    "marker-mid": "none",
    "marker-start": "none",
    "mask-type": "luminance",
    "max-block-size": "none",
    "max-height": "none",
    "max-inline-size": "1600px",
    "max-width": "1600px",
    "min-block-size": "0px",
    "min-height": "0px",
    "min-inline-size": "0px",
    "min-width": "0px",
    "mix-blend-mode": "normal",
    "object-fit": "fill",
    "object-position": "50% 50%",
    "offset-distance": "0px",
    "offset-path": "none",
    "offset-rotate": "auto 0deg",
    "opacity": "1",
    "order": "0",
    "orphans": "2",
    // "outline-color": "rgb(13, 17, 43)",
    "outline-offset": "0px",
    "outline-style": "none",
    "outline-width": "0px",
    "overflow-anchor": "auto",
    "overflow-clip-margin": "0px",
    "overflow-wrap": "normal",
    "overflow-x": "visible",
    "overflow-y": "visible",
    "overscroll-behavior-block": "auto",
    "overscroll-behavior-inline": "auto",
    "padding-block-end": "0px",
    "padding-block-start": "0px",
    "padding-bottom": "0px",
    "padding-inline-end": "0px",
    "padding-inline-start": "0px",
    "padding-left": "0px",
    "padding-right": "0px",
    "padding-top": "0px",
    "paint-order": "normal",
    "perspective": "none",
    // "perspective-origin": "674.5px 3827.41px",
    "pointer-events": "auto",
    "position": "static",
    "r": "0px",
    "resize": "none",
    "right": "auto",
    "row-gap": "normal",
    "ruby-position": "over",
    "rx": "auto",
    "ry": "auto",
    "scroll-behavior": "auto",
    "scroll-margin-block-end": "0px",
    "scroll-margin-block-start": "0px",
    "scroll-margin-inline-end": "0px",
    "scroll-margin-inline-start": "0px",
    "scroll-padding-block-end": "auto",
    "scroll-padding-block-start": "auto",
    "scroll-padding-inline-end": "auto",
    "scroll-padding-inline-start": "auto",
    "scrollbar-gutter": "auto",
    "shape-image-threshold": "0",
    "shape-margin": "0px",
    "shape-outside": "none",
    "shape-rendering": "auto",
    "speak": "normal",
    "stop-color": "rgb(0, 0, 0)",
    "stop-opacity": "1",
    "stroke": "none",
    "stroke-dasharray": "none",
    "stroke-dashoffset": "0px",
    "stroke-linecap": "butt",
    "stroke-linejoin": "miter",
    "stroke-miterlimit": "4",
    "stroke-opacity": "1",
    "stroke-width": "1px",
    "tab-size": "8",
    "table-layout": "auto",
    "text-align": "start",
    "text-align-last": "auto",
    "text-anchor": "start",
    // "text-decoration": "none solid rgb(13, 17, 43)",
    "text-decoration-color": "rgb(13, 17, 43)",
    "text-decoration-line": "none",
    "text-decoration-skip-ink": "auto",
    "text-decoration-style": "solid",
    "text-indent": "0px",
    "text-overflow": "clip",
    "text-rendering": "auto",
    "text-shadow": "none",
    "text-size-adjust": "100%",
    "text-transform": "none",
    "text-underline-position": "auto",
    "top": "auto",
    "touch-action": "auto",
    "transform": "none",
    // "transform-origin": "674.5px 3827.41px",
    "transform-style": "flat",
    "transition-delay": "0s",
    "transition-duration": "0s",
    "transition-property": "all",
    "transition-timing-function": "ease",
    "unicode-bidi": "normal",
    "user-select": "auto",
    "vector-effect": "none",
    "vertical-align": "baseline",
    "visibility": "visible",
    "white-space": "normal",
    "widows": "2",
    "width": "1349px",
    "will-change": "auto",
    "word-break": "normal",
    "word-spacing": "0px",
    "writing-mode": "horizontal-tb",
    "x": "0px",
    "y": "0px",
    "z-index": "auto",
    "zoom": "1",
    "-webkit-border-horizontal-spacing": "0px",
    "-webkit-border-image": "none",
    "-webkit-border-vertical-spacing": "0px",
    "-webkit-box-align": "stretch",
    "-webkit-box-decoration-break": "slice",
    "-webkit-box-direction": "normal",
    "-webkit-box-flex": "0",
    "-webkit-box-ordinal-group": "1",
    "-webkit-box-orient": "horizontal",
    "-webkit-box-pack": "start",
    "-webkit-box-reflect": "none",
    "-webkit-font-smoothing": "auto",
    "-webkit-highlight": "none",
    "-webkit-hyphenate-character": "auto",
    "-webkit-line-break": "auto",
    "-webkit-line-clamp": "none",
    "-webkit-locale": "\"en\"",
    "-webkit-mask-box-image": "none",
    "-webkit-mask-box-image-outset": "0",
    "-webkit-mask-box-image-repeat": "stretch",
    "-webkit-mask-box-image-slice": "0 fill",
    "-webkit-mask-box-image-source": "none",
    "-webkit-mask-box-image-width": "auto",
    "-webkit-mask-clip": "border-box",
    "-webkit-mask-composite": "source-over",
    "-webkit-mask-image": "none",
    "-webkit-mask-origin": "border-box",
    "-webkit-mask-position": "0% 0%",
    "-webkit-mask-repeat": "repeat",
    "-webkit-mask-size": "auto",
    "-webkit-print-color-adjust": "economy",
    "-webkit-rtl-ordering": "logical",
    // "-webkit-tap-highlight-color": "rgba(0, 0, 0, 0.18)",
    "-webkit-text-combine": "none",
    "-webkit-text-decorations-in-effect": "none",
    // "-webkit-text-emphasis-color": "rgb(13, 17, 43)",
    "-webkit-text-emphasis-position": "over right",
    "-webkit-text-emphasis-style": "none",
    // "-webkit-text-fill-color": "rgb(13, 17, 43)",
    "-webkit-text-orientation": "vertical-right",
    "-webkit-text-security": "none",
    // "-webkit-text-stroke-color": "rgb(13, 17, 43)",
    "-webkit-text-stroke-width": "0px",
    "-webkit-user-drag": "auto",
    "-webkit-user-modify": "read-only",
    "-webkit-writing-mode": "horizontal-tb"
}

const VIEWPORT_WIDTHS = [
    480,
    620,
    768,
    990,
    1200,
    1600,
    1920
]

const XY_MAP = {
    2560: 1920,
    1920: 1600,
    1600: 1200,
    1200: 990,
    990: 768,
    768: 620,
    620: 480
}

async function collectCSSFromPage(page, width) {
    await page.setViewport({width, height: 900});

    return await page.evaluate(() => {

        function traversDOM(element, parent, nodes, variable) {
            // parent = parent || {top: 0, left: 0, depth: 0};

            nodes = nodes || [];

            if (element.nodeType === 1) {
                const node = {};
                // node[`HTML Element-${variable}`] = element.tagName;
                // node[`CSS Class-${variable}`] = element.className;
                //node.styles = getAllStyles(element, variable);
                nodes.push(getAllStyles(element, variable));
                // nodes.push(node);

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
                //const allAllStylesMap = {};

                allAllStylesMap[`Breakpoint-${variable}`] = window.innerWidth;
                allAllStylesMap[`HTML Element-${variable}`] = elem.tagName;
                allAllStylesMap[`CSS Class-${variable}`] = elem.className;

                for (let i = 0; i < style.length; i++) {
                    allAllStylesMap[`${style[i]}-${variable}`] = style.getPropertyValue(style[i]);
                    styleNode.push(allAllStylesMap);
                    //styleNode.push(style[i] + ':' + style.getPropertyValue(style[i]));
                    //               ^name ^           ^ value ^
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

async function generateDataSet_Y(url) {


    console.log("Starting to SCRAP - Y-VAR - REQ RECEIVED FROM : ", url)

    const viewPortDataList = await (async () => {
        // launch a headless browser
        const browser = await chromium.puppeteer.launch({
            args: chromium.args,
            defaultViewport: chromium.defaultViewport,
            executablePath: await chromium.executablePath,
            headless: chromium.headless,
        });

        const page = await browser.newPage();
        await page.goto(url, {waitUntil: 'networkidle0', timeout: 0});
        // await page.goto('file:D:\\2 WorkPlace\\Devy\\2022-06-03\\3-loginform-y-output-responsive\\index.html', {waitUntil: 'networkidle0', timeout: 0});

        const styleMap = {};

        for (let index = 0; index < VIEWPORT_WIDTHS.length; index++) {
            const width = VIEWPORT_WIDTHS[index];

            styleMap[width] = await collectCSSFromPage(page, width)
        }
        await browser.close();

        return styleMap;
    })();

    const styleData = [];

    Object.keys(XY_MAP).forEach(key => {
        const styleY = viewPortDataList[XY_MAP[key]]['yvar'];

        for (let index = 0; index < styleY.length; index++) {
            const _styleY = styleY[index];
            styleData.push({..._styleY});
        }
    })


    styleData.forEach(row => {
        Object.keys(row).forEach(key => {
            // console.log('key', key)
            let styleParts = key.split('-yvar');
            let styleKey = styleParts[0];
            row[styleKey] = row[key]
            delete row[key]
        })
    })


    console.log('GENERATED Y VARIABLES FROM : ', url)
    return styleData
}

async function uploadCorrectedCSSToS3(fileKeyPath, filepathCSS) {
    const s3 = new S3();
    const fileContent = fs.readFileSync(filepathCSS)


    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `${fileKeyPath}/predicted-stylesSheet/styles.css`,
        Body: fileContent,
        ContentType: `text/css`
    }

    return  await s3.upload(params).promise();
}

exports.Generate_CSS = async (url, fileKeyPath) => {

    let dataset = []
    dataset = await generateDataSet_Y(url)


    //Removing CSS elements with default values
    dataset.forEach(row => {
        Object.keys(row).forEach(real_key => {
            Object.keys(CSS_ELEMENTS).forEach(key => {
                if (row[real_key] === CSS_ELEMENTS[key]){
                    delete row[real_key]
                }
            })
        })
    })


    //Categorizing elements by the Breakpoint
    let breakpoints = {
        br_480_list : [],
        br_620_list : [],
        br_768_list : [],
        br_990_list : [],
        br_1200_list : [],
        br_1600_list : [],
        br_1920_list : []
    }

    dataset.forEach(row => {
        if (row['Breakpoint'] === 480 && row['CSS Class']) breakpoints.br_480_list.push(row)
        else if (row['Breakpoint'] === 620  && row['CSS Class']) breakpoints.br_620_list.push(row)
        else if (row['Breakpoint'] === 768  && row['CSS Class']) breakpoints.br_768_list.push(row)
        else if (row['Breakpoint'] === 990  && row['CSS Class']) breakpoints.br_990_list.push(row)
        else if (row['Breakpoint'] === 1200  && row['CSS Class']) breakpoints.br_1200_list.push(row)
        else if (row['Breakpoint'] === 1600  && row['CSS Class']) breakpoints.br_1600_list.push(row)
        else if (row['Breakpoint'] === 1920  && row['CSS Class']) breakpoints.br_1920_list.push(row)
    })

    const appPrefix = `${uuid()}-`;

    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), appPrefix));
    let filepathCSS = path.join(tmpDir, 'styles.css')

    console.log('temp directory of css : ', filepathCSS)

    //Creating the CSS sheet.
    // const css_sheet = fs.createWriteStream(filepathCSS, {
    //     flags: 'a' // 'a' means appending (old data will be preserved)
    // });

    let wholeStr = ``


    Object.keys(breakpoints).forEach(br => {
        generateMediaQuery(br)

        breakpoints[br].forEach(row => {
            // css_sheet.write(`\t.${row['CSS Class']} {` + '\n')
            wholeStr += `\t.${row['CSS Class']} {` + '\n'

            Object.keys(row).slice(3).forEach(key => {
                // css_sheet.write(`\t\t${key} : ${row[key]};` + '\n')
                wholeStr += `\t\t${key} : ${row[key]};` + '\n'
            })
            // css_sheet.write('\t}\n')
            wholeStr += '\t}\n'
        })
        // css_sheet.write('}\n\n')
        wholeStr += '}\n\n'
    })


    function generateMediaQuery(br) {
        switch (br) {
            case 'br_480_list':
                // css_sheet.write(`@media screen and (max-width: 619px) {\n`)
                wholeStr += `@media screen and (max-width: 619px) {\n`
                break;
            case 'br_620_list':
                // css_sheet.write(`@media (min-width:620px) and (max-width:767px) {\n`)
                wholeStr += `@media (min-width:620px) and (max-width:767px) {\n`
                break;
            case 'br_768_list':
                // css_sheet.write(`@media (min-width:768px) and (max-width:989px) {\n`)
                wholeStr += `@media (min-width:768px) and (max-width:989px) {\n`
                break;
            case 'br_990_list':
                // css_sheet.write(`@media (min-width:990px) and (max-width:1199px) {\n`)
                wholeStr += `@media (min-width:990px) and (max-width:1199px) {\n`
                break;
            case 'br_1200_list':
                // css_sheet.write(`@media (min-width:1200px) and (max-width:1599px) {\n`)
                wholeStr += `@media (min-width:1200px) and (max-width:1599px) {\n`
                break;
            case 'br_1600_list':
                // css_sheet.write(`@media (min-width:1600px) and (max-width:1899px) {\n`)
                wholeStr += `@media (min-width:1600px) and (max-width:1899px) {\n`
                break;
            case 'br_1920_list':
                // css_sheet.write(`@media (min-width:1900px)  {\n`)
                wholeStr += `@media (min-width:1900px)  {\n`
                break;
            default:
                console.log("No such breakpoint exists!");
                break;
        }
    }

    // console.log(wholeStr)

    fs.writeFileSync(filepathCSS, wholeStr);

    const resp = await uploadCorrectedCSSToS3(fileKeyPath, filepathCSS)

    fs.rmSync(tmpDir, { recursive: true });

    return resp
}