const fs = require("fs");

let cl = console.log 
fs.readFile(__dirname+'/from100RFC.json', (err, str) => {
    if (err) {
        cl(err)
        throw(err)
    }
    let obj = JSON.parse(str);
    
    let result = 0;
    Object.keys(obj).forEach(function(key){

        result+=obj[key];
   });
    cl(result)
})
