var fs = global.nodemodule["fs"]
var path = global.nodemodule['path']
var fetch = global.nodemodule["node-fetch"]
var { Image, createCanvas, registerFont,loadImage } = global.nodemodule["canvas"]
function rect(ctx, x, y, width, height, radius = 5) {
    if (typeof radius === 'number') {
        radius = {
            tl: radius,
            tr: radius,
            br: radius,
            bl: radius
        } 
    }
    ctx.beginPath() 
    ctx.moveTo(x + radius.tl, y)
    ctx.lineTo(x + width - radius.tr, y)
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr)
    ctx.lineTo(x + width, y + height - radius.br)
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height)
    ctx.lineTo(x + radius.bl, y + height)
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl)
    ctx.lineTo(x, y + radius.tl)
    ctx.quadraticCurveTo(x, y, x + radius.tl, y)
    ctx.closePath()
    ctx.fill()
}
function ensureExists(path, mask) {
    if (typeof mask != 'number') {
        mask = 0o777
    }
    try {
        fs.mkdirSync(path, {
            mode: mask,
            recursive: true
        })
        return undefined
    } catch (ex) {
        return { err: ex }
    }
}
var rootpath = path.resolve(__dirname, "..", "osu-data")
registerFont(path.join(rootpath, "font", "font.ttf"), { family: 'VarelaRound' })
ensureExists(rootpath)
ensureExists(path.join(rootpath, "template"))
ensureExists(path.join(rootpath, "font"))
ensureExists(path.join(rootpath, "temp"))
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
        fs.writeFileSync(nameMapping[n], global.fileMap[n])
    }
}
var osu = async function (type, data) {
    var username = data.args.slice(1).join(" ")
    var reply
    switch (username) {
        case "":
            reply = global.config.commandPrefix + "osu <username>"
            return {
                handler: "internal",
                data: reply
            }
        default:
            var api = `https://osu.ppy.sh/api/v2/users/${encodeURIComponent(username)}/osu`
            var clientgrant = await fetch("https://osu.ppy.sh/oauth/token", {
                method: 'post',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "grant_type": "client_credentials",
                    "client_id": 6091,
                    "client_secret": "JaHpgCMOHDMyllcS5dAXIALZoN1ftZK4ms6myXQ0",
                    "scope": "public"
                })
            })
            var clientgrant = await clientgrant.json()
            var accesstoken = clientgrant.access_token
            var headers = {
                'Accept': 'application/json',
                'Content-Type': 'application.json',
                'Authorization': `Bearer ${accesstoken}`
            }
            var res = await fetch(api, {
                method: 'GET',
                headers: headers
            })
            var js = await res.json()
            if (js.id == undefined){
                return{
                    handler:"internal",
                    data: `không có người chơi nào mang tên "${username}"`
                }
            }
            else{
                var username = js.username
                var globalrank = js.statistics.global_rank
                var countryrank = js.statistics.rank.country
                var score = js.statistics.ranked_score
                var country = js.country.name
                var countrycode = js.country.code
                var accuracy = js.statistics.hit_accuracy .toFixed(2)
                var pp = Number(js.statistics.pp).toFixed(0)
                var level = js.statistics.level.current
                var levelprogress = js.statistics.level.progress
                var playtime = (Number(js.statistics.play_time) / 3600 ).toFixed(1) + "h"
                var A = js.statistics.grade_counts.a
                var S = js.statistics.grade_counts.s
                var SH = js.statistics.grade_counts.sh
                var SS = js.statistics.grade_counts.ss
                var SSH = js.statistics.grade_counts.ssh
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
                    var score = score //lmao
                }
                const canvas = createCanvas(1200, 624)
                const ctx = canvas.getContext('2d')
                //new img object
                const img = new Image()
                //template
                img.onload = function () { ctx.drawImage(img, 0, 0) }
                img.src = path.join(rootpath, "template", "backgroundcard.png")
                //avatar
                var avatarimg = await loadImage(js.avatar_url)
                ctx.drawImage(avatarimg, 45, 55, 277, 277)
                img.onload = function () { ctx.drawImage(img, 45, 55) }
                img.src = path.join(rootpath, "template", "avatarcornerround.png")
                //username
                ctx.fillStyle = "#ffffff"
                ctx.font = '63px VarelaRound'
                ctx.fillText(username, 347, 56 + 63)
                //flag
                var flag = await loadImage(`https://osu.ppy.sh/images/flags/${countrycode}.png`)
                ctx.drawImage(flag, 350, 130, 60, 40)
                ctx.font = '40px VarelaRound'
                ctx.fillText(country, 420, 127 + 40)
                //a,s,sh,ss,ssh
                ctx.fillStyle =`#ffffff`
                ctx.font = '28px VarelaRound'
                ctx.textAlign = 'center'
                ctx.fillText(A, 792 + 22, 171 + 25 + 28)
                ctx.fillText(S, 955 + 16, 171 + 25 + 28)
                ctx.fillText(SH, 1108 + 22, 171 + 25 + 28)
                ctx.fillText(SS, 888 + 9, 279 + 25 + 28)
                ctx.fillText(SSH, 1038 + 13, 279 + 25 + 28)
                //rank
                ctx.textAlign = 'left'
                ctx.font = '75px VarelaRound'
                ctx.fillText("#"+globalrank, 347, 170 + 75)
                ctx.font = '57px VarelaRound'
                ctx.fillText('#' + countryrank, 347, 259 + 57)
                //level
                ctx.textAlign = 'center'
                ctx.font = '33px VarelaRound'
                ctx.fillText(Math.floor(level || 0), 378, 332 + 50)
                ctx.fillStyle = '#969696'//790, 370
                rect(ctx, 440, 360, 504, 12, 7)
                ctx.fillStyle = 'rgb(255, 204, 34)'
                rect(ctx, 440, 360, 504 / 100 * levelprogress, 12, 7)
                ctx.textAlign = 'left'
                ctx.fillStyle = "#FFFFFF"
                ctx.font = '21px VarelaRound'
                ctx.fillText(levelprogress + '%', 960, 359 + 21)
                //stuff
                ctx.textAlign = 'center'
                ctx.font = '40px VarelaRound'
	            ctx.fillText(pp, 82 + 60, 534 + 40)
	            ctx.fillText(accuracy + '%', 324 + 75, 537 + 40)
	            ctx.fillText(playtime, 651 + 50, 536 + 40)
	            ctx.fillText(score, 930 + 100, 536 + 40)
                img.onload = function () { ctx.drawImage(img, 252, 261) }
                img.src = path.join(rootpath, "template", "osu.png")
                //write
                fs.writeFileSync(path.join(rootpath, "temp", "card", userjpg), canvas.toBuffer())
                //stream
                const imgstream = fs.createReadStream(path.join(rootpath, "temp", "card", userjpg)) 
                data.return({
                    handler: "internal",
                    data: {
                        body: "",
                        attachment: ([imgstream])
                    }
                })}

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
            var api = `https://osu.ppy.sh/api/v2/users/${encodeURIComponent(username)}/taiko`
            var clientgrant = await fetch("https://osu.ppy.sh/oauth/token", {
                method: 'post',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "grant_type": "client_credentials",
                    "client_id": 6091,
                    "client_secret": "JaHpgCMOHDMyllcS5dAXIALZoN1ftZK4ms6myXQ0",
                    "scope": "public"
                })
            })
            var clientgrant = await clientgrant.json()
            var accesstoken = clientgrant.access_token
            var headers = {
                'Accept': 'application/json',
                'Content-Type': 'application.json',
                'Authorization': `Bearer ${accesstoken}`
            }
            var res = await fetch(api, {
                method: 'GET',
                headers: headers
            })
            var js = await res.json()
            if (js.id == undefined){
                return{
                    handler:"internal",
                    data: `không có người chơi nào mang tên "${username}"`
                }
            }
            else{
                var username = js.username
                var globalrank = js.statistics.global_rank
                var countryrank = js.statistics.rank.country
                var score = js.statistics.ranked_score
                var country = js.country.name
                var countrycode = js.country.code
                var accuracy = js.statistics.hit_accuracy .toFixed(2)
                var pp = Number(js.statistics.pp).toFixed(0)
                var level = js.statistics.level.current
                var levelprogress = js.statistics.level.progress
                var playtime = (Number(js.statistics.play_time) / 3600 ).toFixed(1) + "h"
                var A = js.statistics.grade_counts.a
                var S = js.statistics.grade_counts.s
                var SH = js.statistics.grade_counts.sh
                var SS = js.statistics.grade_counts.ss
                var SSH = js.statistics.grade_counts.ssh
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
                    var score = score //lmao
                }
                const canvas = createCanvas(1200, 624)
                const ctx = canvas.getContext('2d')
                //new img object
                const img = new Image()
                //template
                img.onload = function () { ctx.drawImage(img, 0, 0) }
                img.src = path.join(rootpath, "template", "backgroundcard.png")
                //avatar
                var avatarimg = await loadImage(js.avatar_url)
                ctx.drawImage(avatarimg, 45, 55, 277, 277)
                img.onload = function () { ctx.drawImage(img, 45, 55) }
                img.src = path.join(rootpath, "template", "avatarcornerround.png")
                //username
                ctx.fillStyle = "#ffffff"
                ctx.font = '63px VarelaRound'
                ctx.fillText(username, 347, 56 + 63)
                //flag
                var flag = await loadImage(`https://osu.ppy.sh/images/flags/${countrycode}.png`)
                ctx.drawImage(flag, 350, 130, 60, 40)
                ctx.font = '40px VarelaRound'
                ctx.fillText(country, 420, 127 + 40)
                //a,s,sh,ss,ssh
                ctx.fillStyle =`#ffffff`
                ctx.font = '28px VarelaRound'
                ctx.textAlign = 'center'
                ctx.fillText(A, 792 + 22, 171 + 25 + 28)
                ctx.fillText(S, 955 + 16, 171 + 25 + 28)
                ctx.fillText(SH, 1108 + 22, 171 + 25 + 28)
                ctx.fillText(SS, 888 + 9, 279 + 25 + 28)
                ctx.fillText(SSH, 1038 + 13, 279 + 25 + 28)
                //rank
                ctx.textAlign = 'left'
                ctx.font = '75px VarelaRound'
                ctx.fillText("#"+globalrank, 347, 170 + 75)
                ctx.font = '57px VarelaRound'
                ctx.fillText('#' + countryrank, 347, 259 + 57)
                //level
                ctx.textAlign = 'center'
                ctx.font = '33px VarelaRound'
                ctx.fillText(Math.floor(level || 0), 378, 332 + 50)
                ctx.fillStyle = '#969696'//790, 370
                rect(ctx, 440, 360, 504, 12, 7)
                ctx.fillStyle = 'rgb(255, 204, 34)'
                rect(ctx, 440, 360, 504 / 100 * levelprogress, 12, 7)
                ctx.textAlign = 'left'
                ctx.fillStyle = "#FFFFFF"
                ctx.font = '21px VarelaRound'
                ctx.fillText(levelprogress + '%', 960, 359 + 21)
                //stuff
                ctx.textAlign = 'center'
                ctx.font = '40px VarelaRound'
	            ctx.fillText(pp, 82 + 60, 534 + 40)
	            ctx.fillText(accuracy + '%', 324 + 75, 537 + 40)
	            ctx.fillText(playtime, 651 + 50, 536 + 40)
	            ctx.fillText(score, 930 + 100, 536 + 40)
                img.onload = function () { ctx.drawImage(img, 252, 261) }
                img.src = path.join(rootpath, "template", "taiko.png")
                //write
                fs.writeFileSync(path.join(rootpath, "temp", "card", userjpg), canvas.toBuffer())
                //stream
                const imgstream = fs.createReadStream(path.join(rootpath, "temp", "card", userjpg)) 
                data.return({
                    handler: "internal",
                    data: {
                        body: "",
                        attachment: ([imgstream])
                    }
                })}

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
            var api = `https://osu.ppy.sh/api/v2/users/${encodeURIComponent(username)}/fruits`
            var clientgrant = await fetch("https://osu.ppy.sh/oauth/token", {
                method: 'post',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "grant_type": "client_credentials",
                    "client_id": 6091,
                    "client_secret": "JaHpgCMOHDMyllcS5dAXIALZoN1ftZK4ms6myXQ0",
                    "scope": "public"
                })
            })
            var clientgrant = await clientgrant.json()
            var accesstoken = clientgrant.access_token
            var headers = {
                'Accept': 'application/json',
                'Content-Type': 'application.json',
                'Authorization': `Bearer ${accesstoken}`
            }
            var res = await fetch(api, {
                method: 'GET',
                headers: headers
            })
            var js = await res.json()
            if (js.id == undefined){
                return{
                    handler:"internal",
                    data: `không có người chơi nào mang tên "${username}"`
                }
            }
            else{
                var username = js.username
                var globalrank = js.statistics.global_rank
                var countryrank = js.statistics.rank.country
                var score = js.statistics.ranked_score
                var country = js.country.name
                var countrycode = js.country.code
                var accuracy = js.statistics.hit_accuracy .toFixed(2)
                var pp = Number(js.statistics.pp).toFixed(0)
                var level = js.statistics.level.current
                var levelprogress = js.statistics.level.progress
                var playtime = (Number(js.statistics.play_time) / 3600 ).toFixed(1) + "h"
                var A = js.statistics.grade_counts.a
                var S = js.statistics.grade_counts.s
                var SH = js.statistics.grade_counts.sh
                var SS = js.statistics.grade_counts.ss
                var SSH = js.statistics.grade_counts.ssh
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
                    var score = score //lmao
                }
                const canvas = createCanvas(1200, 624)
                const ctx = canvas.getContext('2d')
                //new img object
                const img = new Image()
                //template
                img.onload = function () { ctx.drawImage(img, 0, 0) }
                img.src = path.join(rootpath, "template", "backgroundcard.png")
                //avatar
                var avatarimg = await loadImage(js.avatar_url)
                ctx.drawImage(avatarimg, 45, 55, 277, 277)
                img.onload = function () { ctx.drawImage(img, 45, 55) }
                img.src = path.join(rootpath, "template", "avatarcornerround.png")
                //username
                ctx.fillStyle = "#ffffff"
                ctx.font = '63px VarelaRound'
                ctx.fillText(username, 347, 56 + 63)
                //flag
                var flag = await loadImage(`https://osu.ppy.sh/images/flags/${countrycode}.png`)
                ctx.drawImage(flag, 350, 130, 60, 40)
                ctx.font = '40px VarelaRound'
                ctx.fillText(country, 420, 127 + 40)
                //a,s,sh,ss,ssh
                ctx.fillStyle =`#ffffff`
                ctx.font = '28px VarelaRound'
                ctx.textAlign = 'center'
                ctx.fillText(A, 792 + 22, 171 + 25 + 28)
                ctx.fillText(S, 955 + 16, 171 + 25 + 28)
                ctx.fillText(SH, 1108 + 22, 171 + 25 + 28)
                ctx.fillText(SS, 888 + 9, 279 + 25 + 28)
                ctx.fillText(SSH, 1038 + 13, 279 + 25 + 28)
                //rank
                ctx.textAlign = 'left'
                ctx.font = '75px VarelaRound'
                ctx.fillText("#"+globalrank, 347, 170 + 75)
                ctx.font = '57px VarelaRound'
                ctx.fillText('#' + countryrank, 347, 259 + 57)
                //level
                ctx.textAlign = 'center'
                ctx.font = '33px VarelaRound'
                ctx.fillText(Math.floor(level || 0), 378, 332 + 50)
                ctx.fillStyle = '#969696'//790, 370
                rect(ctx, 440, 360, 504, 12, 7)
                ctx.fillStyle = 'rgb(255, 204, 34)'
                rect(ctx, 440, 360, 504 / 100 * levelprogress, 12, 7)
                ctx.textAlign = 'left'
                ctx.fillStyle = "#FFFFFF"
                ctx.font = '21px VarelaRound'
                ctx.fillText(levelprogress + '%', 960, 359 + 21)
                //stuff
                ctx.textAlign = 'center'
                ctx.font = '40px VarelaRound'
	            ctx.fillText(pp, 82 + 60, 534 + 40)
	            ctx.fillText(accuracy + '%', 324 + 75, 537 + 40)
	            ctx.fillText(playtime, 651 + 50, 536 + 40)
	            ctx.fillText(score, 930 + 100, 536 + 40)
                img.onload = function () { ctx.drawImage(img, 252, 261) }
                img.src = path.join(rootpath, "template", "catch.png")
                //write
                fs.writeFileSync(path.join(rootpath, "temp", "card", userjpg), canvas.toBuffer())
                //stream
                const imgstream = fs.createReadStream(path.join(rootpath, "temp", "card", userjpg)) 
                data.return({
                    handler: "internal",
                    data: {
                        body: "",
                        attachment: ([imgstream])
                    }
                })}

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
            var api = `https://osu.ppy.sh/api/v2/users/${encodeURIComponent(username)}/mania`
            var clientgrant = await fetch("https://osu.ppy.sh/oauth/token", {
                method: 'post',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "grant_type": "client_credentials",
                    "client_id": 6091,
                    "client_secret": "JaHpgCMOHDMyllcS5dAXIALZoN1ftZK4ms6myXQ0",
                    "scope": "public"
                })
            })
            var clientgrant = await clientgrant.json()
            var accesstoken = clientgrant.access_token
            var headers = {
                'Accept': 'application/json',
                'Content-Type': 'application.json',
                'Authorization': `Bearer ${accesstoken}`
            }
            var res = await fetch(api, {
                method: 'GET',
                headers: headers
            })
            var js = await res.json()
            if (js.id == undefined){
                return{
                    handler:"internal",
                    data: `không có người chơi nào mang tên "${username}"`
                }
            }
            else{
                var username = js.username
                var globalrank = js.statistics.global_rank
                var countryrank = js.statistics.rank.country
                var score = js.statistics.ranked_score
                var country = js.country.name
                var countrycode = js.country.code
                var accuracy = js.statistics.hit_accuracy .toFixed(2)
                var pp = Number(js.statistics.pp).toFixed(0)
                var level = js.statistics.level.current
                var levelprogress = js.statistics.level.progress
                var playtime = (Number(js.statistics.play_time) / 3600 ).toFixed(1) + "h"
                var A = js.statistics.grade_counts.a
                var S = js.statistics.grade_counts.s
                var SH = js.statistics.grade_counts.sh
                var SS = js.statistics.grade_counts.ss
                var SSH = js.statistics.grade_counts.ssh
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
                    var score = score //lmao
                }
                const canvas = createCanvas(1200, 624)
                const ctx = canvas.getContext('2d')
                //new img object
                const img = new Image()
                //template
                img.onload = function () { ctx.drawImage(img, 0, 0) }
                img.src = path.join(rootpath, "template", "backgroundcard.png")
                //avatar
                var avatarimg = await loadImage(js.avatar_url)
                ctx.drawImage(avatarimg, 45, 55, 277, 277)
                img.onload = function () { ctx.drawImage(img, 45, 55) }
                img.src = path.join(rootpath, "template", "avatarcornerround.png")
                //username
                ctx.fillStyle = "#ffffff"
                ctx.font = '63px VarelaRound'
                ctx.fillText(username, 347, 56 + 63)
                //flag
                var flag = await loadImage(`https://osu.ppy.sh/images/flags/${countrycode}.png`)
                ctx.drawImage(flag, 350, 130, 60, 40)
                ctx.font = '40px VarelaRound'
                ctx.fillText(country, 420, 127 + 40)
                //a,s,sh,ss,ssh
                ctx.fillStyle =`#ffffff`
                ctx.font = '28px VarelaRound'
                ctx.textAlign = 'center'
                ctx.fillText(A, 792 + 22, 171 + 25 + 28)
                ctx.fillText(S, 955 + 16, 171 + 25 + 28)
                ctx.fillText(SH, 1108 + 22, 171 + 25 + 28)
                ctx.fillText(SS, 888 + 9, 279 + 25 + 28)
                ctx.fillText(SSH, 1038 + 13, 279 + 25 + 28)
                //rank
                ctx.textAlign = 'left'
                ctx.font = '75px VarelaRound'
                ctx.fillText("#"+globalrank, 347, 170 + 75)
                ctx.font = '57px VarelaRound'
                ctx.fillText('#' + countryrank, 347, 259 + 57)
                //level
                ctx.textAlign = 'center'
                ctx.font = '33px VarelaRound'
                ctx.fillText(Math.floor(level || 0), 378, 332 + 50)
                ctx.fillStyle = '#969696'//790, 370
                rect(ctx, 440, 360, 504, 12, 7)
                ctx.fillStyle = 'rgb(255, 204, 34)'
                rect(ctx, 440, 360, 504 / 100 * levelprogress, 12, 7)
                ctx.textAlign = 'left'
                ctx.fillStyle = "#FFFFFF"
                ctx.font = '21px VarelaRound'
                ctx.fillText(levelprogress + '%', 960, 359 + 21)
                //stuff
                ctx.textAlign = 'center'
                ctx.font = '40px VarelaRound'
	            ctx.fillText(pp, 82 + 60, 534 + 40)
	            ctx.fillText(accuracy + '%', 324 + 75, 537 + 40)
	            ctx.fillText(playtime, 651 + 50, 536 + 40)
	            ctx.fillText(score, 930 + 100, 536 + 40)
                img.onload = function () { ctx.drawImage(img, 252, 261) }
                img.src = path.join(rootpath, "template", "mania.png")
                //write
                fs.writeFileSync(path.join(rootpath, "temp", "card", userjpg), canvas.toBuffer())
                //stream
                const imgstream = fs.createReadStream(path.join(rootpath, "temp", "card", userjpg)) 
                data.return({
                    handler: "internal",
                    data: {
                        body: "",
                        attachment: ([imgstream])
                    }
                })}

            }
        }
module.exports = {
    osu,osucatch,osutaiko,osumania
}