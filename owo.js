var request = global.nodemodule["sync-request"]
var apikey = ""                                 //thay api key từ https://osu.ppy.sh/p/api
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
                                var objdata = JSON.parse(stringdata);                               //đổi string ->> object
                                var obj_user_id = objdata[0]["user_id"];                            //tách obj
                                var obj_username = objdata[0]["username"];                          //
                                var obj_pp_raw = objdata[0]["pp_raw"];                              //
                                var obj_pp_rank = objdata[0]["pp_rank"];                            //
                                var obj_accuracy = objdata[0]["accuracy"];                          //
                                var obj_level = objdata[0]["level"]                                 //
                                var obj_country_rank = objdata[0]["pp_country_rank"]                //
                                var obj_country = objdata[0]["country"]                             //
                                var obj_ranked_score = objdata[0]["ranked_score"]                   //
                                var obj_total_score = objdata[0]["total_score"]                     //
                                var obj_playcount = objdata[0]["playcount"]                         //
                                var string_user_id = JSON.stringify(obj_user_id);                   //đổi obj đã tách về string
                                var string_username = JSON.stringify(obj_username);                 //
                                var string_pp_rank = JSON.stringify(obj_pp_rank);                   //
                                var string_country_rank = JSON.stringify(obj_country_rank)          //
                                var string_country = JSON.stringify(obj_country)                    //
                                var string_ranked_score = JSON.stringify(obj_ranked_score)          //
                                var string_total_score = JSON.stringify(obj_total_score)            //
                                var string_playcount = JSON.stringify(obj_playcount)                //
                                var number_accuracy = Number(obj_accuracy);                         //obj->number
                                var number_pp = Number(obj_pp_raw)                                  //
                                var number_level = Number(obj_level)                                //
                                var fixed_accuracy = number_accuracy.toFixed(2)                     //fix number
                                var fixed_pp = number_pp.toFixed(2)                                 //
                                var fixed_level = number_level.toFixed(0)                           //
                                var string_accuracy = fixed_accuracy.toString()                     //number->string
                                var string_pp = fixed_pp.toString()                                 //
                                var string_level = fixed_level.toString()                           //
                                var quotesreply = `Thông tin của ${string_username} (id: ${string_user_id})\r\nRank: #${string_pp_rank} (#${string_country_rank} ${string_country})\r\nPerformance Points: ${string_pp}\r\nLevel: ${string_level}\r\nAccuracy: ${string_accuracy}%\r\nRanked Score: ${string_ranked_score}\r\nTotal Score: ${string_total_score}\r\nPlaycount: ${string_playcount}`
                                reply = quotesreply.replace(/['"]+/g, '')                           //bỏ ngoặc kép
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
                                var objdata = JSON.parse(stringdata);                               //đổi string ->> object
                                var obj_user_id = objdata[0]["user_id"];                            //tách obj
                                var obj_username = objdata[0]["username"];                          //
                                var obj_pp_raw = objdata[0]["pp_raw"];                              //
                                var obj_pp_rank = objdata[0]["pp_rank"];                            //
                                var obj_accuracy = objdata[0]["accuracy"];                          //
                                var obj_level = objdata[0]["level"]                                 //
                                var obj_country_rank = objdata[0]["pp_country_rank"]                //
                                var obj_country = objdata[0]["country"]                             //
                                var obj_ranked_score = objdata[0]["ranked_score"]                   //
                                var obj_total_score = objdata[0]["total_score"]                     //
                                var obj_playcount = objdata[0]["playcount"]                         //
                                var string_user_id = JSON.stringify(obj_user_id);                   //đổi obj đã tách về string
                                var string_username = JSON.stringify(obj_username);                 //
                                var string_pp_rank = JSON.stringify(obj_pp_rank);                   //
                                var string_country_rank = JSON.stringify(obj_country_rank)          //
                                var string_country = JSON.stringify(obj_country)                    //
                                var string_ranked_score = JSON.stringify(obj_ranked_score)          //
                                var string_total_score = JSON.stringify(obj_total_score)            //
                                var string_playcount = JSON.stringify(obj_playcount)                //
                                var number_accuracy = Number(obj_accuracy);                         //obj->number
                                var number_pp = Number(obj_pp_raw)                                  //
                                var number_level = Number(obj_level)                                //
                                var fixed_accuracy = number_accuracy.toFixed(2)                     //fix number
                                var fixed_pp = number_pp.toFixed(2)                                 //
                                var fixed_level = number_level.toFixed(0)                           //
                                var string_accuracy = fixed_accuracy.toString()                     //number->string
                                var string_pp = fixed_pp.toString()                                 //
                                var string_level = fixed_level.toString()                           //
                                var quotesreply = `Thông tin của ${string_username} (id: ${string_user_id})\r\nRank: #${string_pp_rank} (#${string_country_rank} ${string_country})\r\nPerformance Points: ${string_pp}\r\nLevel: ${string_level}\r\nAccuracy: ${string_accuracy}%\r\nRanked Score: ${string_ranked_score}\r\nTotal Score: ${string_total_score}\r\nPlaycount: ${string_playcount}`
                                reply = quotesreply.replace(/['"]+/g, '')                           //bỏ ngoặc kép
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
                                var objdata = JSON.parse(stringdata);                               //đổi string ->> object
                                var obj_user_id = objdata[0]["user_id"];                            //tách obj
                                var obj_username = objdata[0]["username"];                          //
                                var obj_pp_raw = objdata[0]["pp_raw"];                              //
                                var obj_pp_rank = objdata[0]["pp_rank"];                            //
                                var obj_accuracy = objdata[0]["accuracy"];                          //
                                var obj_level = objdata[0]["level"]                                 //
                                var obj_country_rank = objdata[0]["pp_country_rank"]                //
                                var obj_country = objdata[0]["country"]                             //
                                var obj_ranked_score = objdata[0]["ranked_score"]                   //
                                var obj_total_score = objdata[0]["total_score"]                     //
                                var obj_playcount = objdata[0]["playcount"]                         //
                                var string_user_id = JSON.stringify(obj_user_id);                   //đổi obj đã tách về string
                                var string_username = JSON.stringify(obj_username);                 //
                                var string_pp_rank = JSON.stringify(obj_pp_rank);                   //
                                var string_country_rank = JSON.stringify(obj_country_rank)          //
                                var string_country = JSON.stringify(obj_country)                    //
                                var string_ranked_score = JSON.stringify(obj_ranked_score)          //
                                var string_total_score = JSON.stringify(obj_total_score)            //
                                var string_playcount = JSON.stringify(obj_playcount)                //
                                var number_accuracy = Number(obj_accuracy);                         //obj->number
                                var number_pp = Number(obj_pp_raw)                                  //
                                var number_level = Number(obj_level)                                //
                                var fixed_accuracy = number_accuracy.toFixed(2)                     //fix number
                                var fixed_pp = number_pp.toFixed(2)                                 //
                                var fixed_level = number_level.toFixed(0)                           //
                                var string_accuracy = fixed_accuracy.toString()                     //number->string
                                var string_pp = fixed_pp.toString()                                 //
                                var string_level = fixed_level.toString()                           //
                                var quotesreply = `Thông tin của ${string_username} (id: ${string_user_id})\r\nRank: #${string_pp_rank} (#${string_country_rank} ${string_country})\r\nPerformance Points: ${string_pp}\r\nLevel: ${string_level}\r\nAccuracy: ${string_accuracy}%\r\nRanked Score: ${string_ranked_score}\r\nTotal Score: ${string_total_score}\r\nPlaycount: ${string_playcount}`
                                reply = quotesreply.replace(/['"]+/g, '')                           //bỏ ngoặc kép
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
                                var objdata = JSON.parse(stringdata);                               //đổi string ->> object
                                var obj_user_id = objdata[0]["user_id"];                            //tách obj
                                var obj_username = objdata[0]["username"];                          //
                                var obj_pp_raw = objdata[0]["pp_raw"];                              //
                                var obj_pp_rank = objdata[0]["pp_rank"];                            //
                                var obj_accuracy = objdata[0]["accuracy"];                          //
                                var obj_level = objdata[0]["level"]                                 //
                                var obj_country_rank = objdata[0]["pp_country_rank"]                //
                                var obj_country = objdata[0]["country"]                             //
                                var obj_ranked_score = objdata[0]["ranked_score"]                   //
                                var obj_total_score = objdata[0]["total_score"]                     //
                                var obj_playcount = objdata[0]["playcount"]                         //
                                var string_user_id = JSON.stringify(obj_user_id);                   //đổi obj đã tách về string
                                var string_username = JSON.stringify(obj_username);                 //
                                var string_pp_rank = JSON.stringify(obj_pp_rank);                   //
                                var string_country_rank = JSON.stringify(obj_country_rank)          //
                                var string_country = JSON.stringify(obj_country)                    //
                                var string_ranked_score = JSON.stringify(obj_ranked_score)          //
                                var string_total_score = JSON.stringify(obj_total_score)            //
                                var string_playcount = JSON.stringify(obj_playcount)                //
                                var number_accuracy = Number(obj_accuracy);                         //obj->number
                                var number_pp = Number(obj_pp_raw)                                  //
                                var number_level = Number(obj_level)                                //
                                var fixed_accuracy = number_accuracy.toFixed(2)                     //fix number
                                var fixed_pp = number_pp.toFixed(2)                                 //
                                var fixed_level = number_level.toFixed(0)                           //
                                var string_accuracy = fixed_accuracy.toString()                     //number->string
                                var string_pp = fixed_pp.toString()                                 //
                                var string_level = fixed_level.toString()                           //
                                var quotesreply = `Thông tin của ${string_username} (id: ${string_user_id})\r\nRank: #${string_pp_rank} (#${string_country_rank} ${string_country})\r\nPerformance Points: ${string_pp}\r\nLevel: ${string_level}\r\nAccuracy: ${string_accuracy}%\r\nRanked Score: ${string_ranked_score}\r\nTotal Score: ${string_total_score}\r\nPlaycount: ${string_playcount}`
                                reply = quotesreply.replace(/['"]+/g, '')                           //bỏ ngoặc kép
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
module.exports = {
    osu,osutaiko,osuctb,osumania
}
//made by sinn
//don't mind these spaghetti code
//heppy2021