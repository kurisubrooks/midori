// nano²
"use strict"

const qs = require("qs")
const fs = require("fs")
const path = require("path")
const Canvas = require("canvas")
const request = require("request")

var channels = {
    "general": {
        "id": "132368736119291904", // @kurisubrooks#general
        "last": "",
        "previous": ""
    },
    "kaori": {
        "id": "198304206476673024", // @kaori#quakes
        "last": "",
        "previous": ""
    }
}

var previous_quake
var is_final = true

exports.main = (core, config, keychain, dir) => {
    const socket = require("socket.io-client")(keychain.shake)

    socket.on("connect", () => socket.emit("auth", { version: 2.1 }))
    socket.on("quake.eew", (data) => eew(data))
    socket.on("auth", (data) => {
        if (data.ok) {
            // Authenticated Successfully
            core.post({
                channel: channels.kaori.id,
                message: "**Shake:** Connected"
            })

            console.log("Shake: Connected")
        } else {
            // Failed to Authenticate
            core.post({
                channel: channels.kaori.id,
                message: `**Shake:** Connection Refused, ${data.message}`
            })

            console.log("Shake: Connection Refused, " + data.message)
            throw data.message
        }
    })

    socket.on("disconnect", () => {
        core.post({
            channel: channels.kaori.id,
            message: `**Shake:** Disconnected`
        })

        console.log("Shake: Disconnected")
    })

    var eew = function(data) {
        if (previous_quake != data.id || data.situation == 1) {
            previous_quake = data.id

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
                return path.join(dir, "resources", "shake", input)
            }

            var map = function() {
                return new Promise((resolve, reject) => {
                    request.get({ url: url, encoding: "binary" }, (error, response, body) => {
                        if (error) {
                            reject(error); return
                        }

                        else if (response.statusCode !== 200) {
                            reject(response.statusCode); return
                        }

                        fs.writeFile(resource("out/map.png"), body, "binary", (err) => {
                            if (err) reject(err)
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
                        Base.src = fs.readFileSync(resource("base/card.png"))
                        ctx.drawImage(Base, 0, 0)

                    // Map
                    var map = new Image()
                        map.src = fs.readFileSync(resource("./map.png"))
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
                    ctx.fillText("Information is preliminary", 56, 258)

                    // Save
                    var id = new Date().getTime()
                    canvas.createPNGStream().pipe(fs.createWriteStream(resource(`out/${id}.png`)))

                    setTimeout(function() {
                        core.upload({
                            channel: channels.general.id,
                            file: resource(`out/${id}.png`)
                        }, (err, res) => {
                            channels.general.previous = res
                        })

                        setTimeout(function() {
                            core.upload({
                                channel: channels.kaori.id,
                                file: resource(`out/${id}.png`)
                            }, (err, res) => {
                                channels.kaori.previous = res
                                fs.unlink(resource(`out/${id}.png`))
                            })
                        }, 200)
                    }, 200)
                })
            }

            main()
        }
    }
}
