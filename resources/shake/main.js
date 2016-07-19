"use strict";

const qs = require("qs")
const fs = require("fs")
const path = require("path")
const Canvas = require("canvas")
const request = require("request")

var data = {
    id: 20160719235516,
    drill: false,
    alarm: false,
    situation: 1,
    revision: 4,
    details: {
        announced: "2016/07/19 23:55:56",
        occurred: "2016/07/19 23:55:05",
        magnitude: 4.2,
        epicenter: {
            id: 301,
            en: "Southern Ibaraki Prefecture",
            ja: "茨城県南部"
        },
        seismic: {
            en: "3",
            ja: "3"
        },
        geography: {
            lat: 36,
            long: 140,
            depth: 70,
            offshore: false
        }
    }
}

var url = `https://maps.googleapis.com/maps/api/staticmap?` + qs.stringify({
    zoom: 6,
    size: "386x159",
    format: "png",
    center: `${data.details.geography.lat},${data.details.geography.long}`,
    markers: `${data.details.geography.lat},${data.details.geography.long}`,
    maptype: "roadmap",
    style: "feature:road|color:0xFFFFFF"
})

var resource = function(input) {
    //return path.join(__dirname, "../", "resources", "shake", input)
    return path.join(__dirname, input)
}

var map = function() {
    return new Promise((resolve, reject) => {
        request.get({ url: url, encoding: "binary" }, (error, response, body) => {
            if (error) {
                reject(error); return
                //core.post({ channel: channel, message: JSON.stringify(error) }); return
            }

            else if (response.statusCode !== 200) {
                reject(response.statusCode); return
                //core.post({ channel: channel, message: `Unable to get Map: Unknown Error, Malformed Request or other API Error. [${response.statusCode}]` }); return
            }

            fs.writeFile(`./map.png`, body, "binary", (err) => {
                if (err) throw err
                resolve()
            })
        })
    })
}

var main = function() {
    const canvas = new Canvas(400, 280)
    const ctx = canvas.getContext("2d")

    const Image = Canvas.Image
    const Font = Canvas.Font

    var Roboto = new Font("Roboto", resource("fonts/Roboto Regular.ttf"))
        Roboto.addFace(resource("fonts/Roboto Medium.ttf"), "500")
        Roboto.addFace(resource("fonts/Roboto Bold.ttf"), "600")

    ctx.addFont(Roboto)
    ctx.scale(1, 1)
    ctx.patternQuality = "bilinear"
    ctx.filter = "bilinear"
    ctx.antialias = "subpixel"

    var generate = map().then((res) => {
        var Base = new Image()
            Base.src = fs.readFileSync(resource(`base/card.png`))
            ctx.drawImage(Base, 0, 0)

        // Map
        var map = new Image()
            map.src = fs.readFileSync(resource(`./map.png`))
        ctx.drawImage(map, 7, 73)

        // Epicenter
        ctx.font = "500 18px Roboto"
        ctx.fillStyle = "#FFF"
        ctx.fillText(data.details.epicenter.en, 20, 34)

        // Details
        ctx.font = "500 17px Roboto"
        ctx.fillStyle = "rgba(255, 255, 255, 0.75)"
        ctx.fillText(`Magnitude ${data.details.magnitude}, Seismic ${data.details.seismic.en}, Depth ${data.details.geography.depth}km`, 20, 58)

        // Footer
        ctx.font = "400 15px Roboto"
        ctx.fillStyle = "#000"
        ctx.fillText(`Information is preliminary`, 56, 258)

        // Save
        console.log("done")
        canvas.createPNGStream().pipe(fs.createWriteStream(resource(`./done.png`)))
    })
}

main()
