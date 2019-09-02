$(document).ready(function(){
    $('.clickable-row').click(function(){
        var href = $(this).attr('data-href');
        if(href.length > 0) window.location = href;
    })
});