require('dotenv').config();
const parser = require("node-html-parser");
const fs = require("fs").promises;
var axios = require("axios");
const express = require('express');
const e = require('express');
const app = express();

//#region search api

//Search box api
app.get("/api/search/:query", async (req, res) => {
    var response = [];
    getSearchResults(req.params.query).then(list => {
        list.forEach(item => {
            let first = new URL(item.getAttribute("href")).href;
            response.push({
                name: item.innerText.trim(),
                href: `${first.substring(first.lastIndexOf('/') + 1)}`
            });
        });
        res.json(response);
        res.end();
    });
});

//Immediate forwarding api
app.get("/api/fastsearch/:query", async (req, res) => {
    var response = [];
    getSearchResults(req.params.query).then(list => {
        let item = list[0]
        let first = new URL(item.getAttribute("href")).href;

        res.redirect(`/item/${first.substring(first.lastIndexOf('/') + 1)}`);
    });
});

const getSearchResults = (query) => {
    return new Promise(cb => {
        let searchurl = new URL(`https://escapefromtarkov.fandom.com/wiki/Special:Search?query=${query}&scope=internal&navigationSearch=true`);
        axios.get(searchurl.href).then(({ data }) => {
            const root = parser.parse(data);
            cb(root.querySelectorAll(".unified-search__result__title"));
        })
    })

};
//#endregion

//#region statics
app.use('/favicon.ico', express.static('favicon.ico'));
app.use('/script.js', express.static('script.js'));
app.use('/404.html', express.static('404.html'));
app.use('/style.css', express.static('style.css'));
//#endregion

app.get("/item/:item", async (req, res) => {
    res.set('Content-Type', 'text/html');
    getItemPage(req.params.item).then(content => {
        const replacements = {
            content: content
        };

        const result = Files.result.toString().replace(
            /{(\w+)}/g,
            (placeholderWithDelimiters, placeholderWithoutDelimiters) =>
                replacements[placeholderWithoutDelimiters] || placeholderWithDelimiters
        );
        res.send(result);
    });

})

const getItemPage = (item) => {
    return new Promise(cb => {
        let itempage = new URL(`https://escapefromtarkov.fandom.com/wiki/${item}`);
        axios.get(itempage.href, { validateStatus: false }).then(({ data }) => {
            let content = "";
            const root = parser.parse(data);

            content += root.getElementById("firstHeading").outerHTML;
            content += `<a href='${itempage.href}'>fandom</a><br />`;

            let quests = root.getElementById("Quests");
            if (quests) {
                content += quests.parentNode.outerHTML;
                content += quests.parentNode.nextElementSibling.outerHTML;
            } else {
                content += "Not needed for quests."
            }

            let trading = root.getElementById("Trading");
            if (trading) {
                content += trading.parentNode.outerHTML;
                content += trading.parentNode.nextElementSibling.outerHTML;
            } else {
                content += "Not used in trading."
            }

            let crafting = root.getElementById("Crafting");
            if (crafting) {
                content += crafting.parentNode.outerHTML;
                content += crafting.parentNode.nextElementSibling.outerHTML;
            } else {
                content += "Not used for crafting."
            }
            cb(content);
        })

    })
}



preloadFiles().then(() => app.listen(process.env.PORT|80));

var Files = {};



function preloadFiles() {
    return new Promise(async (cb) => {
        await fs.readFile("index.html").then(contents => {
            Files.index = contents;
        });

        await fs.readFile("result.html").then(contents => {
            Files.result = contents;
        });
        cb();
    })
}