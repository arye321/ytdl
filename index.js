const express = require('express')
const app = express()
const bodyParser = require("body-parser");
const http = require('http').Server(app);
const io = require('socket.io')(http);
var child_process = require('child_process');
var readline = require('readline');
var fs = require('fs')

function lol(socket,link){
    console.log("Process Finished.");
    run_script(socket,"yt-dlp", [link], function(filename, exit_code) {
        if (filename){
            var fixedFilename = filename.match(/"([^"]+)"/)[1]
        }
        
       
        console.log('filename: ' + fixedFilename);
        //console.log('Full output of script: ',output);
        console.log('fin2')
        if (filename){
        var oldPath = fixedFilename
        var newPath = 'public/'+fixedFilename
        
        fs.rename(oldPath, newPath, function (err) {
            if (err) throw err
            console.log('Successfully renamed - AKA moved!')
        })
        
            socket.emit('finishedDL', fixedFilename);
        }
    });
}

function run_script(socket,command, args, callback) {
    var filename=""
    console.log("Starting Process.");
    args = args.concat([ '--extract-audio', '--audio-format', 'mp3' ])
    console.log(args)
    var dir
    if (process.platform == 'win32'){
    dir = __dirname + "\\public"
    var regex = /\\/g;
    //console.log(dir.replace(/\\/g,'\\\\'))
    dir = dir.replace(/\\/g,'\\\\')
    console.log(dir)
    }
    else{
        dir = __dirname + "/public"
        console.log(dir)
    }
    var child = child_process.spawn(command, args,{cwd:dir});
    

    var scriptOutput = "";

    child.stdout.setEncoding('utf8');
    child.stdout.on('data', function(data) {
        // console.log('stdout: ' + data);
        var lines = data.split('\n');
        for(var line = 0; line < lines.length; line++){
            var templine = lines[line]
            if(!filename){
                if (templine.indexOf("[Merger]")>-1  ) { filename = templine}
                else if (templine.indexOf("has already been downloaded")>-1  ) { 
                    filename = templine
                    filename = filename.replace('[download] ','[download] "')
                    filename = filename.replace(' has already been ','" has already been ')
                    console.log("filename====",filename)
                }
                else if (templine.indexOf('[ExtractAudio] Destination:')>-1){
                    filename = templine
                    filename = filename.replace('[ExtractAudio] Destination: ','[ExtractAudio] Destination: "')
                    filename = filename.replace('.mp3','.mp3"')
                    console.log("filename====",filename)
                }
            }
            

            if (templine.indexOf("[download]")>-1){
            
                console.log(lines[line]);
                socket.emit('counter', lines[line]);
                
            
                //console.log("\n");
            }
        }
        data=data.toString();
        scriptOutput+=data;
        
    });

    child.stderr.setEncoding('utf8');
    child.stderr.on('data', function(data) {
        console.log('stderr: ');

    });

    child.on('close', function(code) {
        console.log("fin")
       callback(filename,code);
    });
}
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use('/', express.static(__dirname + '/public'));
app.use(bodyParser.json());

app.get("/", (res) => {
    res.render("index.html");
  });
io.on('connection', (socket) => {

    
    socket.on('counter', msg => {
        socket.emit('counter', msg);
        lol(socket,msg)
    })
    


});  
app.post('/', function (req, res) {
    res.send('POST request to homepage')
    const url = req.body.ytlink
    console.log(req.body.ytlink)

    
})

http.listen(5000, "0.0.0.0", () => {
    console.log('Server is listening on port 5000....')
  })