// nano²
"use strict";

module.exports = {
    "sign": "/",
    "user": "188394341708857346", //@nano²
    "masters": [
        "132368482120499201",   // @kurisu
        "95534503971258368"     // @justin
    ],
    "debug": ["187527424026607616"], //@kaori#mahou
    "subprocesses": [],
    "commands": {
        "exit": {
            "admin": true,
            "description": "Shutdown/Restart Nano",
            "usage": [],
            "aliases": ["fuckoff"]
        },
        "weather": {
            "description": "Get the Current Weather",
            "usage": ["query"],
            "aliases": ["w"]
        },
        "translate": {
            "description": "Translate to any language",
            "usage": ["to[,from]", "query"],
            "aliases": ["t"]
        }
    },
    "weather": {
        "132368482120499201": ["Penrith", "Australia"],
        "169842543410937856": ["Penrith", "Australia"],
        "95534503971258368":  ["Kolkata", "India"]
    }
}
