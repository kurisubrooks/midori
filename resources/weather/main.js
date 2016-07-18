const fs = require("fs")
const Canvas = require("canvas")

const canvas = new Canvas(400, 290)
const ctx = canvas.getContext("2d")

const Image = Canvas.Image
const Font = Canvas.Font

var data = {
    time: "19 July, 3:08am",
    location: "Penrith, New South Wales",
    temperature: "12",
    base: "cloud",
    icon: "cloudy_dark",
    condition: "Overcast",
    feelslike: "12.0",
    humidity: "97%",
    windspeed: "0"
}

// Base
var Roboto = new Font("Roboto", `${__dirname}/fonts/Roboto.ttf`)
    Roboto.addFace(`${__dirname}/fonts/Roboto Light.ttf`, "300")
    Roboto.addFace(`${__dirname}/fonts/Roboto Regular.ttf`, "400")
    Roboto.addFace(`${__dirname}/fonts/Roboto Medium.ttf`, "500")

var Base = new Image()
    Base.src = fs.readFileSync(`${__dirname}/base/${data.base}.png`)
ctx.drawImage(Base, 0, 0)

ctx.addFont(Roboto)
ctx.shadowColor = "rgba(255, 255, 255, 0.4)"
ctx.shadowOffsetY = 2
ctx.shadowBlur = 2
ctx.scale(1, 1)
ctx.patternQuality = "bilinear"
ctx.filter = "bilinear"
ctx.antialias = "subpixel"

// Time
ctx.font = "400 12px Roboto"
ctx.fillStyle = "#000000"
ctx.fillText(data.time, 20, 30)

// Place
ctx.font = "500 18px Roboto"
ctx.shadowColor = "rgba(0, 0, 0, 0.4)"
ctx.fillStyle = "#FFFFFF"
ctx.fillText(data.location, 20, 56)

// Temperature
ctx.font = "400 88px Roboto"
ctx.fillText(data.temperature + "°", 16, 145)

/*
 * Condition
 */

// Condition Image
var con = new Image()
    con.src = fs.readFileSync(`${__dirname}/icons/${data.icon}.png`)
ctx.shadowColor = "rgba(0, 0, 0, 0)"
ctx.drawImage(con, 276, 22, 105, 105)

// Condition
ctx.font = "500 14px Roboto"
ctx.shadowColor = "rgba(0, 0, 0, 0.4)"
ctx.textAlign = "center"
ctx.fillText(data.condition, 325, 148)

/*
 * Current Details
 */

// Details
ctx.font = "500 14px Roboto"
ctx.shadowColor = "rgba(0, 0, 0, 0)"
ctx.textAlign = "left"
ctx.fillStyle = "#000000"
ctx.fillText("Current details", 20, 194)

// Titles
ctx.font = "400 14px Roboto"
ctx.fillStyle = "#777777"
ctx.fillText("Feels like", 20, 220)
ctx.fillText("Humidity", 20, 240)
ctx.fillText("Wind Speed", 20, 260)

// Values
ctx.font = "400 14px Roboto"
ctx.fillStyle = "#000000"
ctx.fillText(data.feelslike + "°", 170, 220)
ctx.fillText(data.humidity, 170, 240)
ctx.fillText(data.windspeed + " km/h", 170, 260)

// Save
canvas.createPNGStream().pipe(fs.createWriteStream(`${__dirname}/output.png`))
console.log("Done")
