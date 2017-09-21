console.log("我是detail js");

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.type == "background_getOderDetail") {
            var table = document.getElementsByClassName("order-row")[0];
            var waybillNum = table.getElementsByClassName("em")[0].innerText;
            var waybillType = table.getElementsByClassName("em")[1].innerText;

            console.log(waybillNum);
            console.log(waybillType);

            sendResponse({farewell: "successful", waybillNum: waybillNum, waybillType: waybillType});

        }
    });
