const cp = require('child_process');

module.exports = async (path_subtitle, path_mp3) => {
    let options = {
        mergedTrack: "songs.mp3", // required
        ffmpegPath: "ffmpeg", // path to ffmpeg.exe
        maxNoiseLevel: -40, // silence is defined below this dB value
        minSilenceLength: 1.4, // (sec) we are searching for silence intervals at least of this lenght
    };
    let detectCommand = options.ffmpegPath + ' -i "' + path_mp3 + '" -af silencedetect=noise=' + options.maxNoiseLevel + 'dB:d=' + options.minSilenceLength + ' -f null -';

    let out = cp.spawnSync(detectCommand, {
        stdio: "pipe",
        shell: process.env.ComSpec
    });

    console.log('@', out)
    out = out.output.toString();

    let pattern = /silence_start: ([\w\.]+)[\s\S]+?silence_end: ([\w\.]+)/g;
    let m, end = 0;
    let time_table = [];
    while (m = pattern.exec(out)) {
        let start = m[2];
        end = m[1];
        time_table.push({
            start, end
        })
    };

    console.log(time_table)
}