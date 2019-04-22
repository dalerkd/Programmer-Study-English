const fs = require("fs");

////单词识别 与 统计 存储逻辑
///////////////////////////////////////////////////////////////////////////////
let cl = console.log;

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
  


  module.exports = Words_lex;