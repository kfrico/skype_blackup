var options = {
    isAuto : true,
}

//初始值
chrome.storage.local.get([
    "isAuto",
], function(items) {
    if(items["isAuto"]) {
        options.isAuto = items["isAuto"];
    }
});

//接收訊息
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if(request.actionType == 'optionUpdate')
        options = request;

    if (request.actionType == "getOptions")
        sendResponse(options);
});


//監聽新頁面開啟or重新整理事件
chrome.tabs.onUpdated.addListener(function(tabId, info, tab) {
    if (info.status == "complete") {
        if(options.isAuto === true){
            var data = {
                options:options,
                url:tab.url,
                actionType:'browserAction'
            }
            chrome.tabs.sendMessage(tab.id, data, function(request){
                if(request.readStatus === false)
                    chrome.browserAction.setIcon({path:"icon48-off.png",tabId:tab.id});
                if(request.readStatus === true)
                    chrome.browserAction.setIcon({path:"icon48.png",tabId:tab.id});
            });
        }
    }
});

//監聽browser按鈕事件
chrome.browserAction.onClicked.addListener(function(tab) {
    // var data = {
    //     options:options,
    //     url:tab.url,
    //     actionType:'browserAction'
    // }
    // chrome.tabs.sendMessage(tab.id, data, function(request){
    //     if(request.readStatus === false)
    //         chrome.browserAction.setIcon({path:"icon48-off.png",tabId:tab.id});
    //     if(request.readStatus === true)
    //         chrome.browserAction.setIcon({path:"icon48.png",tabId:tab.id});
    // });
});

