const superagent = require("superagent");
const cheerio = require("cheerio");
const fs = require("fs");
const get_uuid = require('uuid/v4')



let cl = console.log;

let result = [];

class Words_lex {
  constructor() {
    this.m_map = new Map();
    this.m_arr = new Array();
    this.m_result = { 'timestamp': Date.now(), 'data': {} }
    // 所有被处理的单词的总数量,包含重复出现的次数
    this.m_allWordsNum = 0;
  }

  add_word(arg) {
    let value = 1;
    if (this.m_map.has(arg)) {
      value = this.m_map.get(arg) + 1;
    }
    this.m_map.set(arg, value);
  }

  compare(property) {
    return function (obj1, obj2) {
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
    for (let tmp of this.m_arr) {
      //console.log(tmp.key + ' ' + tmp.value);
      this.m_result['data'][tmp.key] = tmp.value;
      this.m_allWordsNum += tmp.value;
    }

   
    
  }
    /**
   * 
   * @param {自定义的目录,存储在某指定路径:存储目录,要求格式为:'abc/'} diyDirectory 
   */
  Save_Result(diyDirectory = '') {
    this.explorer_words();
    this.m_result['lexNumber']=this.m_allWordsNum
    fs.writeFile(
      __dirname + "/../data/"+diyDirectory+"counter.json",
      JSON.stringify(this.m_result),
      function (err) {
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
    
  }
}

let wl = new Words_lex();
////单词识别 与 统计 存储逻辑
///////////////////////////////////////////////////////////////////////////////

/*
存储到数据库中.
*/
function save(str_data, webAddress) { }

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
  constructor(words_lex,diyDirectory,dataBase,page_limit) {
    this.m_words_lex = words_lex;
    this.m_diyDirectory = diyDirectory;
    this.m_dataBase = dataBase;
    this.webAddressList = new Array();
    this.webAddressIndex = -1;
    this.page_limit = page_limit;

  }

  crawling(webPath, callback_rule) {
    let tmp_data = this.m_dataBase.GetLocalBuffer(webPath)
    if (null != tmp_data )
    {
      cl('缓存 √:'+webPath)
      let $ = cheerio.load(tmp_data);
      callback_rule.call(this,$,0);
      return;
    }
    else {
      cl('Remote √:'+webPath)
    }

    superagent
      .get(webPath)
      .timeout(1000 * 50 * 10)
      .end(function (err, res) {
        // 抛错拦截

        if (err) {
          cl(err);
          throw Error(err);
        }
        /**
         * res.text 包含未解析前的响应内容
         * 我们通过cheerio的load方法解析整个文档，就是html页面所有内容，可以通过console.log($.html());在控制台查看
         */
        
        
        this.m_dataBase.SaveRecord(webPath,res.text)
        let $ = cheerio.load(res.text);
        callback_rule.call(this,$,500);
      });
  }
  RecursiveGet(recursiveGet_Limit_Time_ms) {
    let _this = this;
    setTimeout(() => {
      if (_this.webAddressIndex++) cl("正在遍历第" + _this.webAddressIndex + "个页面");
      if (_this.page_limit) {
        if (_this.webAddressIndex >= _this.page_limit) {
          _this.m_words_lex.Save_Result(_this.m_diyDirectory);
          return;
        }
      }
      if (_this.webAddressIndex < _this.webAddressList.length) {
        _this.crawling(
          _this.webAddressList[_this.webAddressIndex],
          _this.callback_rule_msdn_vc_get_main
        );
      }
      else {
        _this.m_words_lex.Save_Result(_this.m_diyDirectory);
        return;
      }
    }, recursiveGet_Limit_Time_ms);
  
  }


}






class Reptile_MSDN extends Reptile {
  /**
   * 
   * @param {lex对象} words_lex 
   * @param {数据存储的目录串要求:'abc/'的形式} diyDirectory 
   * @param {本地缓存系统DataBaseSystem} dataBase
   */
  
  constructor(words_lex,diyDirectory,dataBase,page_limit,StartHomePage) {
    super(words_lex, diyDirectory, dataBase,page_limit);
    this.start_home_page_url = StartHomePage;
  }
  startWork() {
    this.crawling(this.start_home_page_url, this.callback_rule_msdn_vc_get_left_address);
  }
  callback_rule_msdn_vc_get_main($,recursiveGet_Limit_Time_ms) {
    this.m_words_lex.lex($("#main-column>#main").text());
    this.RecursiveGet(recursiveGet_Limit_Time_ms);
  }
  /*
  从左侧获取地址列表信息
  */
  callback_rule_msdn_vc_get_left_address($) {
    $("nav")
      .find("li[role=treeitem]")
      .find("a")
      .each((i, elem)=>{

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
        this.webAddressList.push(url);
      });
    cl(
      $("nav")
        .find("li[role=treeitem]")
        .find("a").length
    );

    this.RecursiveGet();
  }

}

/*
let webAddressList = new Array();
let webAddressIndex = -1;
let my_r = new Reptile();
crawlingFromFile();
*/



/**
 * 数据库系统:也称 URL本地缓存系统
 * 
 * eg:
 * 线上的文件下载前先向本地请求,在满足条件的情况下向其返回.
 * 
 * 只有本地不存在buffer的情况小才会向远程请求 文件.
 * 
 * url -> 查询对应的本地文件
 * SaveHtmlFile()
 * 
 */
class DataBaseSystem {
  /**
   * 
   * @param {自定义的目录,存储在某指定路径:存储目录,要求格式为:'abc/'} diyDirectory 
   */
  constructor(diyDirectory = '') {
    this.diyDirectory = diyDirectory;
    this.m_data_home_path = __dirname + '/../data/'
    this.m_record_full_path = this.m_data_home_path + this.diyDirectory+ 'BufferSystemDataBase.json'
    //加载数据记录
    this.LoadRecord();
    //初始化共用时间戳
    this.m_timestamp = Date.now();
  }
  /**
   * from local buffer get web page.
   * @arg callback_filter(node):
   *    本函数会将数据节点的信息传入这个函数,函数返回true:表示成功,可从本地获取(如日期在某范围内),false表示本地无效.
   * @ret null / data
   */
  GetLocalBuffer(url, callback_filter = null) {
    let node = this.m_local_database_record['data'][url]
    if (node != undefined) {
      if (callback_filter!=null) {
        if (!callback_filter(node)) {
          return null;
        }
      }
      try{
      let buffer = fs.readFileSync(node['path']);
      return buffer;
      }catch(err){
        cl('记录指向的文件不存在,其指向:'+node['path'])
        return null;
      }
    }
    else {
      return null;
    }
  }

  LoadRecord() {

    try {
      let data = fs.readFileSync(this.m_record_full_path);
      this.m_local_database_record = JSON.parse(data);
      cl()
    } catch (e) {
      this.m_local_database_record = new Object();
      this.m_local_database_record['data'] = {};
    }
  }
  /**
   * 
   * @param {本地缓存文件对应的url} url 
   * @param {需要缓存到本地文件的buffer} dataBuffer
   * @param {存储文件的扩展名,默认为.html} extension_name 
   * @param {时间锉,可选,默认为同一批使用同一时间戳} timestamp 
   */
  SaveRecord(url, dataBuffer, extension_name = ".html", timestamp = "") {
    let dbpath = this.m_data_home_path + this.m_database_name
    let uuid = get_uuid();
    let savePath = this.m_data_home_path + this.diyDirectory + uuid + extension_name;

    fs.writeFileSync(savePath, dataBuffer);
    
    if(timestamp==""){
      timestamp = this.m_timestamp;
    }

    this.m_local_database_record['data'][url] = { 'path': savePath, 'uuid': uuid, 'timestamp': timestamp }

    try {
      fs.writeFileSync(this.m_record_full_path,
        JSON.stringify(
          this.m_local_database_record
        )
      )
    } catch (err) {
      if (err) {
        cl(err)
        fs.unlinkSync(savePath);
        throw err
      }

    }


  }
}

function Test_DataBaseSystem() {

  // 添加测试

  /**
   * 
   * 1 测试存储数据 到数据库
   * 2. 测试 由 索引URL 获取文件目录 并从文件中 获取数据
   */
  {
    let db = new DataBaseSystem('msdn_cpp/')
    cl(db.GetLocalBuffer('http://google.com') == null)
    db.SaveRecord('http://baidu.com', '我是百度')
    if (db.GetLocalBuffer('http://baidu.com') != '我是百度') {
      throw ('test:error1')
    }
    else {
      cl('测试成功')
    }
    db.SaveRecord('http://sina.com.cn','that good sina');
    cl(db.GetLocalBuffer('http://g.cn') == null)
  }
  {
    let db = new DataBaseSystem('msdn_cpp/')
    if (db.GetLocalBuffer('http://baidu.com') != '我是百度') {
      throw ('test:error1')
    }
    else {
      cl('测试成功')
    }
    db.SaveRecord('http://weibo.com','weibo.com');
  }



}

//Test_DataBaseSystem();



let myPath = 'msdn_cpp/'
let page_limit = 10;

let msdn = new Reptile_MSDN(new Words_lex(), myPath, new DataBaseSystem(myPath),page_limit,
"https://docs.microsoft.com/en-us/cpp/windows/desktop-applications-visual-cpp?view=vs-2019"
)
msdn.startWork();


