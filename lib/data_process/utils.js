const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const db = require('../db');
const hangul_asm = require('hangul-asm-tmp');
module.exports = {
    generate_splited_audio,
    call_stt_api
};

function generate_splited_audio(time_table, mp3_path, name_audio) {
    return new Promise(async (pp_resolve) => {
        let promises = [];
        for (let i = 0, l = time_table.length; i < l; i++) {
            const { start, end } = time_table[i];
            const PATH_OUTPUT_AUDIO = `${db.PATH_POSTPROCESS_VIDEO}/${name_audio}_${i}.wav`;
            if (await fs.existsSync(PATH_OUTPUT_AUDIO)) {
                promises.push(Promise.resolve(PATH_OUTPUT_AUDIO));
            } else {
                promises.push(new Promise(audio_resolve => {
                    ffmpeg(mp3_path)
                        .toFormat('wav')
                        .audioChannels(1)
                        .audioFrequency('16000')
                        .seekInput(start)
                        .duration((end - start))
                        .output(PATH_OUTPUT_AUDIO)
                        .on('end', function () {
                            audio_resolve(PATH_OUTPUT_AUDIO)
                        })
                        .run();
                }));
            };
        };

        Promise.all(promises).then(pp_resolve);
    });
}

function call_stt_api(sst_api, mp3_path, lang) {
    const sst_api_func = {
        "etri": require('../api/stt_etri')
    }[sst_api];
    if (!sst_api_func) throw new Error("Can't find SST api");

    const result = sst_api_func(mp3_path);

    if(result.some(r => r == 'FAIL')) throw new Error("Check again about SST's request data format");

    if (lang == 'ko') {
        return result.map(w => ({ "part": hangul_asm.encode(w), "origin": w }));
    } else {
        return result.map(w => ({ "part": w }));
    }
}