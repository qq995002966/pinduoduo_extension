console.log("我是pinduoduo.js");


var returnNum = {};

returnNum.success = 0;//成功发货

var curGood = 0;
var totalGood = 0;
//接受消息
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {

        //读取用户名，手机号，地址
        if (request.type == "background_getUserInfo") {
            //这里是使用快捷键的时候,直接收到的background.js的请求时的操作
            //1.读取相关信息
            var userInfo = document.getElementsByClassName("o-d-b-i-c-people")[0];
            var name = userInfo.getElementsByTagName("span")[1].innerText;
            var phone = userInfo.getElementsByTagName("span")[2].innerText;
            var goodName = document.getElementsByClassName("pdd-dui-table")[0].getElementsByTagName("td")[1].innerText;

            var address = document.getElementsByClassName("o-d-b-i-c-address")[0].getElementsByTagName("span")[1].innerText;
            //2.把相关的信息返回给background.js
            sendResponse({
                type: "pinduoduo_getUserInfo",
                name: name,
                phone: phone,
                address: address,
                goodName: goodName
            });
            console.log(name);
            console.log(phone);
            console.log(address);
            console.log(goodName);
        } else if (request.type == "background_oneKeyDeliver") {
            console.log("background_oneKeyDeliver")
            oneKeyDeliver();
            sendResponse({farewell:"success"});
        }
    });

function oneKeyDeliver() {
    curGood = 0;
    var orders = document.getElementsByClassName("o-o-t-l-c-l-table-title");
    totalGood = orders.length;

    for (; curGood < totalGood; curGood++) {
        var tempText = orders[curGood].getElementsByTagName("li")[0].innerText;
        var orderSn = tempText.substring(tempText.indexOf("：") + 1);

        getNote(orderSn);
    }
    setTimeout(function () {
        alert("成功发货 "+returnNum.success+" 件\n\n"+
        "未发货可能因为\n" +
            "1. 未打开对应的淘宝所有订单页面\n" +
            "2. 订单号的备注不在备注中的第一个\n" +
            "3. 还未购买,所以没有备注（正常情况）");
    },3000);
}

function getNote(order_sn) {
    var url = "http://mms.pinduoduo.com/mars/shop/getNoteList";

    var params = {};
    params["orderSn"] = order_sn;

    $.ajax(url, {
        type: "POST",
        async: true,
        data: JSON.stringify(params),
        crossDomain: true,
        contentType: "application/json; charset=utf-8",
        dataType: "json",//"xml", "html", "script", "json", "jsonp", "text".
        // xhrFields: {  withCredentials: true  },
        //成功返回之后调用的函数
        success: function (data, status) {
            console.log("getNode");
            console.log(data);
            if (data.success == true) {
                //成功的拿到了数据
                //读取出来对应的备注
                if (data.result.length > 0) {//说明有备注
                    var note = data.result[0].note;
                    var orderSn = data.result[0].orderSn;
                    getWaybillInfo(note, orderSn);
                } else {//说明没有备注
                }
            }
        }
    });
}

//淘宝的接口，拿到了快递号 种类
function getWaybillInfo(order, orderSn) {
    var url = "https://buyertrade.taobao.com/trade/json/transit_step.do?bizOrderId=" + order;
    $.ajax(url, {
        type: "GET",
        async: true,
        crossDomain: true,
        contentType: "application/json; charset=utf-8",
        dataType: "json",//"xml", "html", "script", "json", "jsonp", "text".
        // xhrFields: {  withCredentials: true  },
        //成功返回之后调用的函数
        success: function (data, status) {
            console.log("getWaybillInfo" );
            console.log(data);
            if (data.isSuccess == "true") {
                //成功拿到数据了
                var expressName = data.expressName;
                var expressId = data.expressId;

                if ((expressId == null) || (expressId == undefined) ||
                    (expressName == null) || (expressName == undefined)) {
                }
                switch (expressName) {
                    case "圆通速递":
                        expressName = "圆通快递";
                        break;
                    case "EMS":
                        expressName = "邮政EMS";
                        break;
                    case "EMS经济快递":
                        expressName = "邮政EMS";
                        break;
                }
                //已经完成了 快递名字的转换，下一步尝试发货
                doDeliver(expressName, expressId, orderSn);
            }
        }
    });

}

function doDeliver(shippingName, trackingNumber, orderSn) {
    var url = "http://mms.pinduoduo.com/shippingList?is_enabled=1";
    $.ajax(url, {
        //提交数据的类型 POST GET
        type: "GET",
        async: false,
        crossDomain: true,
        contentType: "application/json; charset=utf-8",
        dataType: "json",//"xml", "html", "script", "json", "jsonp", "text".
        // xhrFields: {  withCredentials: true  },
        //成功返回之后调用的函数
        success: function (data, status) {
            //解析所有的 订单种类，找到我们需要的
            for (var i = 0; i < data.length; i++) {
                if (data[i].shipping_name == shippingName) {
                    shippingId = data[i].shippingId;
                    break;
                }
            }

            //拿到了订单ID，可以发货了
            var params = {};
            params["overwrite"] = 1;
            params["isSingleShipment"] = 1;

            var list = [];
            list.push({
                "orderSn": orderSn,
                "shippingId": shippingId,
                "shippingName": shippingName,
                "trackingNumber": trackingNumber
            });
            params["shippings"] = list;

            url = "http://mms.pinduoduo.com/mars/shop/orders/shipping";


            $.ajax(url, {
                type: "POST",
                async: true,
                data: JSON.stringify(params),
                crossDomain: true,
                contentType: "application/json; charset=utf-8",
                dataType: "json",//"xml", "html", "script", "json", "jsonp", "text".
                // xhrFields: {  withCredentials: true  },
                //成功返回之后调用的函数
                success: function (data, status) {
                    console.log("doDeliver");
                    console.log(data);
                    if (data.success == true) {
                        console.log(orderSn + "发货成功");
                        returnNum.success++;
                    }
                }
            });

        }
    });

}
