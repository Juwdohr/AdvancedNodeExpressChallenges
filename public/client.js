/*global io*/
const socket = io();


$( document ).ready(function() {
  
  socket.on('users', function(msg) {
    $('#users').text(msg);
  });
  
  $('form').submit(function(){
    var messageToSend = $('#m').val();
    $('#m').val('');
    return false;
  });
  
});