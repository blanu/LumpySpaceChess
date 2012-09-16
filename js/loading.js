function initLoading()
{
    console.log('initLoading');
    var theme=new buzz.sound('assets/openingSong.mp3');
    theme.play();
}

$(document).ready(initLoading);