const fs = require('fs');
const cv = require('opencv4nodejs');
const db = require('../db');

module.exports = (path_video, name_video, options) => {
    function recenter_rect(rect, _width, _height) {
        let { x, y, width, height } = rect;
        x += (width - _width) / 2;
        y += (height - _height) / 2;
        return new cv.Rect(x, y, _width, _height);
    }

    function RectToString(r) {
        return `[${r.x}, ${r.y}, ${r.width}, ${r.height}]`;
    }

    const loud = options.loud;

    return new Promise(async (resolve, reject) => {
        const PATH_OUTPUT_VIDEO = `${db.PATH_PREPROCESS_VIDEO}/${name_video}.mp4`;
        if (await fs.existsSync(PATH_OUTPUT_VIDEO)) return resolve(PATH_OUTPUT_VIDEO);

        const { fourccCode, fps, w, h } = options.save_video_info;
        let out = new cv.VideoWriter(PATH_OUTPUT_VIDEO, fourccCode, fps, new cv.Size(parseInt(w), parseInt(h)), true);

        function detectFaces(img) {
            const { scaleFactor, minNeighbors, w, h } = options.detect_face_info;
            return classifier.detectMultiScale(img.bgrToGray(), { minSize: new cv.Size(w, h), scaleFactor, minNeighbors }).objects;
        }

        let flag_detect_face = false;
        let frame_idx = 0;
        let faceRect = null;
        function onFrame(frame) {
            const faceRects = detectFaces(frame);
            const num_faceRects = faceRects.length;

            if (flag_detect_face && num_faceRects != 1) {
                loud && console.log(`FD end cur_frame: ${frame_idx} faces: ${num_faceRects}`);
                return true;
            } else if (!flag_detect_face && num_faceRects == 1) {
                flag_detect_face = true;
                faceRect = recenter_rect(faceRects[0], w, h);
                loud && console.log(`FD start cur_frame: ${frame_idx} faces: ${num_faceRects} faceRect: ${RectToString(faceRect)}`);
            }
            if (flag_detect_face) {
                const { cols, rows } = frame;
                // @INFO : error
                if ((faceRect.x + faceRect.width) > rows || (faceRect.y + faceRect.height) > cols) {
                    flag_detect_face = false;
                    return true;
                }
                out.write(frame.getRegion(faceRect));
            }

            frame_idx++;
            return false;
        }

        let classifier = new cv.CascadeClassifier(cv.HAAR_FRONTALFACE_ALT2);
        let cap = new cv.VideoCapture(path_video);

        let done = false;
        const intvl = setInterval(() => {
            let frame = cap.read();
            done = frame.empty ? true : onFrame(frame)

            if (done) {
                clearInterval(intvl);
                out.release();
                if (flag_detect_face) {
                    resolve(PATH_OUTPUT_VIDEO);
                } else {
                    console.log(`error in ${name_video}: cant detect face`);
                    reject();
                }
            }
        }, 0);
    })
}