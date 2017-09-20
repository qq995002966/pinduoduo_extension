console.log("addTaoBaoAddress js");

//一进来就先点击一下 修改默认地址
window.onload = function () {
    var targetName = document.getElementsByName("fullName")[0].value;

    var table = document.getElementsByClassName("thead-tbl-status")[0].parentElement;
    var name = table.getElementsByTagName("td")[0].innerText;
    if (name != targetName) {
        table.getElementsByTagName("a")[0].click();
    }
};

//接受消息
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        console.log(request.type);
        switch (request.type) {
            case"background_addAddress"://添加地址
                console.log(request.name);
                console.log(request.phone);
                console.log(request.address);
                var address=request.address;

                //要提前点击一下这个东西
                document.getElementById("city-title").click();

                var province = "";
                if (address.charAt(0) == "黑") {
                    province = address.substr(0, 3);
                } else {
                    province = address.substr(0, 2);
                }
                console.log(province);

                var aElements = document.getElementsByTagName("a");
                for (var i = 0; i < aElements.length; i++) {
                    if (aElements[i].innerText == province) {
                        aElements[i].click();
                        // break;
                    }
                }

                document.getElementsByName("fullName")[0].value=request.name;
                document.getElementsByName("mobile")[0].value=request.phone;
                var addressElement=document.getElementsByClassName("ks-combobox-input i-ta tsl")[0];
                addressElement.click();
                addressElement.focus();
                addressElement.innerText=request.address;
                addressElement.blur();


                setTimeout(function () {
                    document.getElementById("J_SelectCode").click();
                    setTimeout(function () {
                        document.getElementsByClassName(" btn  tsl")[0].click();
                    },200);
                }, 500);

                sendResponse({farewell: "success"});
                break;
        }
    }
);
