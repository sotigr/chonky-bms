const express = require('express')
const app = express()

 
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.connect('mongodb://mongo:27017/snw_db');
const ObjectId = mongoose.Types.ObjectId


const _ = require("lodash")
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');

const Url = mongoose.model('url', new Schema({
    url: String,
    path: String,
    createdAt: Date,
    title: String,
}, { collection: 'url' }));

async function main() {

    app.use(express.json())
    app.use(cors())

    app.get("/api", async (req, res) => { 
        res.json("ok")
    })

    app.get("/api/get-path", async (req, res) => {

        let path = req.query.path || "/"

        if (path == "/") {
            urls = await Url.find({ $or: [{ path: path }, { path: "" }, { path: null }] });
        }
        else {
            urls = await Url.find({ path: path });
        }


        let subDirs = await Url
            .find(
                {
                    path: { $regex: new RegExp(`^${path}\/?[^\/]*$`, 'g'), $ne: path }
                }
            )
        subDirs = _.uniqBy(subDirs, "path").map(p => { return { path: p.path, _id: p._id } })

        res.json({
            urls,
            subDirs
        })
    })

    app.post("/api/new-url", async (req, res) => {

        let path
        if (req.body.path.endsWith("/") && req.body.path != '/') {

            path = req.body.path.substring(0, req.body.path.length - 1);
        } else {
            path  = req.body.path
        }


        let result = (await axios.get(req.body.url)).data;
        const $ = cheerio.load(result);

        let title = $("title").text()

        let newUrl = new Url({
            title,
            url: req.body.url,
            path,
            createdAt: new Date()
        })
        await newUrl.save()

        res.json({
            action: "done"
        })
    })

    app.get("/api/delete-url", async (req, res) => {

        console.log()
        let id = ObjectId(req.query.id)

        await Url.deleteOne({
            _id: id
        })


        res.json({
            action: "done"
        })
    })

    app.listen(3001)

}

main()