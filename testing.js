const fs=require("fs");
setImmediate(()=>console.log("set Immediate"))
setTimeout(()=>console.log("Timer Expired"),5000);
Promise.resolve("Promise").then(console.log);
fs.readFile("./ms.txt","utf-8",()=>{
    console.log("File reading cb");
})

// 2 sec -> file reading -> poll

process.nextTick(()=>{
    process.nextTick(()=>console.log("inner nexttick"));
    console.log("outer next tick");
})

console.log("Last line of code")