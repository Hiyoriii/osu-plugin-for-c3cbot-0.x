var fetch = global.nodemodule["node-fetch"];
var request = global.nodemodule["sync-request"]
var streamBuffers = global.nodemodule["stream-buffers"]
var apikey = ""                                 //thay api key từ https://osu.ppy.sh/p/api //edit this apikey from https://osu.ppy.sh/p/api (osu account required)
var osu = function(type,data) {
    var username = encodeURIComponent(data.args.slice(1).join(" "))
    var reply
    switch(username){
        case "":
            reply = global.config.commandPrefix+"osu <username>"
            break;
        default:
            switch(apikey){
                case "":
                    reply = "thay apikey trong owo.js trước khi sử dụng lệnh"
                    break;
                default:
                    var api = `https://osu.ppy.sh/api/get_user?k=${apikey}&u=${username}&m=0`
                    var bufferdata = request("GET",api);                                        //lấy bufferdata từ api
                    var stringdata = bufferdata.body.toString();                                //đổi buffer --> string
                        switch(stringdata){
                            case "[]":
                                reply = "không phải username!"
                                break;
                            default:
                                var objdata = JSON.parse(stringdata);                             //đổi string ->> object
                                var user_id = objdata[0]["user_id"];                              //tách obj
                                var username = objdata[0]["username"];                            //
                                var pp_rank = objdata[0]["pp_rank"];                              //
                                var country_rank = objdata[0]["pp_country_rank"]                  //
                                var country = objdata[0]["country"]                               //
                                var ranked_score = objdata[0]["ranked_score"]                     //
                                var total_score = objdata[0]["total_score"]                       //
                                var playcount = objdata[0]["playcount"]                           //
                                var accuracy = Number(objdata[0]["accuracy"]).toFixed(2)          //
                                var pp = Number(objdata[0]["pp_raw"]).toFixed(2)                  //
                                var level = Number(objdata[0]["level"]).toFixed(0)                //
                                var reply = `Thông tin của ${username} (id: ${user_id})\r\nRank: #${pp_rank} (#${country_rank} ${country})\r\nPerformance Points: ${pp}\r\nLevel: ${level}\r\nAccuracy: ${accuracy}%\r\nRanked Score: ${ranked_score}\r\nTotal Score: ${total_score}\r\nPlaycount: ${playcount}`
                                break;
                                    }
                    break;
            }
    }
    return{
        handler:"internal",
        data: reply
    }
}
var osuctb = function(type,data) {
    var username = encodeURIComponent(data.args.slice(1).join(" "))
    var reply
    switch(username){
        case "":
            reply = global.config.commandPrefix+"osuctb <username>"
            break;
        default:
            switch(apikey){
                case "":
                    reply = "thay apikey trong owo.js trước khi sử dụng lệnh"
                    break;
                default:
                    var api = `https://osu.ppy.sh/api/get_user?k=${apikey}&u=${username}&m=2`
                    var bufferdata = request("GET",api);                                        //lấy bufferdata từ api
                    var stringdata = bufferdata.body.toString();                                //đổi buffer --> string
                        switch(stringdata){
                            case "[]":
                                reply = "không phải username!"
                                break;
                            default:
                                var objdata = JSON.parse(stringdata);                             //đổi string ->> object
                                var user_id = objdata[0]["user_id"];                              // giảm nhiều dòng vcl
                                var username = objdata[0]["username"];                            //
                                var pp_rank = objdata[0]["pp_rank"];                              //
                                var country_rank = objdata[0]["pp_country_rank"]                  //
                                var country = objdata[0]["country"]                               //
                                var ranked_score = objdata[0]["ranked_score"]                     //
                                var total_score = objdata[0]["total_score"]                       //
                                var playcount = objdata[0]["playcount"]                           //
                                var accuracy = Number(objdata[0]["accuracy"]).toFixed(2)          //
                                var pp = Number(objdata[0]["pp_raw"]).toFixed(2)                  //
                                var level = Number(objdata[0]["level"]).toFixed(0)                //
                                var reply = `Thông tin của ${username} (id: ${user_id})\r\nRank: #${pp_rank} (#${country_rank} ${country})\r\nPerformance Points: ${pp}\r\nLevel: ${level}\r\nAccuracy: ${accuracy}%\r\nRanked Score: ${ranked_score}\r\nTotal Score: ${total_score}\r\nPlaycount: ${playcount}`
                                break;
                                    }
                    break;
            }
    }
    return{
        handler:"internal",
        data: reply
    }
}
var osutaiko = function(type,data) {
    var username = encodeURIComponent(data.args.slice(1).join(" "))
    var reply
    switch(username){
        case "":
            reply = global.config.commandPrefix+"osutaiko <username>"
            break;
        default:
            switch(apikey){
                case "":
                    reply = "thay apikey trong owo.js trước khi sử dụng lệnh"
                    break;
                default:
                    var api = `https://osu.ppy.sh/api/get_user?k=${apikey}&u=${username}&m=1`
                    var bufferdata = request("GET",api);                                        //lấy bufferdata từ api
                    var stringdata = bufferdata.body.toString();                                //đổi buffer --> string
                        switch(stringdata){
                            case "[]":
                                reply = "không phải username!"
                                break;
                            default:
                                var objdata = JSON.parse(stringdata);                             //đổi string ->> object
                                var user_id = objdata[0]["user_id"];                              //
                                var username = objdata[0]["username"];                            //
                                var pp_rank = objdata[0]["pp_rank"];                              //
                                var country_rank = objdata[0]["pp_country_rank"]                  //
                                var country = objdata[0]["country"]                               //
                                var ranked_score = objdata[0]["ranked_score"]                     //
                                var total_score = objdata[0]["total_score"]                       //
                                var playcount = objdata[0]["playcount"]                           //
                                var accuracy = Number(objdata[0]["accuracy"]).toFixed(2)          //
                                var pp = Number(objdata[0]["pp_raw"]).toFixed(2)                  //
                                var level = Number(objdata[0]["level"]).toFixed(0)                //
                                var reply = `Thông tin của ${username} (id: ${user_id})\r\nRank: #${pp_rank} (#${country_rank} ${country})\r\nPerformance Points: ${pp}\r\nLevel: ${level}\r\nAccuracy: ${accuracy}%\r\nRanked Score: ${ranked_score}\r\nTotal Score: ${total_score}\r\nPlaycount: ${playcount}`
                                break;
                                    }
                    break;
            }
    }
    return{
        handler:"internal",
        data: reply
    }
}
var osumania = function(type,data) {
    var username = encodeURIComponent(data.args.slice(1).join(" "))
    var reply
    switch(username){
        case "":
            reply = global.config.commandPrefix+"osumania <username>"
            break;
        default:
            switch(apikey){
                case "":
                    reply = "thay apikey trong owo.js trước khi sử dụng lệnh"
                    break;
                default:
                    var api = `https://osu.ppy.sh/api/get_user?k=${apikey}&u=${username}&m=3`
                    var bufferdata = request("GET",api);                                        //lấy bufferdata từ api
                    var stringdata = bufferdata.body.toString();                                //đổi buffer --> string
                        switch(stringdata){
                            case "[]":
                                reply = "không phải username!"
                                break;
                            default:
                                var objdata = JSON.parse(stringdata);                             //đổi string ->> object
                                var user_id = objdata[0]["user_id"];                              //
                                var username = objdata[0]["username"];                            //
                                var pp_rank = objdata[0]["pp_rank"];                              //
                                var country_rank = objdata[0]["pp_country_rank"]                  //
                                var country = objdata[0]["country"]                               //
                                var ranked_score = objdata[0]["ranked_score"]                     //
                                var total_score = objdata[0]["total_score"]                       //
                                var playcount = objdata[0]["playcount"]                           //
                                var accuracy = Number(objdata[0]["accuracy"]).toFixed(2)          //
                                var pp = Number(objdata[0]["pp_raw"]).toFixed(2)                  //
                                var level = Number(objdata[0]["level"]).toFixed(0)                //
                                var reply = `Thông tin của ${username} (id: ${user_id})\r\nRank: #${pp_rank} (#${country_rank} ${country})\r\nPerformance Points: ${pp}\r\nLevel: ${level}\r\nAccuracy: ${accuracy}%\r\nRanked Score: ${ranked_score}\r\nTotal Score: ${total_score}\r\nPlaycount: ${playcount}`
                                break;
                                    }
                    break;
            }
    }
    return{
        handler:"internal",
        data: reply
    }
}
var osuavatar = async function(type,data) {
    var username = encodeURIComponent(data.args.slice(1).join(" "))
    var reply
    switch(username){
        case "":
            reply = global.config.commandPrefix+"osu <username>"
            break;
        default:
            switch(apikey){
                case "":
                    reply = "thay apikey trong owo.js trước khi sử dụng lệnh"
                    break;
                default:
                    var api = `https://osu.ppy.sh/api/get_user?k=${apikey}&u=${username}&m=0`
                    var bufferdata = request("GET",api);                                        //lấy bufferdata từ api
                    var stringdata = bufferdata.body.toString();                                //đổi buffer --> string
                    switch(stringdata){
                        case "[]":
                            return {
                                handler: "internal",
                                data: "không phải username!"
                            }
                            break;
                        default:
                            var objdata = JSON.parse(stringdata);                               //đổi string ->> object
                            var user_id = objdata[0]["user_id"];                                //
                            var avatarapi = `https://a.ppy.sh/${user_id}`
                            var bufferavatar = await fetch(avatarapi).then(res => res.buffer())
                            var avatarx = new streamBuffers.ReadableStreamBuffer({
                                frequency: 10,
                                chunkSize: 1024
                            })
                            avatarx.path = `image.png`
                            avatarx.put(bufferavatar)
                            avatarx.stop()
                            break;
                        }
                    return {
                        handler: "internal",
                        data: {
                            body: "",
                            attachment: ([avatarx])
                        }
                    }
                }
            }
        } //deo biet sao lai nhieu ngoac nhu nay cu enter roi them ngoac vao den het loi :))
module.exports = {
    osu,osutaiko,osuctb,osumania,osuavatar
}
//fuckucovid19