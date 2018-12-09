const fs = require('fs')
const ffmpeg = require('fluent-ffmpeg');
const cp = require('child_process');

const name = process.argv[2];

let path_video = `./db/video/${name}.mp4`;
let path_mp3 = `./db/video/${name}.mp3`;
console.log(path_video, path_mp3);

async function main() {
    try {
        async function split_audio_by_silence(path_mp3, info) {
            const { start_time, duration } = info;
            const options = {
                ffmpegPath: "ffmpeg", // path to ffmpeg.exe
                maxNoiseLevel: -30, // silence is defined below this dB value
                minSilenceLength: 0.12, // (sec) we are searching for silence intervals at least of this lenght
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

        async function get_video_info(path_video) {
            return new Promise((resolve, reject) => {
                ffmpeg(path_video).ffprobe(function (err, metadata) {
                    if (err) return reject('fail get_video_info', err);
                    resolve(metadata.format);
                });
            });
        }
        const { start_time, duration } = await get_video_info(path_video);

        async function extract_audio(src, des, start, end) {
            if (await fs.existsSync(des)) return Promise.resolve();

            return new Promise(resolve => {
                ffmpeg(src)
                    .seekInput(start)
                    .duration((end - start))
                    .format('mp3')
                    .output(des)
                    .on('end', resolve)
                    .run();
            })
        }
        await extract_audio(path_video, path_mp3, start_time, duration);

        const time_table = await split_audio_by_silence(path_mp3, { start_time, duration });

        console.log(time_table);
    } catch (e) {
        console.error(e)
    }
}

main();