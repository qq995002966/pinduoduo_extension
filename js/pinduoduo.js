console.log("我是pinduoduo.js");

//接受消息
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {

        if (request.type == "background_getUserInfo") {
            //这里是使用快捷键的时候,直接收到的background.js的请求时的操作
            //1.读取相关信息
            var userInfo = document.getElementsByClassName("o-d-b-i-c-people")[0];
            var name = userInfo.getElementsByTagName("span")[1].innerText;
            var phone = userInfo.getElementsByTagName("span")[2].innerText;
            var goodName =document.getElementsByClassName("pdd-dui-table")[0].getElementsByTagName("td")[1].innerText;

            var address = document.getElementsByClassName("o-d-b-i-c-address")[0].getElementsByTagName("span")[1].innerText;
            //2.把相关的信息返回给background.js
            sendResponse({
                type:"pinduoduo_getUserInfo",
                name: name,
                phone: phone,
                address: address,
                goodName: goodName
            });
            console.log(name);
            console.log(phone);
            console.log(address);
            console.log(goodName);
        }
    });


