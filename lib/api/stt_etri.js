const db = require('../db');
const fs = require('fs');
const request = require('request');
module.exports = (mp3_paths) => {
    const access_key = db.get_priviate('etri_sst_api_keys')[0];
    console.log('[debug]', 'access_key', access_key);
    async function call_api(audioFilePath) {

        return new Promise(resolve => {
            const audioData = fs.readFileSync(audioFilePath);
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
                const result = body.return_object.recognized;
                resolve(result != 'ASR_NOTOKEN' ? result : 'FAIL');
            });
        });
    }
    return new Promise(async (resolve) => {
        let bodys = [];
        for (const mp3_path of mp3_paths) {
            const body = await call_api(mp3_path)
            bodys.push(body);
        }
        resolve(bodys);
    })
}