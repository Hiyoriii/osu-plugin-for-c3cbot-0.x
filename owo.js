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
            var api = `https://osu.ppy.sh/api/get_user?k=${apikey}&u=${username}`
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
                    var string_user_id = JSON.stringify(obj_user_id);                   //đổi obj đã tách về string
                    var string_username = JSON.stringify(obj_username);                 //
                    var string_pp_raw = JSON.stringify(obj_pp_raw);                     //
                    var string_pp_rank = JSON.stringify(obj_pp_rank);                   //
                    var string_accuracy = JSON.stringify(obj_accuracy);                 //
                    var quotesreply = `Thông tin của ${string_username} (id: ${string_user_id})\r\nPerformance Points: ${string_pp_raw}\r\nRank: #${string_pp_rank}\r\nAccuracy: ${string_accuracy}%`
                    reply = quotesreply.replace(/['"]+/g, '')                           //bỏ ngoặc kép
                    break;
            }
        break;
    }
    return{
        handler:"internal",
        data: reply
    }
}
module.exports = {
    osu
}
//testing...