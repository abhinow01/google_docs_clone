const mongoose = require('mongoose');
const Document = require("./Document")

mongoose.connect("mongodb+srv://tanejavidhata:bEcSgDg39FD2QRlX@cluster0.uqjltqz.mongodb.net/", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

const io = require("socket.io")(3001,{
    cors: {
        origin: "http://localhost:5173",
        method: ['GET','POST']
    }
});
const defaultValue = ""

io.on("connection", socket =>{
    // console.log("conected");
    socket.on("get-document", async documentId =>{
        const document = await findOrCreateDocument(documentId)
        socket.join(documentId)
        socket.emit("load-document",document.data);
        socket.on("send-changes",delta=>{
            socket.broadcast.to(documentId).emit("recieve-changes",delta);
        });

        socket.on("save-document", async data => {
            await Document.findByIdAndUpdate(documentId, { data })
          })
    })
    
});

async function findOrCreateDocument(id){
    if(id == null) return

    const document = await Document.findById(id)
    if(document) return document
    return await Document.create({_id: id , data:defaultValue});

}
