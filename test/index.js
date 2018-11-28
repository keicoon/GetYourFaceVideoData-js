let ArgumentParser = require('argparse').ArgumentParser;
let parser = new ArgumentParser({
  version: '0.0.1',
  addHelp: true,
  description: 'GetYourFaceVideoData'
});
parser.addArgument(
  ['-c', '--channel'],
  {
    help: 'UChlgI3UHCOnwUGzWzbJ3H5w'
  }
);
parser.addArgument(
  ['-n', '--num'],
  {
    type: 'int',
    help: 500
  }
);
let args = parser.parseArgs();

async function main() {
  const GYFVD = require('../');
  const gyfvd = new GYFVD({
    "log_level": "trace", //"info"
    "subtitle_download": true,
    "subtitle_validation": true,
    "py_process": [{
      "path_script": "../temp_jun/utils/split_mp4.py",
      "args": ["-d=./db/result/","--split_by_sentence"]
    }]
  });

  await gyfvd.start(args.channel, args.num);

  // await gyfvd.crawl(args.channel, args.num);
  // await gyfvd.data_process(args.num);

  await gyfvd.clear();
}

main();