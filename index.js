require('dotenv').config();
var http = require("http");
var url = require("url");
const fs = require("fs").promises;
var axios = require("axios");

var Files = {};
var Server;

async function Main(){
    await preloadFiles();
    Server = http.createServer(requestListener);
    Server.listen(process.env.PORT || 80);
}

function preloadFiles(){
    return new Promise(callback=>{
        fs.readFile("favicon.ico").then(contents => {
            Files.favicon = contents;
            fs.readFile("404.html").then(contents => {
                Files.E404 = contents;
                fs.readFile("index.html").then(contents => {
                    Files.index = contents;
                    fs.readFile("style.css").then(contents => {
                        Files.css = contents;
                        callback();
                    });
                });
            });
        });
    })
}

async function requestListener (req, res) {
    let _url = url.parse(req.url, true);
    switch(_url.pathname){
        case "/":
            res.setHeader("Content-Type", "text/html");
            res.writeHead(200);
            let query = _url.query["query"];
            if(query){
                res.end(await searchWord(query))
            }else
                res.end(Files.index);
            break;
        
        case "/facion.ico":
            res.setHeader("Content-Type", "image/vnd.microsoft.icon")
            res.writeHead(200);
            res.end(Files.favicon)
            break;

        default:
            if(_url.pathname.startsWith("/wiki")){
                res.setHeader("Content-Type", "text/html");
                res.writeHead(200);
                res.end(`<script>window.location.href="https://escapefromtarkov.fandom.com${_url.pathname}"</script>`);
            }else{
                res.setHeader("Content-Type", "text/html");
                res.writeHead(404);
                res.end(Files.E404);
            }
            break;
    }
}

function searchWord(word){
    return new Promise(callback => {
        word = word.toString();
        let query_text = word.replace(" ", "+");
        axios.get(`https://escapefromtarkov.fandom.com/wiki/Special:Search?query=${query_text}&scope=internal&navigationSearch=true`).then(res => {
            var body = res.data; 
            let start;
            let end;
            for(start = body.indexOf('<h3 class="unified-search__result__header">'); body.slice(start-9, start) != '<a href="'; start++){}
            for(end = start; body.charAt(end) != '"'; end++){}
            var wiki_url = body.slice(start, end);
            axios.get(wiki_url).then((res) => {
                var body = res.data;
                var respond = "";
                var bStart = body.indexOf('<h1 class="page-header__title" id="firstHeading">');
                var bEnd;
                if(bStart > -1){
                    for(bEnd = bStart; body.slice(bEnd-5, bEnd) != "</h1>"; bEnd++){}
                    respond += body.slice(bStart, bEnd)+"<br />";
                }
                
                var hStart = body.indexOf('<h2><span class="mw-headline" id="Hideout">Hideout</span></h2>');
                var hEnd;
                if(hStart > -1){
                    for(hEnd = hStart; body.slice(hEnd-5, hEnd) != "</ul>"; hEnd++){}
                    respond += body.slice(hStart, hEnd)+"<br />";
                }
                
                var qStart = body.indexOf('<h2><span class="mw-headline" id="Quests">Quests</span></h2>');
                var qEnd;
                if(qStart > -1){
                    for(qEnd = qStart; body.slice(qEnd-5, qEnd) != "</ul>"; qEnd++){}
                    respond += body.slice(qStart, qEnd);
                }

                
                if(!qEnd && !hEnd) respond+=`Not needed for hideout or quests.<br />`
                respond+=`See all <a href="${wiki_url}">details</a><br /><br />`;

                
                var t1Start = body.indexOf('<h2><span class="mw-headline" id="Trading">Trading</span></h2>');
                var t1End;
                if(t1Start > -1){
                    for(t1End = t1Start; body.slice(t1End-8, t1End) != "</table>"; t1End++){}
                    respond += body.slice(t1Start, t1End);
                }
                

                var t2Start = body.indexOf('<h2><span class="mw-headline" id="Crafting">Crafting</span></h2>');
                var t2End;
                if(t2Start > -1){
                    for(t2End = t2Start; body.slice(t2End-8, t2End) != "</table>"; t2End++){}
                    respond += body.slice(t2Start, t2End);
                }
                callback(addToIndex(respond, word));
            })
        })
    })
}

function addToIndex(content, word){
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Tarkov FastCheck</title>
        <link rel="stylesheet" href="https://escapefromtarkov.fandom.com/load.php?fandomdesktop=1&lang=en&modules=ext.fandom.ArticleInterlang.css%7Cext.fandom.CreatePage.css%7Cext.fandom.DesignSystem.GlobalNavigation.brand.default.css%7Cext.fandom.DesignSystem.brand.dark.css%7Cext.fandom.DesignSystem.css%7Cext.fandom.FandomEmbedVideo.css%7Cext.fandom.SearchExperiment.css%7Cext.fandom.Thumbnails.css%7Cext.fandom.UserPreferencesV2.css%7Cext.fandom.bannerNotificationsFandomDesktop.css%7Cext.fandom.quickBar.css%7Cext.fandom.sitenotice.desktop.css%7Cext.fandomVideo.css%7Cext.social.styles%7Cext.staffSig.css%7Cext.visualEditor.desktopArticleTarget.noscript%7Cjquery.makeCollapsible.styles%7Cmediawiki.legacy.commonPrint%2Cshared%7Cmediawiki.toc.styles%7Cskin.fandomdesktop.FanFeed.css%7Cskin.fandomdesktop.GlobalNavigation.css%7Cskin.fandomdesktop.css%7Cskin.fandomdesktop.rail.css%7Cskin.fandomdesktop.rail.popularPages.css%7Cvendor.bootstrap.popover.css&only=styles&skin=fandomdesktop">
        <link rel="stylesheet" href="https://escapefromtarkov.fandom.com/load.php?fandomdesktop=1&lang=en&modules=site.styles&only=styles&skin=fandomdesktop">
        <style>
            body{
                margin-top: 100px;
                text-align: center;
                display: flex;
                vertical-align: middle;
                justify-content: center;
                align-items: center;
            }
    
            #input{
                position: absolute;
                top: 0;
                height: 40px;
                width: 500px;
                outline: none;
                background-color: #f9edd8e0;
                margin-top: 15px;
                font-size: 35px;
                padding: 0;
            }
    
            #content{
                --fandom-global-nav-background-color: #ffc500;
                --fandom-global-nav-text-color: #1e0c1b;
                --fandom-global-nav-link-color: #520044;
                --fandom-global-nav-link-color--hover: #b80099;
                --fandom-global-nav-icon-color: #fa005a;
                --fandom-global-nav-icon-background-color: #f9edd8;
                --fandom-global-nav-icon-background-color--hover: #f9edd8;
                --fandom-global-nav-icon-background-color--active: #fff;
                --fandom-global-nav-icon-border-color: #520044;
                --fandom-global-nav-icon-border-color--hover: rgba(82,0,68,.5);
                --fandom-global-nav-icon-border-color--active: #520044;
                --fandom-global-nav-bottom-icon-color: #520044;
                --fandom-global-nav-counter-background-color: #520044;
                --fandom-global-nav-counter-label-color: #fff;
                --fandom-global-nav-mobile-logo: url(https://escapefromtarkov.fandom.com/resources-ucp/dist/svg/wds-brand-fandom-logo.svg);
                --fandom-global-nav-search-active-link-background-color: #fff;
                --fandom-global-nav-search-active-link-border-color: #520044;
                --fandom-global-nav-logo-separator-color: #520044;
                --fandom-global-nav-search-separator-color: rgba(30,12,27,.25);
                --fandom-global-nav-bottom-shadow: none;
                --fandom-global-nav-gp-legacy-logo: url(https://escapefromtarkov.fandom.com/resources-ucp/dist/svg/wds-brand-gamepedia-badge-orange.svg);
                --fandom-global-nav-border-top-width: 0;
                --fandom-text-color: #f5f3f5;
                --fandom-text-color--rgb: 245,243,245;
                --fandom-text-color--hover: #c7bbc7;
                --fandom-link-color: #ffc500;
                --fandom-link-color--hover: #997600;
                --fandom-link-color--rgb: 255,197,0;
                --fandom-link-color--fadeout: rgba(255,197,0,.3);
                --fandom-accent-color: #ffc500;
                --fandom-accent-color--hover: #997600;
                --fandom-accent-label-color: #291927;
                --fandom-border-color: #595358;
                --fandom-secondary-button-color: #f5f3f5;
                --fandom-secondary-button-color--hover: #c7bbc7;
                --fandom-dropdown-background-color: #291927;
                --fandom-notifications-background-color: #1e0c1b;
                --fandom-notifications-read-card-background-color: #1e0c1b;
                --fandom-notifications-unread-card-background-color: #291927;
                --fandom-notifications-footer-text-color: #d6d0d5;
                --fandom-banner-notification-background-color: #1e0c1b;
                --fandom-banner-notifications-close-icon: #f5f3f5;
                --fandom-mobile-notifications-unread-card-background-color: rgba(89,83,88,.3);
                --theme-body-dynamic-color-1: #fff;
                --theme-body-dynamic-color-1--rgb: 255,255,255;
                --theme-body-dynamic-color-2: #e6e6e6;
                --theme-body-dynamic-color-2--rgb: 230,230,230;
                --theme-page-dynamic-color-1: #fff;
                --theme-page-dynamic-color-1--rgb: 255,255,255;
                --theme-page-dynamic-color-1--inverted: #000;
                --theme-page-dynamic-color-1--inverted--rgb: 0,0,0;
                --theme-page-dynamic-color-2: #e6e6e6;
                --theme-page-dynamic-color-2--rgb: 230,230,230;
                --theme-sticky-nav-dynamic-color-1: #fff;
                --theme-sticky-nav-dynamic-color-1--rgb: 255,255,255;
                --theme-sticky-nav-dynamic-color-2: #e6e6e6;
                --theme-sticky-nav-dynamic-color-2--rgb: 230,230,230;
                --theme-link-dynamic-color-1: #000;
                --theme-link-dynamic-color-1--rgb: 0,0,0;
                --theme-link-dynamic-color-2: #e6e6e6;
                --theme-link-dynamic-color-2--rgb: 230,230,230;
                --theme-accent-dynamic-color-1: #fff;
                --theme-accent-dynamic-color-1--rgb: 255,255,255;
                --theme-accent-dynamic-color-2: #e6e6e6;
                --theme-accent-dynamic-color-2--rgb: 230,230,230;
                --theme-body-background-color: #0e0e0e;
                --theme-body-background-color--rgb: 14,14,14;
                --theme-body-background-image: url();
                --theme-body-text-color: #fff;
                --theme-body-text-color--rgb: 255,255,255;
                --theme-body-text-color--hover: #cccccc;
                --theme-sticky-nav-background-color: #413d34;
                --theme-sticky-nav-text-color: #fff;
                --theme-sticky-nav-text-color--hover: #cccccc;
                --theme-page-background-color: #000000;
                --theme-page-background-color--rgb: 0,0,0;
                --theme-page-background-color--secondary: #262626;
                --theme-page-text-color: #e6e6e6;
                --theme-page-text-color--rgb: 230,230,230;
                --theme-page-text-color--hover: #b3b3b3;
                --theme-page-text-mix-color: #737373;
                --theme-page-text-mix-color-95: #0c0c0c;
                --theme-page-accent-mix-color: #211f1a;
                --theme-page-headings-font: 'Rubik';
                --theme-link-color: #8a7c64;
                --theme-link-color--rgb: 138,124,100;
                --theme-link-color--hover: #b7ad9c;
                --theme-link-label-color: #000;
                --theme-accent-color: #413d34;
                --theme-accent-color--rgb: 65,61,52;
                --theme-accent-color--hover: #797261;
                --theme-accent-label-color: #fff;
                --theme-border-color: #3a3a3a;
                --theme-border-color--rgb: 58,58,58;
                --theme-alert-color: #bf0017;
                --theme-alert-color--rgb: 191,0,23;
                --theme-alert-color--hover: #fe2540;
                --theme-alert-label: #fff;
                --theme-warning-color: #cf721c;
                --theme-warning-color--rgb: 207,114,28;
                --theme-warning-label: #000;
                --theme-success-color: #0c742f;
                --theme-success-color--rgb: 12,116,47;
                --theme-success-label: #fff;
                --theme-message-color: #8d3d7f;
                --theme-message-label: #fff;
                --theme-community-header-color: #FFFFFF;
                --theme-community-header-color--hover: #cccccc;
                --theme-background-image-opacity: 100%;
                --theme-page-text-opacity-factor: 0.7;
                --theme-body-text-opacity-factor: 0.7;
                font-size: 25px;
                line-height: 1.75;
                -webkit-box-direction: normal;
                font-family: sans-serif;
                --fixed-table-header-offset: 0;
                color: var(--theme-page-text-color);
                -webkit-locale: "en";
                unicode-bidi: isolate;
                box-sizing: inherit;
                border: 0;
                margin: 0;
                padding: 0;
                vertical-align: baseline;
                direction: ltr;
                background: #000a;
                padding: 15px 30px;
            }
    
            #firstHeading{
                color: #cf721c;
                font-size: 48px;
                font-weight: 600;
            }
        </style>
    </head>
    <body>
        <input type="text" name="input" id="input" value="${word}">
        <div class="mw-parser-output" id="content">
        ${content}
        </div>
        <script>
            var input = document.getElementById("input").onkeyup = (e) => {
                if(e.keyCode == 13){
                    let input = e.srcElement.value;
                    let url = new URL(window.location.origin);
                    url.searchParams.set('query', input);
                    window.location.href = url.href;
                }
            }

            for(let img of document.querySelectorAll("img")){
                let url = img.dataset.src;
                if(!url) url = img.src;
                else{
                    delete img.dataset.src;
                    img.classList.remove("lazyload");
                }
                url = url.slice(0, url.indexOf(".png")+4)
                img.src = url;
            }
        </script>
    </body>
    </html>`;
}

Main();