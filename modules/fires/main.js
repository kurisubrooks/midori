"use strict"

let levels = {
    
}

module.exports = (bot, util, config, keychain, dir) => {
    let embed = {
        "color": config.colours.error,
        "author": {
            "name": "Watch and Act",
            "icon_url": "https://cdn.discordapp.com/attachments/187527424026607616/254960323662970881/FFD84A.png"
        },
        "fields": [
            {
                "name": "Location",
                "value": "Castlereagh Road, Agnes Banks"
            },

            {
                "name": "Type",
                "value": "Grass Fire",
                "inline": "1"
            },
            {
                "name": "Status",
                "value": "Out of control",
                "inline": "1"
            }
        ],
        "image": {
            "url": "https://maps.googleapis.com/maps/api/staticmap?center=667%20Castlereagh%20Rd,%20Agnes%20Banks,%20NSW%202753&markers=667%20Castlereagh%20Rd,%20Agnes%20Banks,%20NSW%202753&size=400x220&zoom=12"
        }
    }

    let run = () => {

    }
}
