const spawn = require("child_process").spawn;
module.exports = async (options) => {
    function run_py(cmd) {
        return new Promise((resolve, reject) => {
            const pythonProcess = spawn('python', cmd);

            pythonProcess.stdout.on('data', function (data) {
                resolve(data);
            });

            pythonProcess.stderr.on('data', (data) => {
                reject(data);
            });
        });
    }
    if ((options.py_process || []).length > 0) {
        options.logger.info("python_scripts num:", options.py_process.length);
        for (const py_process of options.py_process) {
            const { path_script, args } = py_process;
            options.logger.info("Start python_script path:", path_script);
            await run_py([path_script].concat(args));
            options.logger.info("End python_script path:", path_script);
        }
    }
}