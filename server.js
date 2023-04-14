//const path = require('path')
// const express = require('express');
// const app=express();


//set static folder

//app.use(express.static(path.join(__dirname,'public')));  

// app.get('/', (req, res) => {
//     res.send('Hello World!');
// });


// const PORT = 33000|| process.env.PORT;

// app.listen(PORT,()=>console.log(`Server running on port ${PORT}`));
const path = require('path');
const http = require('http');
const express = require('express');
const socketio= require('socket.io');

const formatMessage=require('./utils/messages');

const {userJoin,getCurrentUser,userLeave,getRoomUsers} = require('./utils/users');



const app = express()
const server = http.createServer(app);
const io=socketio(server)



const port = 3000 || process.env.port;

app.use(express.static(path.join(__dirname,'public')));


const botName='Chat Cord Bot';

//Run when client connects

io.on('connection',socket=>{

    socket.on('joinRoom',({username,room})=>{


        const user =userJoin(socket.id,username,room);

        socket.join(user.room);



        //welcome current user
    socket.emit('message',formatMessage(botName,'Welcome to the chat cord!'));

    //broadcast when the user connects

    socket.broadcast.to(user.room).emit('message',formatMessage(botName,`${user.username} has joined the Chat`));

   //send users and room info


   io.to(user.room).emit('roomUsers',{
    room: user.room,
    users:getRoomUsers(user.room)
   });






    })









    //listen for chat messages
    socket.on('chatMessage',msg =>{


        const user=getCurrentUser(socket.id);



        io.to(user.room).emit('message',formatMessage(user.username,msg));
    });




    socket.on('disconnect',()=>{

        const user =userLeave(socket.id);


        if (user) {
            io.to(user.room).emit('message',formatMessage(botName,`${user.username} has left the Chat`))
        }

     // Send users and room info
        io.to(user.room).emit('roomUsers',{
            room: user.room,
            users:getRoomUsers(user.room)
           });




        
    });
});

// app.get('/', (req, res) => {
//   res.send('Hello World!')
// })

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})