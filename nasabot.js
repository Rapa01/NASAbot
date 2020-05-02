//NASAbot
//t.me/nasaspace_bot
//@nasaspace_bot

//PACKAGES
var colors = require("colors");
var fs = require("fs");
var https = require("https");
var TelegramBot = require("node-telegram-bot-api");
//TOKEN & KEY
var bot_token = "1203907290:AAGqfuaSkUheA8G9I1TKWVaF1VASEp_Ik0E";
var nasa_key = "xbhmmQlH5ZFxa9ehdW8srYk79skbD1EoAxXVd8UI";
//JSON
var hubble_file = "./json/hubble.json";
//INFO_CHAT
var chat_id;
var chat_username;
//ROVER_SELEZIONATO
var rover = "";
//API result in JSON
var api_json = "";
//TENTATIVI
var c_try_times = 0;
var os_try_times = 0;
var mardi_try_times = 0;
//SOL_variabili
var sol_mardi_variabile = 0;
var sol_mahli_variabile = 0;
var sol_mast_variabile = 0;
var sol_navcam_variabile = 0;

var bot = new TelegramBot(bot_token, {
    polling: true
});

//COMANDO /start
bot.onText(/\/start/, function (msg) {
    try {
        chat_id = msg.chat.id;
        chat_username = msg.chat.username;
        //Log
        console.log("[" + chat_username + " @ID:" + chat_id + "]: " + "/start");
        //Message text style
        const opts = {
            parse_mode: 'Markdown'
        };
        bot.sendMessage(chat_id, "Benvenuti da *NASABot*.\nDigitare */commands* per la lista completa dei comandi.", opts);
    }
    catch (error) {
        console.log(colors.red("ERRORE"));
        console.log(error);
        return;
    }
});

//COMANDO /commands
bot.onText(/\/commands/, function (msg) {
    try {
        chat_id = msg.chat.id;
        chat_username = msg.chat.username;
        //Log
        console.log("[" + chat_username + " @ID:" + chat_id + "]: " + "/commands");
        const opts = {
            parse_mode: 'Markdown'
        };
        bot.sendMessage(chat_id, "*/apod*\nAstronomy Picture of the Day\nMostra l'immagine del giorno\n\n*/marsrovers*\nLe foto del suolo marziano dalle telecamere di Curiosity, Opportunity, Spirit e Perseverance\n\n*/onmybirthday*\nCosa ha visto il telescopio spaziale Hubble il giorno del mio compleanno", opts);
    }
    catch (error) {
        console.log(colors.red("ERRORE"));
        console.log(error);
        return;
    }
});

//COMANDO /onmybirthday
bot.onText(/\/onmybirthday/, function (msg, match) {
    try {
        chat_id = msg.chat.id;
        chat_username = msg.chat.username;
        //Log
        console.log("[" + chat_username + " @ID:" + chat_id + "]: " + "/onmybirthday");
        const opts = {
            parse_mode: 'Markdown'
        };
        //Se l'utente non inserisce la data
        if (match.input === "/onmybirthday") {
            //Log
            console.log("[" + chat_username + " @ID:" + chat_id + "]: " + "error_missingdate");
            bot.sendMessage(chat_id, "Digitare il comando */onmybirthday* seguito dalla data in formato GG/MM", opts);
            return;
        }
        //Input compleanno
        var birth = match.input.split(" ")[1];
        var birth_day;
        var birth_month;
        //Se l'utente inserisce la data con il divisore /
        if (birth.includes("/")) {
            //Se l'utente inserisce solo 0 o se inserisce anche l'anno
            if (parseInt(birth.split("/")[0]) == 0 || parseInt(birth.split("/")[1]) == 0 || birth.length > 5) {
                //Log
                console.log("[" + chat_username + " @ID:" + chat_id + "]: " + "error_wrongdate");
                bot.sendMessage(chat_id, "La data inserita è errata. Inseriscila rispettando il formato GG/MM", opts);
                return
            }
            //Conversione da GG a G
            if (birth.split("/")[0].startsWith("0")) {
                birth_day = birth.split("/")[0].split("")[1];
            }
            else {
                birth_day = birth.split("/")[0];
            }
            //Conversione da MM a M
            if (birth.split("/")[1].startsWith("0")) {
                birth_month = birth.split("/")[1].split("")[1];
            }
            else {
                birth_month = birth.split("/")[1];
            }
            //Log
            console.log("Birthday: " + birth_day + "/" + birth_month);
            var message = "";
            fs.readFile(hubble_file, function (error, result) {
                if (error) {
                    throw error;
                }
                var hubble_json = JSON.parse(result);
                for (var i = 0; i < hubble_json.length; i++) {
                    if (hubble_json[i].Date.split("-")[0] == birth_day && hubble_json[i].Date.split("-")[1] == birth_month) {
                        //Log
                        console.log("Picture: " + hubble_json[i].URL);
                        message = "Il *" + birth_day + "/" + birth_month + "* dell'anno *" + hubble_json[i].Year + "* Hubble ha visto:\n\n*Oggetto*:\n" + hubble_json[i].Name + "\n*Immagine*:\n" + hubble_json[i].URL + "\n*Descrizione*:\n" + hubble_json[i].Caption;
                    }
                }
                //Non trovato
                if (message == "") {
                    //Log
                    console.log("[" + chat_username + " @ID:" + chat_id + "]: " + "error_wrongdateformat");
                    bot.sendMessage(chat_id, "La data inserita è errata. Deve essere in formato GG/MM", opts);
                    return
                }
                bot.sendMessage(chat_id, message, opts)
            });
        }
        //Se l'utente inserisce la data senza /
        else {
            //Log
            console.log("[" + chat_username + " @ID:" + chat_id + "]: " + "error_wrongseparator");
            bot.sendMessage(chat_id, "La data deve essere in formato GG/MM", opts);
            return
        }
    }
    catch (error) {
        console.log(colors.red("ERRORE"));
        console.log(error);
        return;
    }
});

var media_type = ""; //image o video
var url = "";
var hdurl = "";
var title = "";
var date = "";
var explanation = "";

//COMANDO /apod
bot.onText(/\/apod/, function (msg) {
    try {
        chat_id = msg.chat.id;
        chat_username = msg.chat.username;
        //Log
        console.log("[" + chat_username + " @ID:" + chat_id + "]: " + "/apod");
        const opts = {
            parse_mode: "Markdown"
        }
        https.get("https://api.nasa.gov/planetary/apod?api_key=" + nasa_key, function (response, error) {
            if (error) {
                throw error;
            }
            //Reset api_json
            api_json = "";
            response.on('data', function (chunk) {
                api_json += chunk;
            });
            response.on('end', function () {
                media_type = JSON.parse(api_json)["media_type"];
                if (media_type == "image") {
                    url = JSON.parse(api_json)["url"];
                    hdurl = JSON.parse(api_json)["hdurl"];
                    title = JSON.parse(api_json)["title"];
                    date = JSON.parse(api_json)["date"];
                    explanation = JSON.parse(api_json)["explanation"];
                    //Log
                    console.log("APOD: " + url);
                    bot.sendMessage(chat_id, "*Titolo*:\n" + title, opts)
                        .then(function () {
                            bot.sendPhoto(chat_id, url, {
                                "reply_markup": {
                                    "inline_keyboard": [
                                        [
                                            {
                                                text: "Mostra dettagli",
                                                callback_data: "details"
                                            }
                                        ],
                                        [
                                            {
                                                text: "Download",
                                                url: hdurl
                                            }
                                        ]
                                    ]
                                }
                            });
                        })
                }
                else if (media_type == "video") {
                    url = JSON.parse(api_json)["url"];
                    title = JSON.parse(api_json)["title"];
                    date = JSON.parse(api_json)["date"];
                    explanation = JSON.parse(api_json)["explanation"];
                    //Log
                    console.log("APOD: " + url);
                    bot.sendMessage(chat_id, "*Titolo*:\n" + title, opts)
                        .then(function () {
                            bot.sendMessage(chat_id, url, {
                                "reply_markup": {
                                    "inline_keyboard": [
                                        [
                                            {
                                                text: "Mostra dettagli",
                                                callback_data: "click"
                                            }
                                        ],
                                        [
                                            {
                                                text: "Download",
                                                url: url
                                            }
                                        ]
                                    ]
                                }
                            });
                        })
                }
            });
        });
    }
    catch (error) {
        console.log(colors.red("ERRORE"));
        console.log(error);
        return;
    }
});

//APOD callback
bot.on("callback_query", function (callbackQuery) {
    var msg = callbackQuery.message;
    var opts = {
        parse_mode: "Markdown",
    }
    if (media_type == "" || title == "" || date == "" || explanation == "") {
        console.log("error_missingapod");
        bot.sendMessage(msg.chat.id, "Digitare prima il comando */apod*", opts);
        return;
    }
    else {
        bot.answerCallbackQuery(callbackQuery.id)
            .then(function () {
                //Log
                console.log("[" + chat_username + " @ID:" + chat_id + "]: " + "/apod/details");
                bot.sendMessage(msg.chat.id, "*Data*:\n" + date + "\n*Spiegazione*:\n" + explanation, opts);
            });
    }
});

//COMMAND /marsrovers
bot.onText(/\/marsrovers/, function (msg) {
    try {
        chat_id = msg.chat.id;
        chat_username = msg.chat.username;
        //Log
        console.log("[" + chat_username + " @ID:" + chat_id + "]: " + "/marsrovers");
        bot.sendMessage(chat_id, "Scegli una missione", {
            //Keyboard rover
            "reply_markup": {
                "keyboard": [["Curiosity (in corso)"], ["Opportunity (terminata)"], ["Spirit (terminata)"], ["Perseverance (da febbraio 2021)"]]
            }
        });
    }
    catch (error) {
        console.log(colors.red("ERRORE"));
        console.log(error);
        return;
    }
})

//INTERPRETO LA TASTIERA DEI ROVER
bot.on("message", function (msg) {
    try {
        chat_id = msg.chat.id;
        chat_username = msg.chat.username;
        //Testo che riceve il bot
        var text = msg.text.toString().toLowerCase();
        const opts = {
            parse_mode: 'Markdown'
        };
        switch (text) {
            //#region Rover -> Rover disponibili
            case "curiosity (in corso)":
                //Log
                console.log("[" + chat_username + " @ID:" + chat_id + "]: " + "/marsrovers/curiosity");
                rover = "curiosity";
                //Keyboard telecamere
                bot.sendMessage(chat_id, "Scegli una telecamera di Curiosity", {
                    "reply_markup": {
                        "keyboard": [["Front Hazard Avoidance Camera (FHAZ)"], ["Rear Hazard Avoidance Camera (RHAZ)"], ["Mast Camera (MAST)"], ["Chemistry and Camera Complex (CHEMCAM)"], ["Mars Hand Lens Imager (MAHLI)"], ["Mars Descent Imager (MARDI)"], ["Navigation Camera (NAVCAM)"]]
                    }
                });
                return;
            case "opportunity (terminata)":
                //Log
                console.log("[" + chat_username + " @ID:" + chat_id + "]: " + "/marsrovers/opportunity");
                rover = "opportunity";
                bot.sendMessage(chat_id, "Scegli una telecamera di Opportunity", {
                    "reply_markup": {
                        "keyboard": [["Front Hazard Avoidance Camera (FHAZ)"], ["Rear Hazard Avoidance Camera (RHAZ)"], ["Navigation Camera (NAVCAM)"], ["Panoramic Camera (PANCAM)"]]
                    }
                });
                return;
            case "spirit (terminata)":
                //Log
                console.log("[" + chat_username + " @ID:" + chat_id + "]: " + "/marsrovers/spirit");
                rover = "spirit";
                bot.sendMessage(chat_id, "Scegli una telecamera di Spirit", {
                    "reply_markup": {
                        "keyboard": [["Front Hazard Avoidance Camera (FHAZ)"], ["Rear Hazard Avoidance Camera (RHAZ)"], ["Navigation Camera (NAVCAM)"], ["Panoramic Camera (PANCAM)"]]
                    }
                });
                return;
            case "perseverance (da febbraio 2021)":
                //Log
                console.log("[" + chat_username + " @ID:" + chat_id + "]: " + "/marsrovers/perseverance");
                rover = "perseverance";
                bot.sendMessage(chat_id, "*Avvio missione*: luglio 2020\n*Arrivo su Marte*: febbraio 2021", opts);
                return;
            //#endregion
            //#region Telecamere -> Telecamere disponibili
            case "front hazard avoidance camera (fhaz)":
                //Se l'utente non ha selezionato il rover
                if (rover == "") {
                    //Log
                    console.log("[" + chat_username + " @ID:" + chat_id + "]: " + "error_rovernotselected");
                    bot.sendMessage(chat_id, "Digitare il comando */marsrovers*\ne selezionare un rover", opts)
                    return;
                }
                switch (rover) {
                    case "curiosity":
                        //Log
                        console.log("[" + chat_username + " @ID:" + chat_id + "]: " + "/marsrovers/curiosity/fhaz");
                        TrovaFoto("curiosity", "fhaz", "", function (error, picture, date) {
                            if (error) {
                                throw error;
                            }
                            const opts = {
                                parse_mode: 'Markdown'
                            };
                            bot.sendPhoto(chat_id, picture)
                                .then(function () {
                                    bot.sendMessage(chat_id, "*Rover*: Curiosity\n*Data*: " + date + "\n*Telecamera*:\nFront Hazard Avoidance Camera (FHAZ)", opts);
                                });
                        });
                        return;
                    case "opportunity":
                        //Log
                        console.log("[" + chat_username + " @ID:" + chat_id + "]: " + "/marsrovers/opportunity/fhaz");
                        TrovaFoto("opportunity", "fhaz", "", function (error, random_photo, photo_date) {
                            if (error) {
                                throw error;
                            }
                            const opts = {
                                parse_mode: 'Markdown'
                            };
                            //Log
                            console.log("[" + photo_date + "] " + random_photo);
                            bot.sendPhoto(chat_id, random_photo)
                                .then(function () {
                                    bot.sendMessage(chat_id, "*Rover*: Opportunity\n*Data*: " + photo_date + "\n*Telecamera*:\nFront Hazard Avoidance Camera (FHAZ)", opts);
                                });
                        });
                        return;
                    case "spirit":
                        //Log
                        console.log("[" + chat_username + " @ID:" + chat_id + "]: " + "/marsrovers/spirit/fhaz");
                        TrovaFoto("spirit", "fhaz", "", function (error, random_photo, photo_date) {
                            if (error) {
                                throw error;
                            }
                            const opts = {
                                parse_mode: 'Markdown'
                            };
                            //Log
                            console.log("[" + photo_date + "] " + random_photo);
                            bot.sendPhoto(chat_id, random_photo)
                                .then(function () {
                                    bot.sendMessage(chat_id, "*Rover*: Spirit\n*Data*: " + photo_date + "\n*Telecamera*:\nFront Hazard Avoidance Camera (FHAZ)", opts);
                                });
                        });
                        return;
                    default:
                        return;
                }
            case "rear hazard avoidance camera (rhaz)":
                if (rover == "") {
                    //Log
                    console.log("[" + chat_username + " @ID:" + chat_id + "]: " + "error_rovernotselected");
                    bot.sendMessage(chat_id, "Digitare il comando */marsrovers*\ne selezionare un rover", opts)
                    return;
                }
                switch (rover) {
                    case "curiosity":
                        //Log
                        console.log("[" + chat_username + " @ID:" + chat_id + "]: " + "/marsrovers/curiosity/rhaz");
                        TrovaFoto("curiosity", "rhaz", "", function (error, last_photo, rover_maxdate) {
                            if (error) {
                                throw error;
                            }
                            const opts = {
                                parse_mode: 'Markdown'
                            };

                            bot.sendPhoto(chat_id, last_photo)
                                .then(function () {
                                    bot.sendMessage(chat_id, "*Rover*: Curiosity\n*Data*: " + rover_maxdate + "\n*Telecamera*:\nRear Hazard Avoidance Camera (RHAZ)", opts);
                                });
                        });
                        return;
                    case "opportunity":
                        //Log
                        console.log("[" + chat_username + " @ID:" + chat_id + "]: " + "/marsrovers/opportunity/rhaz");
                        TrovaFoto("opportunity", "rhaz", "", function (error, random_photo, photo_date) {
                            if (error) {
                                throw error;
                            }
                            const opts = {
                                parse_mode: 'Markdown'
                            };
                            //Log
                            console.log("[" + photo_date + "] " + random_photo);
                            bot.sendPhoto(chat_id, random_photo)
                                .then(function () {
                                    bot.sendMessage(chat_id, "*Rover*: Opportunity\n*Data*: " + photo_date + "\n*Telecamera*:\nRear Hazard Avoidance Camera (RHAZ)", opts);
                                });
                        });
                        return;
                    case "spirit":
                        //Log
                        console.log("[" + chat_username + " @ID:" + chat_id + "]: " + "/marsrovers/spirit/rhaz");
                        TrovaFoto("spirit", "rhaz", "", function (error, random_photo, photo_date) {
                            if (error) {
                                throw error;
                            }
                            const opts = {
                                parse_mode: 'Markdown'
                            };
                            //Log
                            console.log("[" + photo_date + "] " + random_photo);
                            bot.sendPhoto(chat_id, random_photo)
                                .then(function () {
                                    bot.sendMessage(chat_id, "*Rover*: Spirit\n*Data*: " + photo_date + "\n*Telecamera*:\nRear Hazard Avoidance Camera (RHAZ)", opts);
                                });
                        });
                        return;
                    default:
                        return;
                }
            case "mast camera (mast)":
                //Log
                console.log("[" + chat_username + " @ID:" + chat_id + "]: " + "/marsrovers/curiosity/mast");
                CuriosityMAST(function (picture, date, random, maxrandom) {
                    const opts = {
                        parse_mode: 'Markdown'
                    };
                    bot.sendPhoto(chat_id, picture)
                        .then(function () {
                            bot.sendMessage(chat_id, "*Rover*: Curiosity\n*Data*: " + date + " (" + (random + 1) + " di " + maxrandom + ")\n*Telecamera*:\nMast Camera (MAST)", opts);
                        });
                });
                return;
            case "chemistry and camera complex (chemcam)":
                console.log("[" + chat_username + " @ID:" + chat_id + "]: " + "/marsrovers/curiosity/chemcam");
                var rover_maxdate;
                var rover_maxsol;
                //GET rover_maxdate
                https.get("https://api.nasa.gov/mars-photos/api/v1/rovers/curiosity/photos?sol=" + "1" + "&api_key=" + nasa_key, function (response, error) {
                    if (error) {
                        throw error;
                    }
                    api_json = "";
                    response.on('data', function (chunk) {
                        api_json += chunk;
                    });
                    response.on('end', function () {
                        rover_maxdate = JSON.parse(api_json).photos[0].rover.max_date;
                        rover_maxsol = JSON.parse(api_json).photos[0].rover.max_sol;
                        //Log
                        console.log("curiosity max_date: " + rover_maxdate);
                        console.log("curiosity max_sol: " + rover_maxsol);
                        //GET photos
                        https.get("https://api.nasa.gov/mars-photos/api/v1/rovers/curiosity/photos?sol=" + rover_maxsol + "&camera=chemcam&api_key=" + nasa_key, function (response, error) {
                            if (error) {
                                throw error;
                            }
                            var latest_pictures = "";
                            var cam_pictures = [];
                            var last_picture = "";
                            response.on('data', function (chunk) {
                                latest_pictures += chunk;
                            });
                            response.on('end', function (error) {
                                for (var i = 0; i < JSON.parse(latest_pictures).photos.length; i++) {
                                    cam_pictures.push(JSON.parse(latest_pictures).photos[i].img_src);
                                }
                                var random = getRandomInt(0, cam_pictures.length);
                                last_picture = cam_pictures[random];
                                //Log
                                console.log("curiosity chemcam last_picture: " + last_picture);
                                const opts = {
                                    parse_mode: 'Markdown'
                                };
                                bot.sendPhoto(chat_id, last_picture)
                                    .then(function () {
                                        bot.sendMessage(chat_id, "*Rover*: Curiosity\n*Data*: " + rover_maxdate + " (" + (random + 1) + " di " + cam_pictures.length + ")\n*Telecamera*:\nChemistry and Camera Complex (CHEMCAM)", opts);
                                    });
                            });
                        });
                    });
                });
                return;
            case "mars hand lens imager (mahli)":
                console.log("[" + chat_username + " @ID:" + chat_id + "]: " + "/marsrovers/curiosity/mahli");
                CuriosityMAHLI(function (picture, date, random, maxrandom) {
                    const opts = {
                        parse_mode: 'Markdown'
                    };
                    bot.sendPhoto(chat_id, picture)
                        .then(function () {
                            bot.sendMessage(chat_id, "*Rover*: Curiosity\n*Data*: " + date + " (" + (random + 1) + " di " + maxrandom + ")\n*Telecamera*:\nMars Hand Lens Imager (MAHLI)", opts);
                        });
                });
                return;
            case "mars descent imager (mardi)":
                //Log
                console.log("[" + chat_username + " @ID:" + chat_id + "]: " + "/marsrovers/curiosity/mardi");
                TrovaMardiRecente(function (error, data_mardi, rnd, maxrnd, ultima_mardi) {
                    if (error) {
                        throw error;
                    }
                    const opts = {
                        parse_mode: 'Markdown'
                    };
                    //Log
                    console.log("[" + data_mardi + "] " + ultima_mardi);
                    bot.sendPhoto(chat_id, ultima_mardi)
                        .then(function () {
                            bot.sendMessage(chat_id, "*Rover*: Curiosity\n*Data*: " + data_mardi + " (" + (rnd + 1) + " di " + maxrnd + ")" + "\n*Telecamera*:\nMars Descent Imager (MARDI)", opts);
                        });
                });
                return;
            case "navigation camera (navcam)":
                if (rover == "") {
                    //Log
                    console.log("[" + chat_username + " @ID:" + chat_id + "]: " + "error_rovernotselected");
                    bot.sendMessage(chat_id, "Digitare il comando */marsrovers*\ne selezionare un rover", opts)
                    return;
                }
                switch (rover) {
                    case "curiosity":
                        //Log
                        console.log("[" + chat_username + " @ID:" + chat_id + "]: " + "/marsrovers/curiosity/navcam");
                        CuriosityNAVCAM(function (picture, date, random, maxrandom) {
                            const opts = {
                                parse_mode: 'Markdown'
                            };
                            bot.sendPhoto(chat_id, picture)
                                .then(function () {
                                    bot.sendMessage(chat_id, "*Rover*: Curiosity\n*Data*: " + date + " (" + (random + 1) + " di " + maxrandom + ")\n*Telecamera*:\nNavigation Camera (NAVCAM)", opts);
                                });
                        });
                        return;
                    case "opportunity":
                        //Log
                        console.log("[" + chat_username + " @ID:" + chat_id + "]: " + "/marsrovers/opportunity/navcam");
                        TrovaFoto("opportunity", "navcam", "", function (error, random_photo, photo_date) {
                            if (error) {
                                throw error;
                            }
                            const opts = {
                                parse_mode: 'Markdown'
                            };
                            //Log
                            console.log("[" + photo_date + "] " + random_photo);
                            bot.sendPhoto(chat_id, random_photo)
                                .then(function () {
                                    bot.sendMessage(chat_id, "*Rover*: Opportunity\n*Data*: " + photo_date + "\n*Telecamera*:\nNavigation Camera (NAVCAM)", opts);
                                });
                        });
                        return;
                    case "spirit":
                        //Log
                        console.log("[" + chat_username + " @ID:" + chat_id + "]: " + "/marsrovers/spirit/navcam");
                        TrovaFoto("spirit", "navcam", "", function (error, random_photo, photo_date) {
                            if (error) {
                                throw error;
                            }
                            const opts = {
                                parse_mode: 'Markdown'
                            };
                            //Log
                            console.log("[" + photo_date + "] " + random_photo);
                            bot.sendPhoto(chat_id, random_photo)
                                .then(function () {
                                    bot.sendMessage(chat_id, "*Rover*: Spirit\n*Data*: " + photo_date + "\n*Telecamera*:\nNavigation Camera (NAVCAM)", opts);
                                });
                        });
                        return;
                    default:
                        return;
                }
            case "panoramic camera (pancam)":
                if (rover == "") {
                    //Log
                    console.log("[" + chat_username + " @ID:" + chat_id + "]: " + "error_rovernotselected");
                    bot.sendMessage(chat_id, "Digitare il comando */marsrovers*\ne selezionare un rover", opts)
                    return;
                }
                switch (rover) {
                    case "opportunity":
                        //Log
                        console.log("[" + chat_username + " @ID:" + chat_id + "]: " + "/marsrovers/opportunity/pancam");
                        TrovaFoto("opportunity", "pancam", "S", function (error, random_photo, photo_date) {
                            if (error) {
                                throw error;
                            }
                            const opts = {
                                parse_mode: 'Markdown'
                            };
                            //Log
                            console.log("[" + photo_date + "] " + random_photo);
                            bot.sendPhoto(chat_id, random_photo)
                                .then(function () {
                                    bot.sendMessage(chat_id, "*Rover*: Opportunity\n*Data*: " + photo_date + "\n*Telecamera*:\nPanoramic Camera(PANCAM)", opts);
                                });
                        });
                        return;
                    case "spirit":
                        //Log
                        console.log("[" + chat_username + " @ID:" + chat_id + "]: " + "/marsrovers/spirit/pancam");
                        TrovaFoto("spirit", "pancam", "S", function (error, random_photo, photo_date) {
                            if (error) {
                                throw error;
                            }
                            const opts = {
                                parse_mode: 'Markdown'
                            };
                            //Log
                            console.log("[" + photo_date + "] " + random_photo);
                            bot.sendPhoto(chat_id, random_photo)
                                .then(function () {
                                    bot.sendMessage(chat_id, "*Rover*: Spirit\n*Data*: " + photo_date + "\n*Telecamera*:\nPanoramic Camera(PANCAM)", opts);
                                });
                        });
                        return;
                    default:
                        return;
                }
            default:
                return;
            //#endregion
        }
    }
    catch (error) {
        console.log(colors.red("ERRORE"));
        console.log(error);
        return;
    }
});

function TrovaFoto(RoverName, camera, skip, callback) {
    try {
        var rover_name = RoverName;
        var rover_maxdate = "";
        var rover_maxsol = "";
        //Sol da controllare
        var checked_sol;
        //Carattere da saltare per le immagini non volute
        var skip_char = skip;
        //Foto della camera selezionata
        var cam_pictures = [];
        //Foto nel giorno trovato
        var photos = "";
        //Reset api_json
        api_json = "";
        //GET rover_maxdate
        https.get("https://api.nasa.gov/mars-photos/api/v1/rovers/" + rover_name + "/photos?sol=" + "1" + "&api_key=" + nasa_key, function (response, error) {
            if (error) {
                throw error;
            }
            response.on('data', function (chunk) {
                api_json += chunk;
            });
            response.on('end', function () {
                rover_maxdate = JSON.parse(api_json).photos[0].rover.max_date;
                rover_maxsol = JSON.parse(api_json).photos[0].rover.max_sol;
                //Log
                console.log(rover_name + " max_date: " + rover_maxdate);
                console.log(rover_name + " max_sol: " + rover_maxsol);
                switch (rover_name) {
                    case "curiosity":
                        //Se è la prima volta
                        if (c_try_times == 0) {
                            checked_sol = rover_maxsol;
                        }
                        else {
                            checked_sol--;
                        }
                        //Log
                        console.log(rover_name + " checked_sol: " + checked_sol);
                        api_json = "";
                        //GET pictures
                        https.get("https://api.nasa.gov/mars-photos/api/v1/rovers/" + rover_name + "/photos?sol=" + checked_sol + "&camera=" + camera + "&api_key=" + nasa_key, function (response, error) {
                            if (error) {
                                throw error;
                            }
                            //Ultima foto della camera selezionata
                            var url_lastpicture = "";
                            response.on('data', function (chunk) {
                                api_json += chunk;
                            });
                            response.on('end', function (error) {
                                photos = JSON.parse(api_json).photos;
                                //Se ci sono immagini
                                if (photos.length != 0) {
                                    //Resetto i tentativi
                                    c_try_times = 0;
                                    //Data della foto trovata
                                    var photo_date;
                                    //Se ci sono foto da scartare
                                    if (skip_char != "") {
                                        for (var i = 0; i < photos.length; i++) {
                                            if (!(photos[i].img_src).toString().includes(skip_char)) {
                                                cam_pictures.push(photos[i].img_src);
                                                photo_date = photos.earth_date;
                                            }
                                        }
                                    }
                                    else {
                                        for (var i = 0; i < photos.length; i++) {
                                            cam_pictures.push(photos[i].img_src);
                                            photo_date = photos[i].earth_date;
                                        }
                                    }
                                    //Prendo l'url dell'ultima foto
                                    url_lastpicture = cam_pictures[cam_pictures.length - 1];
                                    //Log
                                    console.log(rover_name + " " + camera + " last_picture: " + url_lastpicture);
                                    callback(error, url_lastpicture, photo_date);
                                }
                                else {
                                    //Log
                                    console.log("EMPTY");
                                    //Se è la prima volta
                                    if (c_try_times == 0) {
                                        bot.sendMessage(chat_id, "Attendere...\nRicerca della più recente in corso");
                                        c_try_times++;
                                    }
                                    return TrovaFoto(RoverName, camera, skip, callback);
                                }
                            });
                        });
                        return;
                    case "opportunity":
                    case "spirit":
                        //SOL random
                        var random_sol = getRandomInt(1, rover_maxsol + 1);
                        //Log
                        console.log("random_sol: " + random_sol);
                        api_json = "";
                        //GET pictures
                        https.get("https://api.nasa.gov/mars-photos/api/v1/rovers/" + rover_name + "/photos?sol=" + random_sol + "&camera=" + camera + "&api_key=" + nasa_key, function (response, error) {
                            if (error) {
                                throw error;
                            }
                            response.on('data', function (chunk) {
                                api_json += chunk;
                            });
                            response.on('end', function (error) {
                                photos = JSON.parse(api_json).photos;
                                if (skip_char != "") {
                                    for (var i = 0; i < photos.length; i++) {
                                        if (!(photos[i].img_src).toString().includes(skip_char)) {
                                            cam_pictures.push(photos[i].img_src);
                                        }
                                    }
                                }
                                else {
                                    for (var i = 0; i < photos.length; i++) {
                                        cam_pictures.push(photos[i].img_src);
                                    }
                                }
                                if (cam_pictures.length != 0) {
                                    os_try_times = 0;
                                    var random_day_picture = getRandomInt(0, cam_pictures.length)
                                    var selected_picture = cam_pictures[random_day_picture];
                                    var photo_date = photos[random_day_picture].earth_date;
                                    //Log
                                    console.log(rover_name + " " + camera + " selected_picture: " + selected_picture + " (id: " + photos[random_day_picture].id + ")");
                                    callback(error, selected_picture, photo_date);
                                }
                                else {
                                    console.log("EMPTY");
                                    if (os_try_times == 0) {
                                        bot.sendMessage(chat_id, "Attendere...");
                                        os_try_times++;
                                    }
                                    return TrovaFoto(RoverName, camera, skip, callback);
                                }
                            });
                        });
                        return;
                    default:
                        return;
                }
            });
        });
    }
    catch (error) {
        console.log(colors.red("ERRORE"));
        console.log(error);
        return;
    }
}

function TrovaMardiRecente(callback) {
    try {
        var rover_maxdate;
        var rover_maxsol;
        //GET rover_maxdate
        https.get("https://api.nasa.gov/mars-photos/api/v1/rovers/curiosity/photos?sol=" + "21" + "&api_key=" + nasa_key, function (response, error) {
            if (error) {
                throw error;
            }
            api_json = "";
            response.on('data', function (chunk) {
                api_json += chunk;
            });
            response.on('end', function () {
                rover_maxdate = JSON.parse(api_json).photos[0].rover.max_date;
                rover_maxsol = JSON.parse(api_json).photos[0].rover.max_sol;
                if (sol_mardi_variabile == 0) {
                    sol_mardi_variabile = rover_maxsol;
                }
                //Log
                console.log("curiosity max_date: " + rover_maxdate);
                console.log("curiosity sol_mardi_variabile test: " + sol_mardi_variabile);
                //GET photos
                https.get("https://api.nasa.gov/mars-photos/api/v1/rovers/curiosity/photos?sol=" + sol_mardi_variabile + "&camera=mardi&api_key=" + nasa_key, function (response, error) {
                    if (error) {
                        throw error;
                    }
                    var latest_pictures = "";
                    var cam_pictures = [];
                    var ultima_mardi = "";
                    var data_mardi;
                    response.on('data', function (chunk) {
                        latest_pictures += chunk;
                    });
                    response.on('end', function (error) {
                        for (var i = 0; i < JSON.parse(latest_pictures).photos.length; i++) {
                            if ((JSON.parse(latest_pictures).photos[i].img_src).toString().includes("E")) {
                                data_mardi = JSON.parse(latest_pictures).photos[i].earth_date;
                                cam_pictures.push(JSON.parse(latest_pictures).photos[i].img_src);
                            }
                        }
                        if (cam_pictures.length != 0) {
                            mardi_try_times = 0;
                            var random = getRandomInt(0, cam_pictures.length);
                            ultima_mardi = cam_pictures[random];
                            //Log
                            console.log("curiosity mardi last_picture: " + ultima_mardi);
                            callback(error, data_mardi, random, cam_pictures.length, ultima_mardi);
                        }
                        else {
                            //Log
                            console.log("MARDI-EMPTY");
                            if (mardi_try_times == 0) {
                                mardi_try_times++;

                                bot.sendMessage(chat_id, "Attendere...\nRicerca delle più recenti in corso");
                            }
                            sol_mardi_variabile--;
                            return TrovaMardiRecente(callback);
                        }
                    });
                });
            });
        });
    }
    catch (error) {
        console.log(colors.red("ERRORE"));
        console.log(error);
        return;
    }
}

function CuriosityMAHLI(callback) {
    try {
        var rover_maxdate;
        var rover_maxsol;
        var data;
        //GET ROVER_MAXDATE
        https.get("https://api.nasa.gov/mars-photos/api/v1/rovers/curiosity/photos?sol=" + "1" + "&api_key=" + nasa_key, function (response, error) {
            if (error) {
                throw error;
            }
            api_json = "";
            response.on('data', function (chunk) {
                api_json += chunk;
            });
            response.on('end', function () {
                var photos = JSON.parse(api_json).photos;
                rover_maxdate = photos[0].rover.max_date;
                rover_maxsol = photos[0].rover.max_sol;
                if (c_try_times == 0) {
                    sol_mahli_variabile = rover_maxsol;
                }
                //Log
                console.log("curiosity max_date: " + rover_maxdate);
                console.log("curiosity sol_mahli_variabile test: " + sol_mahli_variabile);
                https.get("https://api.nasa.gov/mars-photos/api/v1/rovers/curiosity/photos?sol=" + sol_mahli_variabile + "&camera=mahli&api_key=" + nasa_key, function (response, error) {
                    if (error) {
                        throw error;
                    }
                    var latest_pictures = "";
                    var cam_pictures = [];
                    var last_picture = "";
                    response.on('data', function (chunk) {
                        latest_pictures += chunk;
                    });
                    response.on('end', function () {
                        if (JSON.parse(latest_pictures).photos.length != 0) {
                            c_try_times = 0;
                            for (var i = 0; i < JSON.parse(latest_pictures).photos.length; i++) {
                                if ((JSON.parse(latest_pictures).photos[i].img_src).toString().includes("R") && !(JSON.parse(latest_pictures).photos[i].img_src).toString().includes("U")) {
                                    cam_pictures.push(JSON.parse(latest_pictures).photos[i].img_src);
                                    data = JSON.parse(latest_pictures).photos[i].earth_date;
                                }
                            }
                            var random = getRandomInt(0, cam_pictures.length);
                            last_picture = cam_pictures[random];
                            //Log
                            console.log("curiosity mahli last_picture: " + last_picture);
                            callback(last_picture, data, random, cam_pictures.length)
                        }
                        else {
                            //Log
                            console.log("CURIOSITYMAHLI-EMPTY");
                            if (c_try_times == 0) {
                                c_try_times++;
                                bot.sendMessage(chat_id, "Attendere...\nRicerca delle più recenti in corso");
                            }
                            sol_mahli_variabile--;
                            return CuriosityMAHLI(callback);
                        }
                    });
                });
            });
        });
    }
    catch (error) {
        console.log(colors.red("ERRORE"));
        console.log(error);
        return;
    }
}

function CuriosityMAST(callback) {
    try {
        var rover_maxdate;
        var rover_maxsol;
        var data;
        //GET ROVER_MAXDATE
        https.get("https://api.nasa.gov/mars-photos/api/v1/rovers/curiosity/photos?sol=" + "1" + "&api_key=" + nasa_key, function (response, error) {
            if (error) {
                throw error;
            }
            api_json = "";
            response.on('data', function (chunk) {
                api_json += chunk;
            });
            response.on('end', function () {
                var photos = JSON.parse(api_json).photos;
                rover_maxdate = photos[0].rover.max_date;
                rover_maxsol = photos[0].rover.max_sol;
                if (c_try_times == 0) {
                    sol_mast_variabile = rover_maxsol;
                }
                //Log
                console.log("curiosity max_date: " + rover_maxdate);
                console.log("curiosity sol_mast_variabile test: " + sol_mast_variabile);
                https.get("https://api.nasa.gov/mars-photos/api/v1/rovers/curiosity/photos?sol=" + sol_mast_variabile + "&camera=mast&api_key=" + nasa_key, function (response, error) {
                    if (error) {
                        throw error;
                    }
                    var latest_pictures = "";
                    var cam_pictures = [];
                    var last_picture = "";
                    response.on('data', function (chunk) {
                        latest_pictures += chunk;
                    });
                    response.on('end', function () {
                        if (JSON.parse(latest_pictures).photos.length != 0) {
                            c_try_times = 0;
                            for (var i = 0; i < JSON.parse(latest_pictures).photos.length; i++) {
                                if ((JSON.parse(latest_pictures).photos[i].img_src).toString().includes("C") || (JSON.parse(latest_pictures).photos[i].img_src).toString().includes("E")) {
                                    cam_pictures.push(JSON.parse(latest_pictures).photos[i].img_src);
                                    data = JSON.parse(latest_pictures).photos[i].earth_date;
                                }
                            }
                            var random = getRandomInt(0, cam_pictures.length);
                            last_picture = cam_pictures[random];
                            //Log
                            console.log("curiosity mast last_picture: " + last_picture);
                            callback(last_picture, data, random, cam_pictures.length)
                        }
                        else {
                            //Log
                            console.log("CURIOSITYMAST-EMPTY");
                            if (c_try_times == 0) {
                                c_try_times++;
                                bot.sendMessage(chat_id, "Attendere...\nRicerca delle più recenti in corso");
                            }
                            sol_mast_variabile--;
                            return CuriosityMAST(callback);
                        }
                    });
                });
            });
        });
    }
    catch (error) {
        console.log(colors.red("ERRORE"));
        console.log(error);
        return;
    }
}

function CuriosityNAVCAM(callback) {
    try {
        var rover_maxdate;
        var rover_maxsol;
        var data;
        //GET ROVER_MAXDATE
        https.get("https://api.nasa.gov/mars-photos/api/v1/rovers/curiosity/photos?sol=" + "1" + "&api_key=" + nasa_key, function (response, error) {
            if (error) {
                throw error;
            }
            api_json = "";
            response.on('data', function (chunk) {
                api_json += chunk;
            });
            response.on('end', function () {
                var photos = JSON.parse(api_json).photos;
                rover_maxdate = photos[0].rover.max_date;
                rover_maxsol = photos[0].rover.max_sol;
                if (c_try_times == 0) {
                    sol_navcam_variabile = rover_maxsol;
                }
                //Log
                console.log("curiosity max_date: " + rover_maxdate);
                console.log("curiosity sol_navcam_variabile test: " + sol_navcam_variabile);
                https.get("https://api.nasa.gov/mars-photos/api/v1/rovers/curiosity/photos?sol=" + sol_navcam_variabile + "&camera=navcam&api_key=" + nasa_key, function (response, error) {
                    if (error) {
                        throw error;
                    }
                    var latest_pictures = "";
                    var cam_pictures = [];
                    var last_picture = "";
                    response.on('data', function (chunk) {
                        latest_pictures += chunk;
                    });
                    response.on('end', function () {
                        c_try_times = 0;
                        for (var i = 0; i < JSON.parse(latest_pictures).photos.length; i++) {
                            if ((JSON.parse(latest_pictures).photos[i].img_src).toString().includes("F")) {
                                cam_pictures.push(JSON.parse(latest_pictures).photos[i].img_src);
                                data = JSON.parse(latest_pictures).photos[i].earth_date;
                            }
                        }
                        if (cam_pictures.length != 0) {
                            var random = getRandomInt(0, cam_pictures.length);
                            last_picture = cam_pictures[random];
                            //Log
                            console.log("curiosity navcam last_picture: " + last_picture);
                            callback(last_picture, data, random, cam_pictures.length)
                        }
                        else {
                            //Log
                            console.log("CURIOSITYNAVCAM-EMPTY");
                            if (c_try_times == 0) {
                                c_try_times++;
                                bot.sendMessage(chat_id, "Attendere...\nRicerca delle più recenti in corso");
                            }
                            sol_navcam_variabile--;
                            return CuriosityNAVCAM(callback);
                        }
                    });
                });
            });
        });
    }
    catch (error) {
        console.log(colors.red("ERRORE"));
        console.log(error);
        return;
    }
}

//RANDOM
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //Il max è escluso e il min è incluso
}

//INTERPRETO I POLLING ERROR
bot.on("polling_error", function (err) {
    console.log(err);
});
