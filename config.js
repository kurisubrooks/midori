module.exports = {
    "name": "midori",
    "sign": "/",
    "userid": "188394341708857346",
    "admin": ["132368482120499201"],

    "colours": {
        "default": 0xB699FF,
        "success": 0x52C652,
        "error": 0xE93F3C,
        "warn": 0xF5AD1E,
        "info": 0x52B7D6
    },

    "commands": {
        "admin": {
            "description": "Administrative Commands"
        },
        "aqi": {
            "description": "Get the Air Quality"
        },
        "define": {
            "description": "Basic Dictionary"
        },
        "radar": {
            "description": "Weather Radar"
        },
        "search": {
            "description": "Search with Google"
        },
        "shibe": {
            "description": "Shibas to give us reason to live"
        },
        "translate": {
            "alias": ["t"],
            "description": "Translate with Google"
        },
        "weather": {
            "alias": ["w"],
            "description": "Gives the Weather"
        }
    },

    "subprocesses": {
        "shake": {
            "description": "Earthquake Alerts"
        }
    },

    "weather": {
        "132368482120499201": ["Penrith", "NSW", "Australia"],
        "169842543410937856": ["Werrington", "NSW", "Australia"],
        "95534503971258368":  ["Kolkata", "India"]
    },

    "aqi": {
        "132368482120499201": ["3255"],
        "169842543410937856": ["3255"],
        "95534503971258368":  ["7021"]
    }
}
