// var baseUrl = "http://localhost:8989"
var baseUrl = "http://120.77.46.28:8989"
//航加入的，为了网页格式
window.onload = function () {
    var winHeight = document.documentElement.clientHeight;
    document.getElementById("win").style.height = winHeight + "px";
}

//注册按钮响应事件
document.addEventListener('DOMContentLoaded', function () {
    //首先为两个按钮注册响应事件
    document.getElementById("bs_login_btn").addEventListener('click', login);
    document.getElementById("bs_register_btn").addEventListener('click', register);
    document.getElementById("btn_save_goodname_url").addEventListener('click', save_goodname_url);
    //检查是否已经登陆过了
    chrome.storage.sync.get({
        username: '未登录',
        password: ''
    }, function (items) {
        if (items.username == "未登录") {
            promptUser("未登录");
        } else {
            doLogin(items.username, items.password);
        }
    });
    //读取出来已经设置过的商品名-链接对
    chrome.storage.sync.get({
        goodname_url: ""
    }, function (items) {
        var goodname_url = items.goodname_url;
        if (goodname_url != "") {
            //设置到网上页面
            var length = goodname_url.length;
            for (var i = 0; i < length; i++) {
                var goodnameElement = document.getElementsByClassName("input_goodname")[i];
                var urlElement = document.getElementsByClassName("input_url")[i];

                var tempPair = goodname_url.pop();
                goodnameElement.value = tempPair.goodname;
                urlElement.value = tempPair.url;
            }
        }
    });

});

/**
 * 保存商品名 键值对
 */
function save_goodname_url() {
    console.log("save_goodname_url");

    var length = document.getElementsByClassName("input_goodname").length;
    var resultArray = [];
    var totalCount = 0;
    for (var i = 0; i < length; i++) {
        var goodname = document.getElementsByClassName("input_goodname")[i].value;
        var url = document.getElementsByClassName("input_url")[i].value;
        if ((goodname != "") && (url != "")) {
            resultArray.push({goodname: goodname, url: url});
            totalCount++;
        }
    }

    if (totalCount == 0) {
        alert('请至少输入一个 "商品名-链接" 对');
    } else {
        chrome.storage.sync.set({
            goodname_url: resultArray
        }, function (items) {
            alert("已经存储成功 \n");
        });
    }
}


function login() {
    //从网页中读取用户名,密码
    var username = document.getElementsByName("username")[0].value;
    var password = document.getElementsByName("userpass")[0].value;

    if ((username == null) || (username == "")) {
        promptUser("请填写用户名");
        return;
    }
    if ((password == null) || (password == "")) {
        promptUser("请填写密码");
        return;
    }

    doLogin(username, password);
}


function promptUser(str, flag) {
    document.getElementById("div_has_login").innerText = str;
}

function register() {
    //从网页中读取用户名,密码
    var username = document.getElementsByName("username")[0].value;
    var password = document.getElementsByName("userpass")[0].value;

    if ((username == null) || (username == "")) {
        promptUser("请填写用户名");
        return;
    }
    if ((password == null) || (password == "")) {
        promptUser("请填写密码");
        return;
    }
    doRegister(username, password);
}

function doRegister(username, password) {
    //构建get url
    var registerUrl = baseUrl
        + "/register"
        + "?username=" + username
        + "&password=" + password;

    console.log(registerUrl);
    //向服务器发送消息
    $.get(registerUrl, function (data, status) {
        //解析返回数据,
        //登录失败,服务器错误,提示用户原因
        if (status != "success") {
            promptUser("登录失败￣□￣｜｜\n请稍后再试");
        } else {
            //服务器没有错误,解析服务器返回值
            switch (data) {
                case "1000":
                    promptUser("此用户名已经被注册,请更换用户名");
                    break;
                default:
                    //注册成功
                    //存储用户名密码
                    chrome.storage.sync.set({
                        username: username,
                        password: password
                    }, function (items) {
                        promptUser("已经成功注册,无需再次登录\n关闭此页面,直接使用即可");
                    });
                    //告诉background
                    chrome.runtime.sendMessage({
                        type: "option_login_success",
                        username: username,
                        password: password
                    }, function (response) {
                        console.log(response.farewell);
                    });
                    break;
            }
        }
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
                    promptUser("没有用户  " + username + "\n请重新登陆 或 注册");
                    break;
                case "2":
                    promptUser("密码错误");
                    break;
                case "3":
                    promptUser("账户 " + username + "   已经过期\n请及时充值 或 者更换账户登录");
                    break;
                default:
                    //成功登陆,没有过期
                    //存储用户名密码
                    chrome.storage.sync.set({
                        username: username,
                        password: password
                    }, function (items) {
                        promptUser("已经成功登陆\n用户名 : " + username + "\t过期时间 : " + data, true);
                    });
                    //告诉background
                    chrome.runtime.sendMessage({
                        type: "option_login_success"
                    }, function (response) {
                        console.log(response.farewell);
                    });
                    break;
            }
        }
    });
}
