const mongoose = require('mongoose');
const Document = require("./Document")
const dotenv = require('dotenv');
dotenv.config();
mongoose.connect(process.env.MONGOOSE_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

const io = require("socket.io")(3001,{
    cors: {
        origin: '*',
        method: ['GET','POST']
    }
});
const defaultValue = ""

io.on("connection", socket =>{
    console.log("conected");
    socket.on("get-document", async documentId =>{
        const document = await findOrCreateDocument(documentId)
        console.log("==doc" , document)
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
    // if(document) return document
    if (document) {
        console.log("Document found:", document);
        return document;
    }
    const newDocument = await Document.create({ _id: id, data: defaultValue });
    console.log("New document created:", newDocument);
    return newDocument;


}
