$(document).ready(function(){
    $('select').formSelect();
    $(".dropdown-trigger").dropdown();
    $('.modal').modal();
    $('.sidenav').sidenav();
    $("select[required]").css({
        display: "block", 
        'margin-top':'-20px',
        height: 0, 
        padding: 0, 
        width: 0});
});