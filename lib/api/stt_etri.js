const db = require('../db');
const fs = require('fs');
const request = require('request');
module.exports = (mp3_paths) => {
    const api_keys = db.get_priviate('etri_sst_api_keys');
    let key_idx = 0;
    let access_key = api_keys[key_idx];

    function set_next_key() {
        key_idx += 1;
        if (api_keys.length > key_idx) {
            access_key = api_keys[key_idx];
        } else {
            throw new Error("need more api_key");
        }
    }

    async function call_api(audioFilePath, depth = 0) {
        if (depth > 1) return Promise.reject("cant resolve error");

        return new Promise(async (resolve) => {
            const audioData = await fs.readFileSync(audioFilePath);
            const requestJson = {
                'access_key': access_key,
                'argument': {
                    'language_code': 'korean',
                    'audio': audioData.toString('base64')
                }
            };
            const options = {
                url: 'http://aiopen.etri.re.kr:8000/WiseASR/Recognition',
                body: JSON.stringify(requestJson),
                headers: { 'Content-Type': 'application/json; charset=UTF-8' }
            };
            request.post(options, function (error, response, body) {
                // console.log('responseCode = ' + response.statusCode);
                // console.log('body = ' + body);
                body = JSON.parse(body);
                if (body.result != 0) {
                    set_next_key();
                    call_api(audioFilePath, depth + 1).then(resolve).catch(() => resolve());
                } else {
                    const result = body.return_object.recognized;
                    resolve(result != 'ASR_NOTOKEN' ? result.trim() : 'FAIL');
                }
            });
        });
    }
    return new Promise(async (resolve, reject) => {
        let bodys = [];
        for (const mp3_path of mp3_paths) {
            try {
                bodys.push(await call_api(mp3_path));
            } catch (e) { return reject(e); }
        }
        resolve(bodys);
    })
}