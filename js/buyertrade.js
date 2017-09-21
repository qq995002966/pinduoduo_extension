console.log("我是buyertrade js");
//接受消息
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        //现在这里需要人工干预所以只是
        if (request.type == "background_setOrderNum") {

            var orderNum = request.orderNum;
            console.log(orderNum);
            document.getElementsByClassName("search-mod__order-search-input___29Ui1")[0].value = orderNum;
            sendResponse({farewell:"success"});
        }else if(request.type=="background_openWaybillDetailAddress"){
            document.getElementsByClassName("text-mod__link___1E6PO text-mod__primary___B12ZJ text-mod__hover___wpcMq")[0].click();
            sendResponse({farewell:"success"});
        }
    });


