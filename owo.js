var fs = global.nodemodule["fs"]
var text2png = global.nodemodule["text2png"]
var path = global.nodemodule['path']
var merge = global.nodemodule['merge-images']
var fetch = global.nodemodule["node-fetch"]
var request = global.nodemodule["sync-request"]
var { Canvas, Image, createCanvas } = global.nodemodule["canvas"]
var resize = global.nodemodule["resize-img"]
var jimp = global.nodemodule['jimp']
var apikey = "7b3886e3efe99c2a3b8db51c3a1e8f9325d8226f"//dont spam pls, ratelimit 1200req/min, use your own apikey to prevent ratelimiting
function rect(ctx, x, y, width, height, radius = 5) { //source at https://github.com/Moorad/the-beautiful-bot/blob/master/handlers/format.ts

    if (typeof radius === 'number') {
        radius = {
            tl: radius,
            tr: radius,
            br: radius,
            bl: radius
        };
    }
    ctx.beginPath();
    ctx.moveTo(x + radius.tl, y);
    ctx.lineTo(x + width - radius.tr, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
    ctx.lineTo(x + width, y + height - radius.br);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
    ctx.lineTo(x + radius.bl, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
    ctx.lineTo(x, y + radius.tl);
    ctx.quadraticCurveTo(x, y, x + radius.tl, y);
    ctx.closePath();
    ctx.fill();
}
function ensureExists(path, mask) {
    if (typeof mask != 'number') {
        mask = 0o777;
    }
    try {
        fs.mkdirSync(path, {
            mode: mask,
            recursive: true
        });
        return undefined;
    } catch (ex) {
        return { err: ex };
    }
}
var rootpath = path.resolve(__dirname, "..", "osu-data");
ensureExists(rootpath);
ensureExists(path.join(rootpath, "template"))
ensureExists(path.join(rootpath, "font"))
ensureExists(path.join(rootpath, "temp"))
ensureExists(path.join(rootpath, "temp", "avatar"))
ensureExists(path.join(rootpath, "temp", "username"))
ensureExists(path.join(rootpath, "temp", "countryflag"))
ensureExists(path.join(rootpath, "temp", "level"))
ensureExists(path.join(rootpath, "temp", "country"))
ensureExists(path.join(rootpath, "temp", "globalrank"))
ensureExists(path.join(rootpath, "temp", "countryrank"))
ensureExists(path.join(rootpath, "temp", "A"))
ensureExists(path.join(rootpath, "temp", "S"))
ensureExists(path.join(rootpath, "temp", "SH"))
ensureExists(path.join(rootpath, "temp", "SS"))
ensureExists(path.join(rootpath, "temp", "SSH"))
ensureExists(path.join(rootpath, "temp", "playtime"))
ensureExists(path.join(rootpath, "temp", "pp"))
ensureExists(path.join(rootpath, "temp", "accuracy"))
ensureExists(path.join(rootpath, "temp", "score"))
ensureExists(path.join(rootpath, "temp", "card"))
var nameMapping = {
    "background": path.join(rootpath, "template", "backgroundcard.png"),
    "avatarcornerround": path.join(rootpath, "template", "avatarcornerround.png"),
    "font": path.join(rootpath, "font", "font.ttf"),
    "osu": path.join(rootpath, "template", "osu.png"),
    "taiko": path.join(rootpath, "template", "taiko.png"),
    "catch": path.join(rootpath, "template", "catch.png"),
    "mania": path.join(rootpath, "template", "mania.png")
}
for (var n in nameMapping) {
    if (!fs.existsSync(nameMapping[n])) {
        fs.writeFileSync(nameMapping[n], global.fileMap[n]); // lỗi dòng này // hết lỗi rồi
    }
}
var fontpath = path.join(rootpath, "font", "font.ttf")
var osu = async function (type, data) {
    var username = data.args.slice(1).join(" ")
    var reply //??
    switch (username) {
        case "":
            reply = global.config.commandPrefix + "osu <username>"
            return {
                handler: "internal",
                data: reply
            }
        default:
            switch (apikey) {
                case "":
                    reply = "thay apikey trong owo.js trước khi sử dụng lệnh"
                    return {
                        handler: "internal",
                        data: reply
                    }
                    break;
                default:
                    var api = `https://osu.ppy.sh/api/get_user?k=${apikey}&u=${username}&m=0`
                    var bufferdata = request("GET", api);
                    var stringdata = bufferdata.body.toString();
                    switch (stringdata) {
                        case "[]":
                            reply = "không tìm thấy người chơi tên" + ` "${username}"`
                            return {
                                handler: "internal",
                                data: reply
                            }
                        default:
                            var objdata = JSON.parse(stringdata);
                            var levelpercent = (objdata[0]['level']-Math.floor(objdata[0]['level'])).toFixed(2)*100;
                            var user_id = objdata[0]["user_id"];
                            var username = objdata[0]["username"];
                            var globalrank = objdata[0]["pp_rank"];
                            var countryrank = objdata[0]["pp_country_rank"]
                            var country = objdata[0]["country"]
                            var score = objdata[0]["total_score"]
                            var playcount = objdata[0]["playcount"]
                            var accuracy = Number(objdata[0]["accuracy"]).toFixed(2) + `%`
                            var pp = Number(objdata[0]["pp_raw"]).toFixed(0)
                            var level = Number(objdata[0]["level"]).toFixed(0)
                            var playtime = (Number(objdata[0]["total_seconds_played"]) / 3600).toFixed(1) + `h`
                            var A = objdata[0]["count_rank_a"]
                            var S = objdata[0]["count_rank_s"]
                            var SH = objdata[0]["count_rank_sh"]
                            var SS = objdata[0]["count_rank_ss"]
                            var SSH = objdata[0]["count_rank_ssh"]                              // nawnnawn
                            var countryflag = await fetch(`https://osu.ppy.sh/images/flags/${country}.png`).then(res => res.buffer())
                            var bufferavatar = await fetch(`https://a.ppy.sh/${user_id}`).then(res => res.buffer())
                            var userpng = `osu_` + username + `.png`
                            var userjpg = `osu_` + username + `.jpg`
                            if (score > 999999999) {
                                var score = (score / 1000000000).toFixed(1) + `B`
                            }
                            else if (score > 999999) {
                                var score = (score / 1000000).toFixed(1) + `M`
                            }
                            else if (score > 99999) {
                                var score = (score / 1000).toFixed(1) + `K`
                            }
                            else {
                                var score = score //wtf why did i write this line //work so no touching
                            }
                            fs.writeFileSync(path.join(rootpath, "temp", "countryflag", country + `flag.png`), countryflag)
                            fs.writeFileSync(path.join(rootpath, "temp", "avatar", userjpg), bufferavatar)
                            try {
                                var resizedavatarbuffer = await resize(fs.readFileSync(path.join(rootpath, "temp", "avatar", userjpg)), {
                                    width: 277,
                                    height: 277
                                })
                                fs.writeFileSync(path.join(rootpath, "temp", "avatar", userjpg), resizedavatarbuffer)
                            } catch (giferr) {
                                await jimp.read(path.join(rootpath, "temp", "avatar", userjpg)).then(giferr => {
                                    return giferr.resize(277, 277).write(path.join(rootpath, "temp", "avatar", userjpg))
                                }).catch(err => { console.log(err) })
                            }
                            var resizedflag = await resize(fs.readFileSync(path.join(rootpath, "temp", "countryflag", country + `flag.png`)), {
                                width: 60,
                                height: 40
                            })

                            fs.writeFileSync(path.join(rootpath, "temp", "countryflag", country + `flag.png`), resizedflag)
                            fs.writeFileSync(path.join(rootpath, "temp", "username", userpng), text2png(username, {
                                color: "#ffffff",
                                font: "63px Varela",
                                localFontPath: fontpath,
                                localFontName: "Varela"
                            }))
                            fs.writeFileSync(path.join(rootpath, "temp", "country", country + `.png`), text2png(country, {
                                color: "#ffffff",
                                font: "36px Varela",
                                localFontPath: fontpath,
                                localFontName: "Varela"
                            }))
                            fs.writeFileSync(path.join(rootpath, "temp", "globalrank", userpng), text2png(`#` + globalrank, {
                                color: "#ffffff",
                                font: "76px Varela",
                                localFontPath: fontpath,
                                localFontName: "Varela"
                            }))
                            fs.writeFileSync(path.join(rootpath, "temp", "countryrank", userpng), text2png(`#` + countryrank, {
                                color: "#ffffff",
                                font: "57px Varela",
                                localFontPath: fontpath,
                                localFontName: "Varela"
                            }))
                            fs.writeFileSync(path.join(rootpath, "temp", "level", userpng), text2png(level, {
                                color: "#ffffff",
                                font: "30px Varela",
                                localFontPath: fontpath,
                                localFontName: "Varela"
                            }))
                            fs.writeFileSync(path.join(rootpath, "temp", "A", userpng), text2png(A, {
                                color: "#ffffff",
                                font: "28px Varela",
                                localFontPath: fontpath,
                                localFontName: "Varela"
                            }))
                            fs.writeFileSync(path.join(rootpath, "temp", "S", userpng), text2png(S, {
                                color: "#ffffff",
                                font: "28px Varela",
                                localFontPath: fontpath,
                                localFontName: "Varela"
                            }))
                            fs.writeFileSync(path.join(rootpath, "temp", "SH", userpng), text2png(SH, {
                                color: "#ffffff",
                                font: "28px Varela",
                                localFontPath: fontpath,
                                localFontName: "Varela"
                            }))
                            fs.writeFileSync(path.join(rootpath, "temp", "SS", userpng), text2png(SS, {
                                color: "#ffffff",
                                font: "28px Varela",
                                localFontPath: fontpath,
                                localFontName: "Varela"
                            }))
                            fs.writeFileSync(path.join(rootpath, "temp", "SSH", userpng), text2png(SSH, {
                                color: "#ffffff",
                                font: "28px Varela",
                                localFontPath: fontpath,
                                localFontName: "Varela"
                            }))
                            fs.writeFileSync(path.join(rootpath, "temp", "pp", userpng), text2png(pp, {
                                color: "#ffffff",
                                font: "38px Varela",
                                localFontPath: fontpath,
                                localFontName: "Varela"
                            }))
                            fs.writeFileSync(path.join(rootpath, "temp", "accuracy", userpng), text2png(accuracy, {
                                color: "#ffffff",
                                font: "38px Varela",
                                localFontPath: fontpath,
                                localFontName: "Varela"
                            }))
                            fs.writeFileSync(path.join(rootpath, "temp", "playtime", userpng), text2png(playtime, {
                                color: "#ffffff",
                                font: "38px Varela",
                                localFontPath: fontpath,
                                localFontName: "Varela"
                            }))
                            fs.writeFileSync(path.join(rootpath, "temp", "score", userpng), text2png(score, {
                                color: "#ffffff",
                                font: "38px Varela",
                                localFontPath: fontpath,
                                localFontName: "Varela"
                            }))
                            //create canvas
                            const canvas = createCanvas(1200, 624);
                            const ctx = canvas.getContext('2d');
                            //new img object
                            const img = new Image();
                            //template
                            img.onload = function () { ctx.drawImage(img, 0, 0) };
                            img.src = path.join(rootpath, "template", "backgroundcard.png");
                            //avatar
                            img.onload = function () { ctx.drawImage(img, 45, 55) };
                            img.src = path.join(rootpath, "temp", "avatar", userjpg);
                            //avatar cỏner
                            img.onload = function () { ctx.drawImage(img, 45, 55) };
                            img.src = path.join(rootpath, "template", "avatarcornerround.png");
                            //username 
                            img.onload = function () { ctx.drawImage(img, 347, 72) };
                            img.src = path.join(rootpath, "temp", "username", userpng);
                            //country flag
                            img.onload = function () { ctx.drawImage(img, 350, 130) };
                            img.src = path.join(rootpath, "temp", "countryflag", country + `flag.png`);
                            //country
                            img.onload = function () { ctx.drawImage(img, 425, 140) };
                            img.src = path.join(rootpath, "temp", "country", country + `.png`);
                            //globalrank 
                            img.onload = function () { ctx.drawImage(img, 347, 190) };
                            img.src = path.join(rootpath, "temp", "globalrank", userpng);
                            //country rank
                            img.onload = function () { ctx.drawImage(img, 347, 276) };
                            img.src = path.join(rootpath, "temp", "countryrank", userpng);
                            //leval
                            img.onload = function () { ctx.drawImage(img, Math.ceil(376 - (level.length * 18 + (level.length - 1) * 1) / 2) + 1, 360) };
                            img.src = path.join(rootpath, "temp", "level", userpng);
                            //A rank
                            img.onload = function () { ctx.drawImage(img, Math.ceil(810 - (A.length * 16 + (A.length - 1) * 1) / 2) + 1, 204) };
                            img.src = path.join(rootpath, "temp", "A", userpng);
                            //S
                            img.onload = function () { ctx.drawImage(img, Math.ceil(970 - (S.length * 16 + (S.length - 1) * 1) / 2) + 1, 204) };
                            img.src = path.join(rootpath,"temp","S",userpng);
                            //SH (silver S)
                            img.onload = function () { ctx.drawImage(img, Math.ceil(1129 - (SH.length * 16 + (SH.length - 1) * 1) / 2) + 1, 204) };
                            img.src = path.join(rootpath,"temp","SH",userpng);
                            //SS
                            img.onload = function () { ctx.drawImage(img, Math.ceil(890 - (SS.length * 16 + (SS.length - 1) * 1) / 2) + 1, 312) };
                            img.src = path.join(rootpath,"temp","SS",userpng);
                            //SSH(silver SS)
                            img.onload = function () { ctx.drawImage(img, Math.ceil(1050 - (SSH.length * 16 + (SSH.length - 1) * 1) / 2) + 1, 312) };
                            img.src = path.join(rootpath,"temp","SSH",userpng);
                            //pp
                            img.onload = function () { ctx.drawImage(img, Math.ceil(137 - (pp.length * 23 + (pp.length - 1) * 3) / 2) + 1, 546) };
                            img.src = path.join(rootpath,"temp","pp",userpng);
                            //accuraty
                            img.onload = function () { ctx.drawImage(img, Math.ceil(393 - ((accuracy.length - 1) * 23 + (accuracy.length - 1) * 3) / 2) - 1, 546) };
                            img.src = path.join(rootpath,"temp","accuracy",userpng);
                            //playtime
                            img.onload = function () { ctx.drawImage(img, Math.ceil(700 - (playtime.length * 23 + (playtime.length - 1) * 3) / 2) + 1, 546) };
                            img.src = path.join(rootpath,"temp","playtime",userpng);
                            //total score
                            img.onload = function () { ctx.drawImage(img, Math.ceil(1020 - ((score.length -1) * 23 + (score.length - 1) * 3) / 2) + 1, 546) };
                            img.src = path.join(rootpath,"temp","score",userpng);
                            //osu! logo .-.
                            img.onload = function () { ctx.drawImage(img, 252, 261) };
                            img.src = path.join(rootpath,"template","osu.png");
                            //fill the level
                            ctx.fillStyle = '#969696';//790, 370
                            rect(ctx, 440, 360, 400, 20, 4); 
                            ctx.fillStyle = 'rgb(255, 204, 34)'
                            rect(ctx, 440, 360, 400/100*levelpercent, 20, 4)
                            fs.writeFileSync(path.join(rootpath, "temp", "card", userjpg), canvas.toBuffer());
                            const imgstream = fs.createReadStream(path.join(rootpath, "temp", "card", userjpg));
                            data.return({
                                handler: "internal",
                                data: {
                                    body: "",
                                    attachment: ([imgstream])
                                }
                            });
                            /*
                            var dcmcouldntloadimg = await merge(
                                [
                                    {
                                        src: path.join(rootpath,"template","backgroundcard.png")//
                                    },
                                    {
                                        src: path.join(rootpath,"temp","avatar",userjpg),//
                                        x:45,
                                        y:55
                                    },
                                    {
                                        src: path.join(rootpath,"template","avatarcornerround.png"),//
                                        x:45,
                                        y:55
                                    },
                                    {
                                        src: path.join(rootpath,"temp","username",userpng),//
                                        x:347,
                                        y:72
                                    },
                                    {
                                        src: path.join(rootpath,"temp","countryflag",country+`flag.png`),//
                                        x:350,
                                        y:130
                                    },
                                    {
                                        src: path.join(rootpath,"temp","country",country+`.png`),//
                                        x:425,
                                        y:140
                                    },
                                    {
                                        src: path.join(rootpath,"temp","globalrank",userpng),//
                                        x:347,
                                        y:190
                                    },
                                    {
                                        src: path.join(rootpath,"temp","countryrank",userpng),//
                                        x:347,
                                        y:276
                                    },
                                    {
                                        src: path.join(rootpath,"temp","level",userpng),//
                                        x: Math.ceil(376 - (level.length * 18 + (level.length - 1) * 1) / 2) + 1,
                                        y: 360
                                    },
                                    {
                                        src: path.join(rootpath,"temp","A",userpng),//
                                        x: Math.ceil(810 - (A.length * 16 + (A.length - 1) * 1) / 2) + 1,
                                        y: 204
                                    },
                                    {
                                        src: path.join(rootpath,"temp","S",userpng),//
                                        x: Math.ceil(970 - (S.length * 16 + (S.length - 1) * 1) / 2) + 1,
                                        y: 204
                                    },
                                    {
                                        src: path.join(rootpath,"temp","SH",userpng),//
                                        x: Math.ceil(1129 - (SH.length * 16 + (SH.length - 1) * 1) / 2) + 1,
                                        y: 204
                                    },
                                    {
                                        src: path.join(rootpath,"temp","SS",userpng),//
                                        x: Math.ceil(890 - (SS.length * 16 + (SS.length - 1) * 1) / 2) + 1,
                                        y: 312
                                    },
                                    {
                                        src: path.join(rootpath,"temp","SSH",userpng),//
                                        x: Math.ceil(1050 - (SSH.length * 16 + (SSH.length - 1) * 1) / 2) + 1,
                                        y: 312
                                    },
                                    {
                                        src: path.join(rootpath,"temp","pp",userpng),//
                                        x: Math.ceil(137 - (pp.length * 23 + (pp.length - 1) * 3) / 2) + 1,
                                        y: 546
                                    },
                                    {
                                        src: path.join(rootpath,"temp","accuracy",userpng),//
                                        x: Math.ceil(393 - ((accuracy.length - 1) * 23 + (accuracy.length - 1) * 3) / 2) - 1,
                                        y: 546
                                    },
                                    {
                                        src: path.join(rootpath,"temp","playtime",userpng),//
                                        x: Math.ceil(700 - (playtime.length * 23 + (playtime.length - 1) * 3) / 2) + 1,
                                        y: 546
                                    },
                                    {
                                        src: path.join(rootpath,"temp","score",userpng),//
                                        x: Math.ceil(1020 - ((score.length -1) * 23 + (score.length - 1) * 3) / 2) + 1,
                                        y: 546
                                    },
                                    {
                                        src: path.join(rootpath,"template","osu.png"),//
                                        x:252,
                                        y:261
                                    }
                                ],
                                {
                                    Canvas: Canvas,
                                    Image: Image
                                }).then(function (res) {
                                    fs.writeFile(
                                        path.join(rootpath, "temp", "card",userjpg),res.replace(/^data:image\/png;base64,/, ""),"base64",function (err) { if (err) data.log(err);
                                            var img = fs.createReadStream(path.join(rootpath, "temp", "card",userjpg));
                                            data.return({
                                                handler: "internal",
                                                data: {
                                                    body: "",
                                                    attachment: ([img]) //made it lol
                                                }
                                            });
                                        });
                                })
                                */
                            break;
                    }
                    break;
            }
    }
}
var osutaiko = async function (type, data) {
    var username = data.args.slice(1).join(" ")
    var reply
    switch (username) {
        case "":
            reply = global.config.commandPrefix + "osutaiko <username>"
            return {
                handler: "internal",
                data: reply
            }
        default:
            switch (apikey) {
                case "":
                    reply = "thay apikey trong owo.js trước khi sử dụng lệnh"
                    return {
                        handler: "internal",
                        data: reply
                    }
                    break;
                default:
                    var api = `https://osu.ppy.sh/api/get_user?k=${apikey}&u=${username}&m=1`
                    var bufferdata = request("GET", api);
                    var stringdata = bufferdata.body.toString();
                    switch (stringdata) {
                        case "[]":
                            reply = "không tìm thấy người chơi tên" + ` "${username}"`
                            return {
                                handler: "internal",
                                data: reply
                            }
                        default:
                            var objdata = JSON.parse(stringdata);
                            var levelpercent = (objdata[0]['level']-Math.floor(objdata[0]['level'])).toFixed(2)*100;
                            var user_id = objdata[0]["user_id"];
                            var username = objdata[0]["username"];
                            var globalrank = objdata[0]["pp_rank"];
                            var countryrank = objdata[0]["pp_country_rank"]
                            var country = objdata[0]["country"]
                            var score = objdata[0]["total_score"]
                            var playcount = objdata[0]["playcount"]
                            var accuracy = Number(objdata[0]["accuracy"]).toFixed(2) + `%`
                            var pp = Number(objdata[0]["pp_raw"]).toFixed(0)
                            var level = Number(objdata[0]["level"]).toFixed(0)
                            var playtime = (Number(objdata[0]["total_seconds_played"]) / 3600).toFixed(1) + `h`
                            var A = objdata[0]["count_rank_a"]
                            var S = objdata[0]["count_rank_s"]
                            var SH = objdata[0]["count_rank_sh"]
                            var SS = objdata[0]["count_rank_ss"]
                            var SSH = objdata[0]["count_rank_ssh"]
                            var countryflag = await fetch(`https://osu.ppy.sh/images/flags/${country}.png`).then(res => res.buffer())
                            var bufferavatar = await fetch(`https://a.ppy.sh/${user_id}`).then(res => res.buffer())
                            var userpng = `taiko_` + username + `.png`
                            var userjpg = `taiko_` + username + `.jpg`
                            if (score > 999999999) {
                                var score = (score / 1000000000).toFixed(1) + `B`
                            }
                            else if (score > 999999) {
                                var score = (score / 1000000).toFixed(1) + `M`
                            }
                            else if (score > 99999) {
                                var score = (score / 1000).toFixed(1) + `K`
                            }
                            else {
                                var score = score
                            }
                            fs.writeFileSync(path.join(rootpath, "temp", "countryflag", country + `flag.png`), countryflag)
                            fs.writeFileSync(path.join(rootpath, "temp", "avatar", userjpg), bufferavatar)
                            try {
                                var resizedavatarbuffer = await resize(fs.readFileSync(path.join(rootpath, "temp", "avatar", userjpg)), {
                                    width: 277,
                                    height: 277
                                })
                                fs.writeFileSync(path.join(rootpath, "temp", "avatar", userjpg), resizedavatarbuffer)
                            } catch (giferr) {
                                await jimp.read(path.join(rootpath, "temp", "avatar", userjpg)).then(giferr => {
                                    return giferr.resize(277, 277).write(path.join(rootpath, "temp", "avatar", userjpg))
                                }).catch(err => { console.log(err) })
                            }
                            var resizedflag = await resize(fs.readFileSync(path.join(rootpath, "temp", "countryflag", country + `flag.png`)), {
                                width: 60,
                                height: 40
                            })

                            fs.writeFileSync(path.join(rootpath, "temp", "countryflag", country + `flag.png`), resizedflag)
                            fs.writeFileSync(path.join(rootpath, "temp", "username", userpng), text2png(username, {
                                color: "#ffffff",
                                font: "63px Varela",
                                localFontPath: fontpath,
                                localFontName: "Varela"
                            }))
                            fs.writeFileSync(path.join(rootpath, "temp", "country", country + `.png`), text2png(country, {
                                color: "#ffffff",
                                font: "36px Varela",
                                localFontPath: fontpath,
                                localFontName: "Varela"
                            }))
                            fs.writeFileSync(path.join(rootpath, "temp", "globalrank", userpng), text2png(`#` + globalrank, {
                                color: "#ffffff",
                                font: "76px Varela",
                                localFontPath: fontpath,
                                localFontName: "Varela"
                            }))
                            fs.writeFileSync(path.join(rootpath, "temp", "countryrank", userpng), text2png(`#` + countryrank, {
                                color: "#ffffff",
                                font: "57px Varela",
                                localFontPath: fontpath,
                                localFontName: "Varela"
                            }))
                            fs.writeFileSync(path.join(rootpath, "temp", "level", userpng), text2png(level, {
                                color: "#ffffff",
                                font: "30px Varela",
                                localFontPath: fontpath,
                                localFontName: "Varela"
                            }))
                            fs.writeFileSync(path.join(rootpath, "temp", "A", userpng), text2png(A, {
                                color: "#ffffff",
                                font: "28px Varela",
                                localFontPath: fontpath,
                                localFontName: "Varela"
                            }))
                            fs.writeFileSync(path.join(rootpath, "temp", "S", userpng), text2png(S, {
                                color: "#ffffff",
                                font: "28px Varela",
                                localFontPath: fontpath,
                                localFontName: "Varela"
                            }))
                            fs.writeFileSync(path.join(rootpath, "temp", "SH", userpng), text2png(SH, {
                                color: "#ffffff",
                                font: "28px Varela",
                                localFontPath: fontpath,
                                localFontName: "Varela"
                            }))
                            fs.writeFileSync(path.join(rootpath, "temp", "SS", userpng), text2png(SS, {
                                color: "#ffffff",
                                font: "28px Varela",
                                localFontPath: fontpath,
                                localFontName: "Varela"
                            }))
                            fs.writeFileSync(path.join(rootpath, "temp", "SSH", userpng), text2png(SSH, {
                                color: "#ffffff",
                                font: "28px Varela",
                                localFontPath: fontpath,
                                localFontName: "Varela"
                            }))
                            fs.writeFileSync(path.join(rootpath, "temp", "pp", userpng), text2png(pp, {
                                color: "#ffffff",
                                font: "38px Varela",
                                localFontPath: fontpath,
                                localFontName: "Varela"
                            }))
                            fs.writeFileSync(path.join(rootpath, "temp", "accuracy", userpng), text2png(accuracy, {
                                color: "#ffffff",
                                font: "38px Varela",
                                localFontPath: fontpath,
                                localFontName: "Varela"
                            }))
                            fs.writeFileSync(path.join(rootpath, "temp", "playtime", userpng), text2png(playtime, {
                                color: "#ffffff",
                                font: "38px Varela",
                                localFontPath: fontpath,
                                localFontName: "Varela"
                            }))
                            fs.writeFileSync(path.join(rootpath, "temp", "score", userpng), text2png(score, {
                                color: "#ffffff",
                                font: "38px Varela",
                                localFontPath: fontpath,
                                localFontName: "Varela"
                            }))
                            //create canvas
                            const canvas = createCanvas(1200, 624);
                            const ctx = canvas.getContext('2d');
                            //new img object
                            const img = new Image();
                            //template
                            img.onload = function () { ctx.drawImage(img, 0, 0) };
                            img.src = path.join(rootpath, "template", "backgroundcard.png");
                            //avatar
                            img.onload = function () { ctx.drawImage(img, 45, 55) };
                            img.src = path.join(rootpath, "temp", "avatar", userjpg);
                            //avatar cỏner
                            img.onload = function () { ctx.drawImage(img, 45, 55) };
                            img.src = path.join(rootpath, "template", "avatarcornerround.png");
                            //username 
                            img.onload = function () { ctx.drawImage(img, 347, 72) };
                            img.src = path.join(rootpath, "temp", "username", userpng);
                            //country flag
                            img.onload = function () { ctx.drawImage(img, 350, 130) };
                            img.src = path.join(rootpath, "temp", "countryflag", country + `flag.png`);
                            //country
                            img.onload = function () { ctx.drawImage(img, 425, 140) };
                            img.src = path.join(rootpath, "temp", "country", country + `.png`);
                            //globalrank 
                            img.onload = function () { ctx.drawImage(img, 347, 190) };
                            img.src = path.join(rootpath, "temp", "globalrank", userpng);
                            //country rank
                            img.onload = function () { ctx.drawImage(img, 347, 276) };
                            img.src = path.join(rootpath, "temp", "countryrank", userpng);
                            //leval
                            img.onload = function () { ctx.drawImage(img, Math.ceil(376 - (level.length * 18 + (level.length - 1) * 1) / 2) + 1, 360) };
                            img.src = path.join(rootpath, "temp", "level", userpng);
                            //A rank
                            img.onload = function () { ctx.drawImage(img, Math.ceil(810 - (A.length * 16 + (A.length - 1) * 1) / 2) + 1, 204) };
                            img.src = path.join(rootpath, "temp", "A", userpng);
                            //S
                            img.onload = function () { ctx.drawImage(img, Math.ceil(970 - (S.length * 16 + (S.length - 1) * 1) / 2) + 1, 204) };
                            img.src = path.join(rootpath,"temp","S",userpng);
                            //SH (silver S)
                            img.onload = function () { ctx.drawImage(img, Math.ceil(1129 - (SH.length * 16 + (SH.length - 1) * 1) / 2) + 1, 204) };
                            img.src = path.join(rootpath,"temp","SH",userpng);
                            //SS
                            img.onload = function () { ctx.drawImage(img, Math.ceil(890 - (SS.length * 16 + (SS.length - 1) * 1) / 2) + 1, 312) };
                            img.src = path.join(rootpath,"temp","SS",userpng);
                            //SSH(silver SS)
                            img.onload = function () { ctx.drawImage(img, Math.ceil(1050 - (SSH.length * 16 + (SSH.length - 1) * 1) / 2) + 1, 312) };
                            img.src = path.join(rootpath,"temp","SSH",userpng);
                            //pp
                            img.onload = function () { ctx.drawImage(img, Math.ceil(137 - (pp.length * 23 + (pp.length - 1) * 3) / 2) + 1, 546) };
                            img.src = path.join(rootpath,"temp","pp",userpng);
                            //accuraty
                            img.onload = function () { ctx.drawImage(img, Math.ceil(393 - ((accuracy.length - 1) * 23 + (accuracy.length - 1) * 3) / 2) - 1, 546) };
                            img.src = path.join(rootpath,"temp","accuracy",userpng);
                            //playtime
                            img.onload = function () { ctx.drawImage(img, Math.ceil(700 - (playtime.length * 23 + (playtime.length - 1) * 3) / 2) + 1, 546) };
                            img.src = path.join(rootpath,"temp","playtime",userpng);
                            //total score
                            img.onload = function () { ctx.drawImage(img, Math.ceil(1020 - ((score.length -1) * 23 + (score.length - 1) * 3) / 2) + 1, 546) };
                            img.src = path.join(rootpath,"temp","score",userpng);
                            //osu!taiko logo .-.
                            img.onload = function () { ctx.drawImage(img, 252, 261) };
                            img.src = path.join(rootpath,"template","taiko.png");
                            //fill the level
                            ctx.fillStyle = '#969696';//790, 370
                            rect(ctx, 440, 360, 400, 20, 4); 
                            ctx.fillStyle = 'rgb(255, 204, 34)'
                            rect(ctx, 440, 360, 400/100*levelpercent, 20, 4)
                            fs.writeFileSync(path.join(rootpath, "temp", "card", userjpg), canvas.toBuffer());
                            const imgstream = fs.createReadStream(path.join(rootpath, "temp", "card", userjpg));
                            data.return({
                                handler: "internal",
                                data: {
                                    body: "",
                                    attachment: ([imgstream])
                                }
                            });
                            /*
                            var dcmcouldntloadimg = await merge(
                                [
                                    {
                                        src: path.join(rootpath, "template", "backgroundcard.png")
                                    },
                                    {
                                        src: path.join(rootpath, "temp", "avatar", userjpg),
                                        x: 45,
                                        y: 55
                                    },
                                    {
                                        src: path.join(rootpath, "template", "avatarcornerround.png"),
                                        x: 45,
                                        y: 55
                                    },
                                    {
                                        src: path.join(rootpath, "temp", "username", userpng),
                                        x: 347,
                                        y: 72
                                    },
                                    {
                                        src: path.join(rootpath, "temp", "countryflag", country + `flag.png`),
                                        x: 350,
                                        y: 130
                                    },
                                    {
                                        src: path.join(rootpath, "temp", "country", country + `.png`),
                                        x: 425,
                                        y: 140
                                    },
                                    {
                                        src: path.join(rootpath, "temp", "globalrank", userpng),
                                        x: 347,
                                        y: 190
                                    },
                                    {
                                        src: path.join(rootpath, "temp", "countryrank", userpng),
                                        x: 347,
                                        y: 276
                                    },
                                    {
                                        src: path.join(rootpath, "temp", "level", userpng),
                                        x: Math.ceil(376 - (level.length * 18 + (level.length - 1) * 1) / 2) + 1,
                                        y: 360
                                    },
                                    {
                                        src: path.join(rootpath, "temp", "A", userpng),
                                        x: Math.ceil(810 - (A.length * 16 + (A.length - 1) * 1) / 2) + 1,
                                        y: 204
                                    },
                                    {
                                        src: path.join(rootpath, "temp", "S", userpng),
                                        x: Math.ceil(970 - (S.length * 16 + (S.length - 1) * 1) / 2) + 1,
                                        y: 204
                                    },
                                    {
                                        src: path.join(rootpath, "temp", "SH", userpng),
                                        x: Math.ceil(1129 - (SH.length * 16 + (SH.length - 1) * 1) / 2) + 1,
                                        y: 204
                                    },
                                    {
                                        src: path.join(rootpath, "temp", "SS", userpng),
                                        x: Math.ceil(890 - (SS.length * 16 + (SS.length - 1) * 1) / 2) + 1,
                                        y: 312
                                    },
                                    {
                                        src: path.join(rootpath, "temp", "SSH", userpng),
                                        x: Math.ceil(1050 - (SSH.length * 16 + (SSH.length - 1) * 1) / 2) + 1,
                                        y: 312
                                    },
                                    {
                                        src: path.join(rootpath, "temp", "pp", userpng),
                                        x: Math.ceil(137 - (pp.length * 23 + (pp.length - 1) * 3) / 2) + 1,
                                        y: 546
                                    },
                                    {
                                        src: path.join(rootpath, "temp", "accuracy", userpng),
                                        x: Math.ceil(393 - ((accuracy.length - 1) * 23 + (accuracy.length - 1) * 3) / 2) - 1,
                                        y: 546
                                    },
                                    {
                                        src: path.join(rootpath, "temp", "playtime", userpng),
                                        x: Math.ceil(700 - (playtime.length * 23 + (playtime.length - 1) * 3) / 2) + 1,
                                        y: 546
                                    },
                                    {
                                        src: path.join(rootpath, "temp", "score", userpng),
                                        x: Math.ceil(1020 - ((score.length - 1) * 23 + (score.length - 1) * 3) / 2) + 1,
                                        y: 546
                                    },
                                    {
                                        src: path.join(rootpath, "template", "taiko.png"),
                                        x: 252,
                                        y: 261
                                    }
                                ],
                                {
                                    Canvas: Canvas,
                                    Image: Image
                                }).then(function (res) {
                                    fs.writeFile(
                                        path.join(rootpath, "temp", "card", userjpg), res.replace(/^data:image\/png;base64,/, ""), "base64", function (err) {
                                            if (err) data.log(err);
                                            var img = fs.createReadStream(path.join(rootpath, "temp", "card", userjpg));
                                            data.return({
                                                handler: "internal",
                                                data: {
                                                    body: "",
                                                    attachment: ([img])
                                                }
                                            });
                                        });
                                })
                                */
                            break;
                    }
                    break;
            }
    }
}
var osucatch = async function (type, data) {
    var username = data.args.slice(1).join(" ")
    var reply
    switch (username) {
        case "":
            reply = global.config.commandPrefix + "osucatch <username>"
            return {
                handler: "internal",
                data: reply
            }
        default:
            switch (apikey) {
                case "":
                    reply = "thay apikey trong owo.js trước khi sử dụng lệnh"
                    return {
                        handler: "internal",
                        data: reply
                    }
                    break;
                default:
                    var api = `https://osu.ppy.sh/api/get_user?k=${apikey}&u=${username}&m=2`
                    var bufferdata = request("GET", api);
                    var stringdata = bufferdata.body.toString();
                    switch (stringdata) {
                        case "[]":
                            reply = "không tìm thấy người chơi tên" + ` "${username}"`
                            return {
                                handler: "internal",
                                data: reply
                            }
                        default:
                            var objdata = JSON.parse(stringdata);
                            var levelpercent = (objdata[0]['level']-Math.floor(objdata[0]['level'])).toFixed(2)*100;
                            var user_id = objdata[0]["user_id"];
                            var username = objdata[0]["username"];
                            var globalrank = objdata[0]["pp_rank"];
                            var countryrank = objdata[0]["pp_country_rank"]
                            var country = objdata[0]["country"]
                            var score = objdata[0]["total_score"]
                            var playcount = objdata[0]["playcount"]
                            var accuracy = Number(objdata[0]["accuracy"]).toFixed(2) + `%`
                            var pp = Number(objdata[0]["pp_raw"]).toFixed(0)
                            var level = Number(objdata[0]["level"]).toFixed(0)
                            var playtime = (Number(objdata[0]["total_seconds_played"]) / 3600).toFixed(1) + `h`
                            var A = objdata[0]["count_rank_a"]
                            var S = objdata[0]["count_rank_s"]
                            var SH = objdata[0]["count_rank_sh"]
                            var SS = objdata[0]["count_rank_ss"]
                            var SSH = objdata[0]["count_rank_ssh"]
                            var countryflag = await fetch(`https://osu.ppy.sh/images/flags/${country}.png`).then(res => res.buffer())
                            var bufferavatar = await fetch(`https://a.ppy.sh/${user_id}`).then(res => res.buffer())
                            var userpng = `catch_` + username + `.png`
                            var userjpg = `catch_` + username + `.jpg`
                            if (score > 999999999) {
                                var score = (score / 1000000000).toFixed(1) + `B`
                            }
                            else if (score > 999999) {
                                var score = (score / 1000000).toFixed(1) + `M`
                            }
                            else if (score > 99999) {
                                var score = (score / 1000).toFixed(1) + `K`
                            }
                            else {
                                var score = score
                            }
                            fs.writeFileSync(path.join(rootpath, "temp", "countryflag", country + `flag.png`), countryflag)
                            fs.writeFileSync(path.join(rootpath, "temp", "avatar", userjpg), bufferavatar)
                            try {
                                var resizedavatarbuffer = await resize(fs.readFileSync(path.join(rootpath, "temp", "avatar", userjpg)), {
                                    width: 277,
                                    height: 277
                                })
                                fs.writeFileSync(path.join(rootpath, "temp", "avatar", userjpg), resizedavatarbuffer)
                            } catch (giferr) {
                                await jimp.read(path.join(rootpath, "temp", "avatar", userjpg)).then(giferr => {
                                    return giferr.resize(277, 277).write(path.join(rootpath, "temp", "avatar", userjpg))
                                }).catch(err => { console.log(err) })
                            }
                            var resizedflag = await resize(fs.readFileSync(path.join(rootpath, "temp", "countryflag", country + `flag.png`)), {
                                width: 60,
                                height: 40
                            })

                            fs.writeFileSync(path.join(rootpath, "temp", "countryflag", country + `flag.png`), resizedflag)
                            fs.writeFileSync(path.join(rootpath, "temp", "username", userpng), text2png(username, {
                                color: "#ffffff",
                                font: "63px Varela",
                                localFontPath: fontpath,
                                localFontName: "Varela"
                            }))
                            fs.writeFileSync(path.join(rootpath, "temp", "country", country + `.png`), text2png(country, {
                                color: "#ffffff",
                                font: "36px Varela",
                                localFontPath: fontpath,
                                localFontName: "Varela"
                            }))
                            fs.writeFileSync(path.join(rootpath, "temp", "globalrank", userpng), text2png(`#` + globalrank, {
                                color: "#ffffff",
                                font: "76px Varela",
                                localFontPath: fontpath,
                                localFontName: "Varela"
                            }))
                            fs.writeFileSync(path.join(rootpath, "temp", "countryrank", userpng), text2png(`#` + countryrank, {
                                color: "#ffffff",
                                font: "57px Varela",
                                localFontPath: fontpath,
                                localFontName: "Varela"
                            }))
                            fs.writeFileSync(path.join(rootpath, "temp", "level", userpng), text2png(level, {
                                color: "#ffffff",
                                font: "30px Varela",
                                localFontPath: fontpath,
                                localFontName: "Varela"
                            }))
                            fs.writeFileSync(path.join(rootpath, "temp", "A", userpng), text2png(A, {
                                color: "#ffffff",
                                font: "28px Varela",
                                localFontPath: fontpath,
                                localFontName: "Varela"
                            }))
                            fs.writeFileSync(path.join(rootpath, "temp", "S", userpng), text2png(S, {
                                color: "#ffffff",
                                font: "28px Varela",
                                localFontPath: fontpath,
                                localFontName: "Varela"
                            }))
                            fs.writeFileSync(path.join(rootpath, "temp", "SH", userpng), text2png(SH, {
                                color: "#ffffff",
                                font: "28px Varela",
                                localFontPath: fontpath,
                                localFontName: "Varela"
                            }))
                            fs.writeFileSync(path.join(rootpath, "temp", "SS", userpng), text2png(SS, {
                                color: "#ffffff",
                                font: "28px Varela",
                                localFontPath: fontpath,
                                localFontName: "Varela"
                            }))
                            fs.writeFileSync(path.join(rootpath, "temp", "SSH", userpng), text2png(SSH, {
                                color: "#ffffff",
                                font: "28px Varela",
                                localFontPath: fontpath,
                                localFontName: "Varela"
                            }))
                            fs.writeFileSync(path.join(rootpath, "temp", "pp", userpng), text2png(pp, {
                                color: "#ffffff",
                                font: "38px Varela",
                                localFontPath: fontpath,
                                localFontName: "Varela"
                            }))
                            fs.writeFileSync(path.join(rootpath, "temp", "accuracy", userpng), text2png(accuracy, {
                                color: "#ffffff",
                                font: "38px Varela",
                                localFontPath: fontpath,
                                localFontName: "Varela"
                            }))
                            fs.writeFileSync(path.join(rootpath, "temp", "playtime", userpng), text2png(playtime, {
                                color: "#ffffff",
                                font: "38px Varela",
                                localFontPath: fontpath,
                                localFontName: "Varela"
                            }))
                            fs.writeFileSync(path.join(rootpath, "temp", "score", userpng), text2png(score, {
                                color: "#ffffff",
                                font: "38px Varela",
                                localFontPath: fontpath,
                                localFontName: "Varela"
                            }))
                            //create canvas
                            const canvas = createCanvas(1200, 624);
                            const ctx = canvas.getContext('2d');
                            //new img object
                            const img = new Image();
                            //template
                            img.onload = function () { ctx.drawImage(img, 0, 0) };
                            img.src = path.join(rootpath, "template", "backgroundcard.png");
                            //avatar
                            img.onload = function () { ctx.drawImage(img, 45, 55) };
                            img.src = path.join(rootpath, "temp", "avatar", userjpg);
                            //avatar cỏner
                            img.onload = function () { ctx.drawImage(img, 45, 55) };
                            img.src = path.join(rootpath, "template", "avatarcornerround.png");
                            //username 
                            img.onload = function () { ctx.drawImage(img, 347, 72) };
                            img.src = path.join(rootpath, "temp", "username", userpng);
                            //country flag
                            img.onload = function () { ctx.drawImage(img, 350, 130) };
                            img.src = path.join(rootpath, "temp", "countryflag", country + `flag.png`);
                            //country
                            img.onload = function () { ctx.drawImage(img, 425, 140) };
                            img.src = path.join(rootpath, "temp", "country", country + `.png`);
                            //globalrank 
                            img.onload = function () { ctx.drawImage(img, 347, 190) };
                            img.src = path.join(rootpath, "temp", "globalrank", userpng);
                            //country rank
                            img.onload = function () { ctx.drawImage(img, 347, 276) };
                            img.src = path.join(rootpath, "temp", "countryrank", userpng);
                            //leval
                            img.onload = function () { ctx.drawImage(img, Math.ceil(376 - (level.length * 18 + (level.length - 1) * 1) / 2) + 1, 360) };
                            img.src = path.join(rootpath, "temp", "level", userpng);
                            //A rank
                            img.onload = function () { ctx.drawImage(img, Math.ceil(810 - (A.length * 16 + (A.length - 1) * 1) / 2) + 1, 204) };
                            img.src = path.join(rootpath, "temp", "A", userpng);
                            //S
                            img.onload = function () { ctx.drawImage(img, Math.ceil(970 - (S.length * 16 + (S.length - 1) * 1) / 2) + 1, 204) };
                            img.src = path.join(rootpath,"temp","S",userpng);
                            //SH (silver S)
                            img.onload = function () { ctx.drawImage(img, Math.ceil(1129 - (SH.length * 16 + (SH.length - 1) * 1) / 2) + 1, 204) };
                            img.src = path.join(rootpath,"temp","SH",userpng);
                            //SS
                            img.onload = function () { ctx.drawImage(img, Math.ceil(890 - (SS.length * 16 + (SS.length - 1) * 1) / 2) + 1, 312) };
                            img.src = path.join(rootpath,"temp","SS",userpng);
                            //SSH(silver SS)
                            img.onload = function () { ctx.drawImage(img, Math.ceil(1050 - (SSH.length * 16 + (SSH.length - 1) * 1) / 2) + 1, 312) };
                            img.src = path.join(rootpath,"temp","SSH",userpng);
                            //pp
                            img.onload = function () { ctx.drawImage(img, Math.ceil(137 - (pp.length * 23 + (pp.length - 1) * 3) / 2) + 1, 546) };
                            img.src = path.join(rootpath,"temp","pp",userpng);
                            //accuraty
                            img.onload = function () { ctx.drawImage(img, Math.ceil(393 - ((accuracy.length - 1) * 23 + (accuracy.length - 1) * 3) / 2) - 1, 546) };
                            img.src = path.join(rootpath,"temp","accuracy",userpng);
                            //playtime
                            img.onload = function () { ctx.drawImage(img, Math.ceil(700 - (playtime.length * 23 + (playtime.length - 1) * 3) / 2) + 1, 546) };
                            img.src = path.join(rootpath,"temp","playtime",userpng);
                            //total score
                            img.onload = function () { ctx.drawImage(img, Math.ceil(1020 - ((score.length -1) * 23 + (score.length - 1) * 3) / 2) + 1, 546) };
                            img.src = path.join(rootpath,"temp","score",userpng);
                            //osu!catch logo .-.
                            img.onload = function () { ctx.drawImage(img, 252, 261) };
                            img.src = path.join(rootpath,"template","catch.png");
                            //fill the level
                            ctx.fillStyle = '#969696';//790, 370
                            rect(ctx, 440, 360, 400, 20, 4); 
                            ctx.fillStyle = 'rgb(255, 204, 34)'
                            rect(ctx, 440, 360, 400/100*levelpercent, 20, 4)
                            fs.writeFileSync(path.join(rootpath, "temp", "card", userjpg), canvas.toBuffer());
                            const imgstream = fs.createReadStream(path.join(rootpath, "temp", "card", userjpg));
                            data.return({
                                handler: "internal",
                                data: {
                                    body: "",
                                    attachment: ([imgstream])
                                }
                            });
                            /*
                            var dcmcouldntloadimg = await merge(
                                [
                                    {
                                        src: path.join(rootpath, "template", "backgroundcard.png")
                                    },
                                    {
                                        src: path.join(rootpath, "temp", "avatar", userjpg),
                                        x: 45,
                                        y: 55
                                    },
                                    {
                                        src: path.join(rootpath, "template", "avatarcornerround.png"),
                                        x: 45,
                                        y: 55
                                    },
                                    {
                                        src: path.join(rootpath, "temp", "username", userpng),
                                        x: 347,
                                        y: 72
                                    },
                                    {
                                        src: path.join(rootpath, "temp", "countryflag", country + `flag.png`),
                                        x: 350,
                                        y: 130
                                    },
                                    {
                                        src: path.join(rootpath, "temp", "country", country + `.png`),
                                        x: 425,
                                        y: 140
                                    },
                                    {
                                        src: path.join(rootpath, "temp", "globalrank", userpng),
                                        x: 347,
                                        y: 190
                                    },
                                    {
                                        src: path.join(rootpath, "temp", "countryrank", userpng),
                                        x: 347,
                                        y: 276
                                    },
                                    {
                                        src: path.join(rootpath, "temp", "level", userpng),
                                        x: Math.ceil(376 - (level.length * 18 + (level.length - 1) * 1) / 2) + 1,
                                        y: 360
                                    },
                                    {
                                        src: path.join(rootpath, "temp", "A", userpng),
                                        x: Math.ceil(810 - (A.length * 16 + (A.length - 1) * 1) / 2) + 1,
                                        y: 204
                                    },
                                    {
                                        src: path.join(rootpath, "temp", "S", userpng),
                                        x: Math.ceil(970 - (S.length * 16 + (S.length - 1) * 1) / 2) + 1,
                                        y: 204
                                    },
                                    {
                                        src: path.join(rootpath, "temp", "SH", userpng),
                                        x: Math.ceil(1129 - (SH.length * 16 + (SH.length - 1) * 1) / 2) + 1,
                                        y: 204
                                    },
                                    {
                                        src: path.join(rootpath, "temp", "SS", userpng),
                                        x: Math.ceil(890 - (SS.length * 16 + (SS.length - 1) * 1) / 2) + 1,
                                        y: 312
                                    },
                                    {
                                        src: path.join(rootpath, "temp", "SSH", userpng),
                                        x: Math.ceil(1050 - (SSH.length * 16 + (SSH.length - 1) * 1) / 2) + 1,
                                        y: 312
                                    },
                                    {
                                        src: path.join(rootpath, "temp", "pp", userpng),
                                        x: Math.ceil(137 - (pp.length * 23 + (pp.length - 1) * 3) / 2) + 1,
                                        y: 546
                                    },
                                    {
                                        src: path.join(rootpath, "temp", "accuracy", userpng),
                                        x: Math.ceil(393 - ((accuracy.length - 1) * 23 + (accuracy.length - 1) * 3) / 2) - 1,
                                        y: 546
                                    },
                                    {
                                        src: path.join(rootpath, "temp", "playtime", userpng),
                                        x: Math.ceil(700 - (playtime.length * 23 + (playtime.length - 1) * 3) / 2) + 1,
                                        y: 546
                                    },
                                    {
                                        src: path.join(rootpath, "temp", "score", userpng),
                                        x: Math.ceil(1020 - ((score.length - 1) * 23 + (score.length - 1) * 3) / 2) + 1,
                                        y: 546
                                    },
                                    {
                                        src: path.join(rootpath, "template", "catch.png"),
                                        x: 252,
                                        y: 261
                                    }
                                ],
                                {
                                    Canvas: Canvas,
                                    Image: Image
                                }).then(function (res) {
                                    fs.writeFile(
                                        path.join(rootpath, "temp", "card", userjpg), res.replace(/^data:image\/png;base64,/, ""), "base64", function (err) {
                                            if (err) data.log(err);
                                            var img = fs.createReadStream(path.join(rootpath, "temp", "card", userjpg));
                                            data.return({
                                                handler: "internal",
                                                data: {
                                                    body: "",
                                                    attachment: ([img])
                                                }
                                            });
                                        });
                                })
                                */
                            break;
                    }
                    break;
            }
    }
}
var osumania = async function (type, data) {
    var username = data.args.slice(1).join(" ")
    var reply
    switch (username) {
        case "":
            reply = global.config.commandPrefix + "osumania <username>"
            return {
                handler: "internal",
                data: reply
            }
        default:
            switch (apikey) {
                case "":
                    reply = "thay apikey trong owo.js trước khi sử dụng lệnh"
                    return {
                        handler: "internal",
                        data: reply
                    }
                    break;
                default:
                    var api = `https://osu.ppy.sh/api/get_user?k=${apikey}&u=${username}&m=3`
                    var bufferdata = request("GET", api);
                    var stringdata = bufferdata.body.toString();
                    switch (stringdata) {
                        case "[]":
                            reply = "không tìm thấy người chơi tên" + ` "${username}"`
                            return {
                                handler: "internal",
                                data: reply
                            }
                        default:
                            var objdata = JSON.parse(stringdata);
                            var levelpercent = (objdata[0]['level']-Math.floor(objdata[0]['level'])).toFixed(2)*100;
                            var user_id = objdata[0]["user_id"];
                            var username = objdata[0]["username"];
                            var globalrank = objdata[0]["pp_rank"];
                            var countryrank = objdata[0]["pp_country_rank"]
                            var country = objdata[0]["country"]
                            var score = objdata[0]["total_score"]
                            var playcount = objdata[0]["playcount"]
                            var accuracy = Number(objdata[0]["accuracy"]).toFixed(2) + `%`
                            var pp = Number(objdata[0]["pp_raw"]).toFixed(0)
                            var level = Number(objdata[0]["level"]).toFixed(0)
                            var playtime = (Number(objdata[0]["total_seconds_played"]) / 3600).toFixed(1) + `h`
                            var A = objdata[0]["count_rank_a"]
                            var S = objdata[0]["count_rank_s"]
                            var SH = objdata[0]["count_rank_sh"]
                            var SS = objdata[0]["count_rank_ss"]
                            var SSH = objdata[0]["count_rank_ssh"]
                            var countryflag = await fetch(`https://osu.ppy.sh/images/flags/${country}.png`).then(res => res.buffer())
                            var bufferavatar = await fetch(`https://a.ppy.sh/${user_id}`).then(res => res.buffer())
                            var userpng = `mania_` + username + `.png`
                            var userjpg = `mania_` + username + `.jpg`
                            if (score > 999999999) {
                                var score = (score / 1000000000).toFixed(1) + `B`
                            }
                            else if (score > 999999) {
                                var score = (score / 1000000).toFixed(1) + `M`
                            }
                            else if (score > 99999) {
                                var score = (score / 1000).toFixed(1) + `K`
                            }
                            else {
                                var score = score
                            }
                            fs.writeFileSync(path.join(rootpath, "temp", "countryflag", country + `flag.png`), countryflag)
                            fs.writeFileSync(path.join(rootpath, "temp", "avatar", userjpg), bufferavatar)
                            try {
                                var resizedavatarbuffer = await resize(fs.readFileSync(path.join(rootpath, "temp", "avatar", userjpg)), {
                                    width: 277,
                                    height: 277
                                })
                                fs.writeFileSync(path.join(rootpath, "temp", "avatar", userjpg), resizedavatarbuffer)
                            } catch (giferr) {
                                await jimp.read(path.join(rootpath, "temp", "avatar", userjpg)).then(giferr => {
                                    return giferr.resize(277, 277).write(path.join(rootpath, "temp", "avatar", userjpg))
                                }).catch(err => { console.log(err) })
                            }
                            var resizedflag = await resize(fs.readFileSync(path.join(rootpath, "temp", "countryflag", country + `flag.png`)), {
                                width: 60,
                                height: 40
                            })

                            fs.writeFileSync(path.join(rootpath, "temp", "countryflag", country + `flag.png`), resizedflag)
                            fs.writeFileSync(path.join(rootpath, "temp", "username", userpng), text2png(username, {
                                color: "#ffffff",
                                font: "63px Varela",
                                localFontPath: fontpath,
                                localFontName: "Varela"
                            }))
                            fs.writeFileSync(path.join(rootpath, "temp", "country", country + `.png`), text2png(country, {
                                color: "#ffffff",
                                font: "36px Varela",
                                localFontPath: fontpath,
                                localFontName: "Varela"
                            }))
                            fs.writeFileSync(path.join(rootpath, "temp", "globalrank", userpng), text2png(`#` + globalrank, {
                                color: "#ffffff",
                                font: "76px Varela",
                                localFontPath: fontpath,
                                localFontName: "Varela"
                            }))
                            fs.writeFileSync(path.join(rootpath, "temp", "countryrank", userpng), text2png(`#` + countryrank, {
                                color: "#ffffff",
                                font: "57px Varela",
                                localFontPath: fontpath,
                                localFontName: "Varela"
                            }))
                            fs.writeFileSync(path.join(rootpath, "temp", "level", userpng), text2png(level, {
                                color: "#ffffff",
                                font: "30px Varela",
                                localFontPath: fontpath,
                                localFontName: "Varela"
                            }))
                            fs.writeFileSync(path.join(rootpath, "temp", "A", userpng), text2png(A, {
                                color: "#ffffff",
                                font: "28px Varela",
                                localFontPath: fontpath,
                                localFontName: "Varela"
                            }))
                            fs.writeFileSync(path.join(rootpath, "temp", "S", userpng), text2png(S, {
                                color: "#ffffff",
                                font: "28px Varela",
                                localFontPath: fontpath,
                                localFontName: "Varela"
                            }))
                            fs.writeFileSync(path.join(rootpath, "temp", "SH", userpng), text2png(SH, {
                                color: "#ffffff",
                                font: "28px Varela",
                                localFontPath: fontpath,
                                localFontName: "Varela"
                            }))
                            fs.writeFileSync(path.join(rootpath, "temp", "SS", userpng), text2png(SS, {
                                color: "#ffffff",
                                font: "28px Varela",
                                localFontPath: fontpath,
                                localFontName: "Varela"
                            }))
                            fs.writeFileSync(path.join(rootpath, "temp", "SSH", userpng), text2png(SSH, {
                                color: "#ffffff",
                                font: "28px Varela",
                                localFontPath: fontpath,
                                localFontName: "Varela"
                            }))
                            fs.writeFileSync(path.join(rootpath, "temp", "pp", userpng), text2png(pp, {
                                color: "#ffffff",
                                font: "38px Varela",
                                localFontPath: fontpath,
                                localFontName: "Varela"
                            }))
                            fs.writeFileSync(path.join(rootpath, "temp", "accuracy", userpng), text2png(accuracy, {
                                color: "#ffffff",
                                font: "38px Varela",
                                localFontPath: fontpath,
                                localFontName: "Varela"
                            }))
                            fs.writeFileSync(path.join(rootpath, "temp", "playtime", userpng), text2png(playtime, {
                                color: "#ffffff",
                                font: "38px Varela",
                                localFontPath: fontpath,
                                localFontName: "Varela"
                            }))
                            fs.writeFileSync(path.join(rootpath, "temp", "score", userpng), text2png(score, {
                                color: "#ffffff",
                                font: "38px Varela",
                                localFontPath: fontpath,
                                localFontName: "Varela"
                            }))
                            //create canvas
                            const canvas = createCanvas(1200, 624);
                            const ctx = canvas.getContext('2d');
                            //new img object
                            const img = new Image();
                            //template
                            img.onload = function () { ctx.drawImage(img, 0, 0) };
                            img.src = path.join(rootpath, "template", "backgroundcard.png");
                            //avatar
                            img.onload = function () { ctx.drawImage(img, 45, 55) };
                            img.src = path.join(rootpath, "temp", "avatar", userjpg);
                            //avatar cỏner
                            img.onload = function () { ctx.drawImage(img, 45, 55) };
                            img.src = path.join(rootpath, "template", "avatarcornerround.png");
                            //username 
                            img.onload = function () { ctx.drawImage(img, 347, 72) };
                            img.src = path.join(rootpath, "temp", "username", userpng);
                            //country flag
                            img.onload = function () { ctx.drawImage(img, 350, 130) };
                            img.src = path.join(rootpath, "temp", "countryflag", country + `flag.png`);
                            //country
                            img.onload = function () { ctx.drawImage(img, 425, 140) };
                            img.src = path.join(rootpath, "temp", "country", country + `.png`);
                            //globalrank 
                            img.onload = function () { ctx.drawImage(img, 347, 190) };
                            img.src = path.join(rootpath, "temp", "globalrank", userpng);
                            //country rank
                            img.onload = function () { ctx.drawImage(img, 347, 276) };
                            img.src = path.join(rootpath, "temp", "countryrank", userpng);
                            //leval
                            img.onload = function () { ctx.drawImage(img, Math.ceil(376 - (level.length * 18 + (level.length - 1) * 1) / 2) + 1, 360) };
                            img.src = path.join(rootpath, "temp", "level", userpng);
                            //A rank
                            img.onload = function () { ctx.drawImage(img, Math.ceil(810 - (A.length * 16 + (A.length - 1) * 1) / 2) + 1, 204) };
                            img.src = path.join(rootpath, "temp", "A", userpng);
                            //S
                            img.onload = function () { ctx.drawImage(img, Math.ceil(970 - (S.length * 16 + (S.length - 1) * 1) / 2) + 1, 204) };
                            img.src = path.join(rootpath,"temp","S",userpng);
                            //SH (silver S)
                            img.onload = function () { ctx.drawImage(img, Math.ceil(1129 - (SH.length * 16 + (SH.length - 1) * 1) / 2) + 1, 204) };
                            img.src = path.join(rootpath,"temp","SH",userpng);
                            //SS
                            img.onload = function () { ctx.drawImage(img, Math.ceil(890 - (SS.length * 16 + (SS.length - 1) * 1) / 2) + 1, 312) };
                            img.src = path.join(rootpath,"temp","SS",userpng);
                            //SSH(silver SS)
                            img.onload = function () { ctx.drawImage(img, Math.ceil(1050 - (SSH.length * 16 + (SSH.length - 1) * 1) / 2) + 1, 312) };
                            img.src = path.join(rootpath,"temp","SSH",userpng);
                            //pp
                            img.onload = function () { ctx.drawImage(img, Math.ceil(137 - (pp.length * 23 + (pp.length - 1) * 3) / 2) + 1, 546) };
                            img.src = path.join(rootpath,"temp","pp",userpng);
                            //accuraty
                            img.onload = function () { ctx.drawImage(img, Math.ceil(393 - ((accuracy.length - 1) * 23 + (accuracy.length - 1) * 3) / 2) - 1, 546) };
                            img.src = path.join(rootpath,"temp","accuracy",userpng);
                            //playtime
                            img.onload = function () { ctx.drawImage(img, Math.ceil(700 - (playtime.length * 23 + (playtime.length - 1) * 3) / 2) + 1, 546) };
                            img.src = path.join(rootpath,"temp","playtime",userpng);
                            //total score
                            img.onload = function () { ctx.drawImage(img, Math.ceil(1020 - ((score.length -1) * 23 + (score.length - 1) * 3) / 2) + 1, 546) };
                            img.src = path.join(rootpath,"temp","score",userpng);
                            //osu!mania logo .-.
                            img.onload = function () { ctx.drawImage(img, 252, 261) };
                            img.src = path.join(rootpath,"template","mania.png");
                            //fill the level
                            ctx.fillStyle = '#969696';//790, 370
                            rect(ctx, 440, 360, 400, 20, 4); 
                            ctx.fillStyle = 'rgb(255, 204, 34)'
                            rect(ctx, 440, 360, 400/100*levelpercent, 20, 4)
                            fs.writeFileSync(path.join(rootpath, "temp", "card", userjpg), canvas.toBuffer());
                            const imgstream = fs.createReadStream(path.join(rootpath, "temp", "card", userjpg));
                            data.return({
                                handler: "internal",
                                data: {
                                    body: "",
                                    attachment: ([imgstream])
                                }
                            });
                            /*
                            var dcmcouldntloadimg = await merge(
                                [
                                    {
                                        src: path.join(rootpath, "template", "backgroundcard.png")
                                    },
                                    {
                                        src: path.join(rootpath, "temp", "avatar", userjpg),
                                        x: 45,
                                        y: 55
                                    },
                                    {
                                        src: path.join(rootpath, "template", "avatarcornerround.png"),
                                        x: 45,
                                        y: 55
                                    },
                                    {
                                        src: path.join(rootpath, "temp", "username", userpng),
                                        x: 347,
                                        y: 72
                                    },
                                    {
                                        src: path.join(rootpath, "temp", "countryflag", country + `flag.png`),
                                        x: 350,
                                        y: 130
                                    },
                                    {
                                        src: path.join(rootpath, "temp", "country", country + `.png`),
                                        x: 425,
                                        y: 140
                                    },
                                    {
                                        src: path.join(rootpath, "temp", "globalrank", userpng),
                                        x: 347,
                                        y: 190
                                    },
                                    {
                                        src: path.join(rootpath, "temp", "countryrank", userpng),
                                        x: 347,
                                        y: 276
                                    },
                                    {
                                        src: path.join(rootpath, "temp", "level", userpng),
                                        x: Math.ceil(376 - (level.length * 18 + (level.length - 1) * 1) / 2) + 1,
                                        y: 360
                                    },
                                    {
                                        src: path.join(rootpath, "temp", "A", userpng),
                                        x: Math.ceil(810 - (A.length * 16 + (A.length - 1) * 1) / 2) + 1,
                                        y: 204
                                    },
                                    {
                                        src: path.join(rootpath, "temp", "S", userpng),
                                        x: Math.ceil(970 - (S.length * 16 + (S.length - 1) * 1) / 2) + 1,
                                        y: 204
                                    },
                                    {
                                        src: path.join(rootpath, "temp", "SH", userpng),
                                        x: Math.ceil(1129 - (SH.length * 16 + (SH.length - 1) * 1) / 2) + 1,
                                        y: 204
                                    },
                                    {
                                        src: path.join(rootpath, "temp", "SS", userpng),
                                        x: Math.ceil(890 - (SS.length * 16 + (SS.length - 1) * 1) / 2) + 1,
                                        y: 312
                                    },
                                    {
                                        src: path.join(rootpath, "temp", "SSH", userpng),
                                        x: Math.ceil(1050 - (SSH.length * 16 + (SSH.length - 1) * 1) / 2) + 1,
                                        y: 312
                                    },
                                    {
                                        src: path.join(rootpath, "temp", "pp", userpng),
                                        x: Math.ceil(137 - (pp.length * 23 + (pp.length - 1) * 3) / 2) + 1,
                                        y: 546
                                    },
                                    {
                                        src: path.join(rootpath, "temp", "accuracy", userpng),
                                        x: Math.ceil(393 - ((accuracy.length - 1) * 23 + (accuracy.length - 1) * 3) / 2) - 1,
                                        y: 546
                                    },
                                    {
                                        src: path.join(rootpath, "temp", "playtime", userpng),
                                        x: Math.ceil(700 - (playtime.length * 23 + (playtime.length - 1) * 3) / 2) + 1,
                                        y: 546
                                    },
                                    {
                                        src: path.join(rootpath, "temp", "score", userpng),
                                        x: Math.ceil(1020 - ((score.length - 1) * 23 + (score.length - 1) * 3) / 2) + 1,
                                        y: 546
                                    },
                                    {
                                        src: path.join(rootpath, "template", "mania.png"),
                                        x: 252,
                                        y: 261
                                    }
                                ],
                                {
                                    Canvas: Canvas,
                                    Image: Image
                                }).then(function (res) {
                                    fs.writeFile(
                                        path.join(rootpath, "temp", "card", userjpg), res.replace(/^data:image\/png;base64,/, ""), "base64", function (err) {
                                            if (err) data.log(err);
                                            var img = fs.createReadStream(path.join(rootpath, "temp", "card", userjpg));
                                            data.return({
                                                handler: "internal",
                                                data: {
                                                    body: "",
                                                    attachment: ([img])
                                                }
                                            });
                                        });
                                })
                                */
                            break;
                    }
                    break;
            }
    }
}
module.exports = {
    osu, osucatch, osutaiko, osumania
}
//tks hy, trí và lâm //sắp thi rồi bruh
