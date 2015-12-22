var isBrowserAction = false;
var backup_msg = {};

$('<style>.iedit {cursor: pointer; margin-top: 10px !important;width: 16px;height: 16px;background-image: url('+chrome.extension.getURL('images/history.png')+');} .backup_msg_box {display: none;} .backup_msg {font-size: 16px !important; color: red; margin: 10px 0px !important;}</style>').prependTo('html');

$(function(){

});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    var readStatus = false;

    if(request.actionType == 'browserAction') {
        readStatus = browserAction(request.options, request.url)
    }

    sendResponse({readStatus:readStatus});
});


/*動作function*/
function browserAction(options,url){
    if(isBrowserAction === false){

        $('#chatComponent').on('click', '.iedit', function(){
            $(this).siblings('.backup_msg_box').toggle('normal');
        });

        $('#chatComponent').on('DOMNodeInserted', '.messageHistory', function(e){
            var element = e.target;

            if (element.tagName == 'SWX-MESSAGE') {
                setTimeout(function() {
                    var $element = $(element),
                        id       = $element.find('.content').attr('id');

                    if (!backup_msg.hasOwnProperty(id)) {
                        var date = formatAMPM(new Date());

                        backup_msg[id] = [];
                        backup_msg[id].push($element.find('.content p').text() + ' (' + date + ')');

                        $('#'+id+' p').bind('DOMSubtreeModified', callback_msg);
                    } else {
                        var events = jQuery._data($('#'+id+' p')[0], "events");
                        if (!events || !events.hasOwnProperty('DOMSubtreeModified')) {
                            $('#'+id+' p').bind('DOMSubtreeModified', callback_msg);
                        }
                        
                        if (!$element.find('.backup_msg_box').length && backup_msg[id].length > 1) {
                            $element.find('.content').append('<div class="backup_msg_box"></div>');
                            $element.find('.content').append('<div class="iedit"></div>');

                            for (var i=0; i < backup_msg[id].length -1; i++) {
                                $element.find('.backup_msg_box').append('<div class="backup_msg">'+ backup_msg[id][i]+'</div>');
                            }
                        }
                    }
                } , 100);
            }
        });


        isBrowserAction = true;
        return true;
    }


    if(isBrowserAction === true){
        isBrowserAction = false;
        return false
    }

}

function callback_msg() {
    var $content = $(this).parent();

    if (!$content.find('.backup_msg_box').length) {
        $content.append('<div class="backup_msg_box"></div>');
    }

    var $backup_msg_box = $content.find('.backup_msg_box'),
        $backup         = $backup_msg_box.find('.backup_msg'),
        id              = $content.attr('id'),
        msg             = $(this).text(),
        old_msg         = backup_msg[id][backup_msg[id].length-1],
        date            = formatAMPM(new Date());

    if (msg == '') {
        return;
    }
        console.log(old_msg);

    if ($backup.length) {
        if ($backup.eq(-1).text() != msg) {
            $backup_msg_box.append('<div class="backup_msg">'+old_msg+'</div>');
            backup_msg[id].push(msg + ' (' + date + ')');
        }
    } else {
        $backup_msg_box.append('<div class="backup_msg">'+old_msg+'</div>');
        $content.append('<div class="iedit"></div>');
        backup_msg[id].push(msg + ' (' + date + ')');
    }
}
/*公用function*/
function formatAMPM(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0'+minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
}

function getDomainUrl(url){
     var host = "null";
     if(typeof url == "undefined" || null == url)
          url = window.location.href;

     var regex = /.*\:\/\/([^\/]*).*/;
     var match = url.match(regex);
     if(typeof match != "undefined" && null != match)
          host = match[1];
     return host;
}

