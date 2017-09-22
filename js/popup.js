/**
 * popup.js的生命周期就是 弹出页面出现的时间,如果弹出页面消失,popup.js的生命结束
 * 所以需要background.js作为数据的中枢,这都是chrome 插件的框架的限制.
 */
//响应网页点击
document.addEventListener('DOMContentLoaded', function () {
    var buttons = document.getElementsByTagName("button");
    for (var i = 0; i < buttons.length; i++) {
        var temp = buttons[i];
        switch (temp.innerText) {
            case "复制拼多多信息":
                temp.addEventListener("click", getUserInfo);
                break;
            case "粘贴到淘宝":
                temp.addEventListener("click", setUserInfoTaoBao);
                break;
            case "一键发货本页商品":
                temp.addEventListener("click", oneKeyDeliver);
                break;
            case "搜索订单备注":
                temp.addEventListener("click",searchNote);
                break;
        }

    }
});

function searchNote() {
    console.log("searchNote");

    var orderSn=document.getElementsByClassName("input-order-sn")[0].value;
    console.log(orderSn);
    if((orderSn!=null)&&(orderSn!=undefined)){
        chrome.runtime.sendMessage({
            type: "popup_searchNote_click",
            orderSn:orderSn
        }, function (response) {
            console.log(response.farewell);
            if (response.canUse == false) {
                alert("插件当前不可用\n请到配置页面配置!\n\n按空格键关闭提示");
            }
        });
    }
}

function oneKeyDeliver() {
    console.log("oneKeyDeliver");

    //给backround发消息,淘宝一键发货的按钮点击了
    chrome.runtime.sendMessage({
        type: "popup_oneKeyDeliver_click"
    }, function (response) {
        console.log(response.farewell);
        if (response.canUse == false) {
            alert("插件当前不可用\n请到配置页面配置!\n\n按空格键关闭提示");
        }
    });
}

/**
 * 复制拼多多信息 按钮响应事件,逻辑为 向get_pin_info.js发送一个消息
 */
function getUserInfo() {
    console.log("getUserInfo");
    //给backround发消息,获取拼多多信息的按钮别点击了
    chrome.runtime.sendMessage({
        type: "popup_pinduoduo_click"
    }, function (response) {
        console.log(response.farewell);
        if (response.canUse == false) {
            alert("插件当前不可用\n请到配置页面配置!\n\n按空格键关闭提示");
        }
    });
}

function setUserInfoTaoBao() {
    console.log("setUserInfoTaoBao");
    //给background发消息说,粘贴到淘宝的按钮别点击了
    chrome.runtime.sendMessage({
        type: "popup_taobao_click"
    }, function (response) {
        console.log(response.farewell);
        if (response.canUse == false) {
            alert("插件当前不可用\n请到配置页面配置!\n\n按空格键关闭提示");
        }
    });
}