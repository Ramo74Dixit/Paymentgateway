const fs=require('fs');
// File Reading in fs module 
// Asynchronous
// fs.readFile('datas.txt','utf-8',(err,data)=>{
//     if(err){
//         console.error(err);
//         return;
//     }
//     console.log(data)
// }  
// )
// Synchronous

// const data=fs.readFileSync('datas.txt','utf-8');
// console.log(data)

// Writing File Asynchronous 

// fs.writeFile('datas.txt',"Hello Parassssssssss",(err)=>{
//     console.error(err);
//     console.log("File has been added succesfully")
// }
// )

// Synchronous 
// fs.writeFileSync('datas.txt',"hellooooooooo mitaaaaarrrrrrrrrrr")

// console.log("add ho gyi bhaiya")

//append method in fs module 
// asynchronous way
// fs.appendFile('datas.txt',"Ye additional Jud Gya",(err)=>{
//     console.error(err);
//     console.log("Jud gyi bhai ")
// })
// fs.appendFileSync("datas.txt","COntent hai ye level sabke niklenge")

// console.log("jud gya")

// Delete a file 
// asynchronous 
// unlink
// fs.unlink('datas.txt',(err)=>{
//     if(err){
//         console.error(err);
//     }
//     else{
//         console.log("Ud gyi bhai ud gyi");
//     }
// })
// synchronous

// folder create - directory 
// fs.mkdir('newwww-directory',(err)=>{
//     if(err){
//         console.error(err);
//     }
//     else{
//         console.log("Bn gya folder");
//     }
// })

// Folder Reading in Fs mOdule 
// fs.readdir('./new-directory/aryan',(err,files)=>{
//     if(err){
//         console.error(err)
//     }
//     else{
//         console.log("Files is :",files);
//     }
// })


// Removing Directories
// rmdir

fs.rmdir("./new-directory/aryan",{recursive:true},(err)=>{
    if(err){
        console.error(err);
    }
    else{
        console.log("Folder Deleted Successfully");
    }
})