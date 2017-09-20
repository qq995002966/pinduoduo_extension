console.log("I'm backgroud (#^.^#)");

// var baseUrl = "http://localhost:8989"
var baseUrl = "http://120.77.46.28:8989"

var name = "";
var phone = "";
var address = "";

var canUse = false;
//测试是否登录

document.addEventListener('DOMContentLoaded', function () {

    chrome.storage.sync.get({
        username: '未登录',
        password: ''
    }, function (items) {
        if (items.username == "未登录") {
            promptUser("未登录");
        } else {
            console.log(items.username);
            doLogin(items.username, items.password);
        }
    });
});


//接收消息
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.type == "option_login_success") {
            console.log("option_login_success");
            canUse = true;
            sendResponse({farewell: "success"});
            doLogin(request.username, request.password);
        }
        if (checkCanUse() == false) {
            return;
        }
        //拼多多js接收到popupjs的指令之后会向background js发送这样一个请求,存储用户信息
        switch (request.type) {
            case "popup_taobao_click":
                tellTaoBaoSetUserInfo();
                sendResponse({farewell: "success"});
                break;
            case "popup_pinduoduo_click":
                tellPinGetUserInfo();
                sendResponse({farewell: "success"});
                break;
        }

    });

//接受键盘快捷键
chrome.commands.onCommand.addListener(function (command) {
    console.log(canUse);
    if (checkCanUse() == false) {
        return;
    }
    if (command.valueOf() == "getUserInfo") {
        tellPinGetUserInfo();
    } else if (command.valueOf() == "setUserInfo") {
        tellTaoBaoSetUserInfo();
    }
});

function checkCanUse() {
    if (canUse == false) {
        console.log("已经过期了,请及时充值.\n谢谢您的支持(#^.^#)");
        return false;
    }
    return true;
}

function tellTaoBaoSetUserInfo() {
    //给 taobao.js发送一个消息,
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {
            type: "background_setUserInfo",
            name: name,
            phone: phone,
            address: address
        }, function (response) {

        });
    });
}

function openTabByGoodName(goodName) {
    console.log("openTabByGoodName " + goodName);

    //读取出来所有的 商品名-链接 对，进行处理
    chrome.storage.sync.get({
        goodname_url: ""
    }, function (items) {
        var goodname_url = items.goodname_url;
        if (goodname_url != "") {
            //设置到网上页面
            var length = goodname_url.length;
            for (var i = 0; i < length; i++) {
                //遍历没有个 商品名-链接 对，进行判断，如果当前商品名匹配成功，打开对应的链接

                var tempPair = goodname_url.pop();
                if (goodName.indexOf(tempPair.goodname) != -1) {
                    //说明包含
                    chrome.tabs.create({url: tempPair.url});
                }
            }
        }
    });
}

function tellPinGetUserInfo() {
    //需要给 pinduoduo.js 发送消息,来获取用户信息
    console.log("getUserInfo");
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {type: "background_getUserInfo"}, function (response) {
            name = response.name;
            phone = response.phone;
            address = response.address;
            if (response.type == "pinduoduo_getUserInfo") {
                openTabByGoodName(response.goodName);
            }
            console.log(name);
            console.log(phone);
            console.log(address);
        });
    });
}


function doLogin(username, password) {
    //构建get url
    var loginUrl = baseUrl
        + "/login"
        + "?username=" + username
        + "&password=" + password;

    console.log(loginUrl);

    //向服务器发送消息
    $.get(loginUrl, function (data, status) {
        //解析返回数据,
        //登录失败,服务器错误,提示用户原因
        if (status != "success") {
            promptUser("登录失败￣□￣｜｜\n请稍后再试");
        } else {
            //服务器没有错误,检查用户名和密码是否匹配
            switch (data) {
                case "1":
                    promptUser("没有此用户");
                    break;
                case "2":
                    promptUser("密码错误");
                    break;
                case "3":
                    promptUser("已经过期,请及时充值");
                    break;
                default:
                    //成功登陆,没有过期
                    canUse = true;
                    //存储用户名密码
                    chrome.storage.sync.set({
                        username: username,
                        password: password
                    }, function (items) {
                        promptUser("已经成功登陆");
                    });
                    break;
            }
        }
    });
}

function promptUser(str) {
    console.log(str);
}
