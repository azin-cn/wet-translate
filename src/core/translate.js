const https = require("https");
const URL = require("url").URL;

const qs = require("querystring");
const md5 = require("js-md5");
const { salt, appid, api, secret } = require("../lib/index.js");

const url = new URL(api);

module.exports = function translate(words = [], dest) {
  // 处理参数和url
  let q = words.join("\n");

  const sign = md5(`${appid}${q}${salt}${secret}`);

  const query = qs.stringify({
    q,
    salt,
    appid,
    sign,
    from: "auto",
    to: dest || "auto", /* 默认 中译英 英译中 */
  });

  /* 发送网络请求 */
  _translte(query);
};

function _translte(query) {
  url.search = query;
  https.get(url.toString(), handle); /* 提供的get不需要手动关闭即end */
  // console.log(url.toString());
}

function handle(Incoming) {
  let res = "";

  Incoming.on("data", (data) => {
    // console.log(data.toString())
    res += data.toString();
  });

  Incoming.on("close", () => {
    res = JSON.parse(res);
    // console.log(res)
    const { error_code, trans_result, from, to } = res;
    if (error_code) {
      console.warn('\033[41;30m WARN：翻译错误啦~')
      return;
    }

    const [origin, translation] = trans_result.reduce((words, word) => {
      words[0] += ' ' + word.src
      words[1] += ' ' + word.dst
      return words
    }, ['','']);
    const o = 
      '\x1B[43;30m 原文 ' + 
      '\x1B[40;33m ' + origin
    const r = 
      '\033[42;30m ' + from + ' To ' + to + ' ' +
      '\033[40;32m ' + translation
    console.log(o+'\033[0m');
    console.log(r+'\033[0m');
  });
}
