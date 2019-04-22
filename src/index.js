'use strict';

const Words_lex = require('./words_lex')
const Reptile = require('./reptile')
const DataBaseSystem = require('./dataBaseSystem')


let cl = console.log;


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
        //let text = $(elem).text();
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


let myPath = 'msdn_cpp/'
let page_limit = 10;

let msdn = new Reptile_MSDN(new Words_lex(), myPath, new DataBaseSystem(myPath),page_limit,
"https://docs.microsoft.com/en-us/cpp/windows/desktop-applications-visual-cpp?view=vs-2019"
)
msdn.startWork();


