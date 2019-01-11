/*global io*/
const socket = io();


$( document ).ready(() => {
  
  socket.on('user', ({name, currentUsers, connected}) => {
    
    $('#num-users').text(currentUsers + ' users online');
    const message = `${name} has ${connected ? 'joined' : 'left'} the chat.`
    
    $('#messages').append($('<li>').html('<b>' + message + '</b>'));
  });
    
  $('form').submit(function(){
    const messageToSend = $('#m').val();
    
    socket.emit('chat message', messageToSend);
    
    $('#m').val('');
    return false;
  });
  
  socket.on('chat message', ({name, message}) => {
    $('#messages').append($('<li>').html(message));
  })
  
});