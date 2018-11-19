{
    const auth = require('../secret/auth.json');
    const YouTube = require('simple-youtube-api');
}

let videoId = 'k3JsVabdrx0'

var fs = require('fs');
var youtubedl = require('youtube-dl');
var url = `http://www.youtube.com/watch?v=${videoId}`;
var video = youtubedl(url,
    // Optional arguments passed to youtube-dl.
    ['--format=18'],
    // Additional options can be given for calling `child_process.execFile()`.
    { cwd: __dirname });

// Will be called when the download starts.
video.on('info', function (info) {
    console.log('Download started');
    console.log('filename: ' + info.filename);
    console.log('size: ' + info.size);
});

video.pipe(fs.createWriteStream(`./test/${videoId}.mp4`));

youtubedl.getSubs(url, {
    // Write automatic subtitle file (youtube only)
    auto: true,
    // Downloads all the available subtitles.
    all: false,
    // Languages of subtitles to download, separated by commas.
    lang: 'ko',
    // The directory to save the downloaded files in.
    cwd: __dirname,
}, function (err, files) {
    if (err) throw err;

    console.log('subtitle files downloaded:', files);
});
