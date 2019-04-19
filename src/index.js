const superagent = require("superagent");
const cheerio = require("cheerio");
const fs = require("fs");

let cl = console.log;

let result = [];

class Words_lex {
  constructor() {
    this.m_map = new Map();
    this.m_arr = new Array();
  }

  add_word(arg) {
    let value = 1;
    if (this.m_map.has(arg)) {
      value = this.m_map.get(arg) + 1;
    }
    this.m_map.set(arg, value);
  }

  compare(property) {
    return function(obj1, obj2) {
      var value1 = obj1[property];
      var value2 = obj2[property];
      return value1 - value2; // 升序
    };
  }

  /*
  repeat letter is unvalid
  */
  filterRule_no_repeat(obj) {
    //([a - zA - Z])(\1) + //如果匹配成功代表删除该项目
    let reg = /([a - zA - Z])(\1)+/;
    let result = null == reg.exec(obj["key"]);
    return result;
  }
  /*filter only one letter */
  filterRule_no_only(obj) {
    return obj["key"].length != 1;
  }

  explorer_words() {
    for (let [key, value] of this.m_map) {
      this.m_arr.push({
        key,
        value
      });
    }
    this.m_arr = this.m_arr.filter(this.filterRule_no_only);
    this.m_arr = this.m_arr.filter(this.filterRule_no_repeat);

    this.m_arr.sort(this.compare("value"));
    // for (let tmp of this.m_arr) {
    // console.log(tmp.key + ' ' + tmp.value);
    // }
    fs.writeFile(
      __dirname + "/msdn_counter.json ",
      JSON.stringify({
        status: 0,
        data: this.m_arr
      }),
      function(err) {
        if (err) throw err;
        cl("写入完成");
      }
    );
  }

  lex(s) {
    let re = /([a-zA-Z]+)/g;
    let result = re.exec(s);

    while (result) {
      this.add_word(result[1].toLowerCase());
      result = re.exec(s);
    }
    this.explorer_words();
  }
}

let wl = new Words_lex();
////单词识别 与 统计 存储逻辑
///////////////////////////////////////////////////////////////////////////////

/*
存储到数据库中.
*/
function save(str_data, webAddress) {}

/*
爬虫 存储 数据

*/

/*
https://docs.microsoft.com/en-us/cpp/windows/desktop-applications-visual-cpp?view=vs-2019

*/

class Reptile {
  /*
  #main>#column
  
  h1 标题
  h2 标题
  h3 小标题
  p 里面的内容 里面有em标签 a标签 都有文本
  th td 标签 内容能直接把em 或者 a的内容拿到吗?
  
  
  */

  crawling(webPath, callback_rule) {
    superagent
      .get(webPath)
      .timeout(1000 * 50 * 10)
      .end(function(err, res) {
        // 抛错拦截

        if (err) {
          cl(err);
          throw Error(err);
        }
        /**
         * res.text 包含未解析前的响应内容
         * 我们通过cheerio的load方法解析整个文档，就是html页面所有内容，可以通过console.log($.html());在控制台查看
         */
        let $ = cheerio.load(res.text);
        callback_rule($);
      });
  }
}

function callback_rule_msdn_vc_get_main($) {
  wl.lex($("#main-column>#main").text());
  RecursiveGet();
}

function RecursiveGet() {

setTimeout(() => {
  if (webAddressIndex++) cl("正在遍历第" + webAddressIndex + "个页面");
  if (webAddressIndex < webAddressList.length) {
    my_r.crawling(
      webAddressList[webAddressIndex],
      callback_rule_msdn_vc_get_main
    );
  }
}, recursiveGet_Limit_Time_ms);

}

let recursiveGet_Limit_Time_ms = 500


/*
从左侧获取地址列表信息
*/
function callback_rule_msdn_vc_get_left_address($) {
  $("nav")
    .find("li[role=treeitem]")
    .find("a")
    .each(function(i, elem) {
      // cl('内容:',$(elem).text())
      // cl('地址:',$(elem).attr('href'))

      let url = $(elem).attr("href");
      let text = $(elem).text();
      result.push({
        serviceName: text,
        webAddress: url
      });

      if (i < 100) {
        cl(url);
      }
      if (i == 100) {
        cl("more");
      }

      webAddressList.push(url);
    });
  cl(
    $("nav")
      .find("li[role=treeitem]")
      .find("a").length
  );

  RecursiveGet();
}

function crawlingFromFile() {
  fs.readFile(__dirname + "\\msdn.html", function(err, buffer) {
    if (err) throw err;
    cl(buffer);
    let $ = cheerio.load(buffer);
    callback_rule_msdn_vc_get_left_address($);
  });
}

let webAddressList = new Array();
let webAddressIndex = -1;
let my_r = new Reptile();
crawlingFromFile();

// let reptileUrl = 'https://www.taobao.com'
// superagent.get(reptileUrl).end(function (err, res) {
// // 抛错拦截
// if (err) {
// throw Error(err)
// }
// /**
// * res.text 包含未解析前的响应内容
// * 我们通过cheerio的load方法解析整个文档，就是html页面所有内容，可以通过console.log($.html());在控制台查看
// */
// let $ = cheerio.load(res.text)
// $('.service-bd li a').each(function (i, elem) {
// // cl('内容:',$(elem).text())
// // cl('地址:',$(elem).attr('href'))
// result.push({
// serviceName: $(elem).text(),
// webAddress: $(elem).attr('href')
// })
// })
// fs.writeFile(
// __dirname + 'taobao_class.json',
// JSON.stringify({
// status: 0,
// data: result
// }),
// function (err) {
// if (err) throw err
// cl('写入完成')
// }
// )
// })
