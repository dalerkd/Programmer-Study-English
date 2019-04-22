'use strict';

const superagent = require("superagent");
const cheerio = require("cheerio");


let cl = console.log;

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
      let that = this;
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
          
          that.m_dataBase.SaveRecord(webPath,res.text)
          let $ = cheerio.load(res.text);
          callback_rule.call(that,$,500);
        });
    }
    RecursiveGet(recursiveGet_Limit_Time_ms) {
      setTimeout(() => {
        if (this.webAddressIndex++) cl("正在遍历第" + this.webAddressIndex + "个页面");
        if (this.page_limit) {
          if (this.webAddressIndex >= this.page_limit) {
            this.m_words_lex.Save_Result(this.m_diyDirectory);
            return;
          }
        }
        if (this.webAddressIndex < this.webAddressList.length) {
          this.crawling(
            this.webAddressList[this.webAddressIndex],
            this.callback_rule_msdn_vc_get_main
          );
        }
        else {
          this.m_words_lex.Save_Result(this.m_diyDirectory);
          return;
        }
      }, recursiveGet_Limit_Time_ms);
    
    }
  
  
  }
  


  module.exports = Reptile