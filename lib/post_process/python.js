const spawn = require("child_process").spawn;
module.exports = async (options) => {
    function run_py(cmd, spawn_option = {}) {
        return new Promise((resolve, reject) => {
            const pythonProcess = spawn('python3', cmd, spawn_option);

            pythonProcess.stdout.on('data', function (data) {
                options.logger.info(data.toString('utf8'));
                resolve();
            });

            pythonProcess.stderr.on('data', (data) => {
                options.logger.error(data.toString('utf8'));
                reject();
            });
        });
    }
    if ((options.py_process || []).length > 0) {
        options.logger.info("python_scripts num:", options.py_process.length);
        for (const py_process of options.py_process) {
            const { path_script, args, spawn_option } = py_process;
            const cmd = [path_script].concat(args);
            options.logger.info("Start python_script path:", path_script, "cmd:", cmd, "spawn_option", spawn_option);
            await run_py(cmd, spawn_option);
            options.logger.info("End python_script path:", path_script);
        }
    }
}