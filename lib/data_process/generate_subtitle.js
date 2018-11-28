const fs = require('fs');
const cp = require('child_process');
const utils = require('./utils');

module.exports = async (path_subtitle, path_mp3, info, options) => {
    const logger = options.logger;
    const name_audio = info.name_video;

    return new Promise(async (resolve) => {
        const time_table = split_audio_by_silence(path_mp3, info);
        logger.info('End split_audio_by_silence');

        const paths_mp3 = await utils.generate_splited_audio(time_table, path_mp3, name_audio);
        logger.info('End generate_splited_audio');

        const words = await utils.get_sst_api(options.sst_api)(paths_mp3);
        logger.info('End sst_api_func', time_table.length, '==', words.length);

        if (time_table.length != words.length) throw new Error("Invalid times and words");

        let json = [];
        for (let i = 0, l = time_table.length; i < l; i++) {
            json.push({
                "word": words[i],
                "start": time_table[i].start,
                "end": time_table[i].end,
                "id": i
            });
        }
        await fs.writeFileSync(path_subtitle, JSON.stringify(json, null, 4), 'utf8');
        logger.debug('generate subtile path:', path_subtitle);

        resolve(path_subtitle);
    });
}

function split_audio_by_silence(path_mp3, info) {
    const { start_time, duration } = info;
    const options = {
        ffmpegPath: "ffmpeg", // path to ffmpeg.exe
        maxNoiseLevel: -40, // silence is defined below this dB value
        minSilenceLength: 0.1, // (sec) we are searching for silence intervals at least of this lenght
    };
    let out = cp.spawnSync(options.ffmpegPath, [
        '-i', `${path_mp3}`,
        '-af', `silencedetect=noise=${options.maxNoiseLevel}dB:d=${options.minSilenceLength}`,
        '-f', 'null',
        '-'
    ], {
            cwd: process.cwd(),
            env: process.env,
            stdio: 'pipe',
            encoding: 'utf-8'
        });

    out = out.output.toString();
    let pattern = /silence_start: ([\w\.]+)[\s\S]+?silence_end: ([\w\.]+)/g;
    let m, start = start_time, end = 0;
    let time_table = [];
    function add_time_table(start, end) {
        const duration = (end - start);
        if (duration > 0.1) {
            time_table.push({ start, end });
        }
    }
    while (m = pattern.exec(out)) {
        const silence_start = m[1], silence_end = m[2];
        end = silence_start;
        add_time_table(start, end);
        start = silence_end;
    };
    add_time_table(start, duration); // last

    return time_table;
}