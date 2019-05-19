'use strict';
/**
 * example sentences
 * 获取例句
 * 给出单词表 和 需要采集的网页
 * 将会为各单词表 生成一个 例句表
 * 2019年5月19日星期日 0:01
 */


//const Words_lex = require('./words_lex')
const Reptile = require('./reptile')
const DataBaseSystem = require('./dataBaseSystem')
const fs = require('fs')

let cl = console.log;


/**
 * 从其中获取例句.
 * 给出单词表 和 需要采集的网页
 *
 *
 * {
    "comment": "合并处理",
    "timestamp": "2019-5-3 16:44:11",
    "data": {
        "Hi":["Hi,my name.","Hi,girl!","Say Hi"]

    }
}
    1. 将原始数据   复制造一个 工作数组
    2. 遍历匹配工作数组
    3. 判断 是否 达到 限制条件 
        - Y
        移动到 结果数组
 */

class String_Lex {
    /**
     * 
     * @param {限制最多为每个单词获取例句的数量} limit 
     */
    constructor(myPath, limit = 5) {
        //主要是限制数据
        this.myPath = myPath;
        this.m_fileData = JSON.parse(fs.readFileSync('./save_document/common.json'));
        this.limit = limit;
        let date = new Date().toLocaleDateString();
        this.m_decideData = {
            "comment": "临时处理",
            "timestamp": date,
            "data": {
                // "Hi": ["Hi,my name.", "Hi,girl!", "Say Hi"]

            }
        }
        this.m_result = {
            "comment": "单词句子",
            "timestamp": date,
            "data": {
                // "Hi": ["Hi,my name.", "Hi,girl!", "Say Hi"]

            }
        }
        let firstData = this.m_fileData['data'];
        for (const key in firstData) {
            this.m_decideData['data'][key] = new Array();
        }



    }
    Save_Result() {

        let sameData = new Array();
        let firstData = this.m_result['data'];
        for (const key in firstData) {
            let value = firstData[key]
            let number = this.m_fileData['data'][key]
            sameData.push({ key, value, number })
        }
        sameData.sort((x) => {
            return (obj1, obj2) => {
                return obj1.number - obj2.number
            }
        })
        //clear
        let date = new Date().toLocaleDateString();
        this.m_result = {
            "comment": "单词句子",
            "timestamp": date,
            "data": {
            }
        }
        for (let tmp of sameData) {
            //console.log(tmp.key + ' ' + tmp.value);
            this.m_result['data'][tmp.key] = tmp.value;
        }

        fs.writeFile(
            "./data/" + this.myPath + "_ExampleSentences.json",
            JSON.stringify(this.m_result),
            (err) => {
                if (err) {
                    cl(err)
                    throw (err)
                }
                cl('成功写入')
                console.timeEnd();
            }
        )
    }
    add_word(word, string) {
        this.m_decideData['data'][word].push(string)
    }
    //负责检查 和 迁移数据 到结果
    //@return: true 已经达到足够的次数
    finished(word) {
        if (this.limit <= this.m_decideData['data'][word].length) {
            this.m_result['data'][word] = [].concat(this.m_decideData['data'][word])
            delete this.m_decideData['data'][word]
            return true;
        }
        // 共同组件中 单词出现次数x,最多实际出现x-1次
        if ((this.m_fileData['data'][word] - 1) == this.m_decideData['data'][word].length) {
            this.m_result['data'][word] = [].concat(this.m_decideData['data'][word])
            delete this.m_decideData['data'][word]
            return true;
        }
    }
    lex(s) {
        //循环 this.m_decideData
        for (const key in this.m_decideData['data']) {
            let word = key;
            let reStringL = `((?:[a-zA-Z0-9\\+\\(\\),][a-zA-Z0-9\\t\\f\\v \\+\\(\\),\\-\\+\\\\\\&_:"'/]*)?\\b`
            let reStringR = `[s]?\\b[a-zA-Z0-9\\t\\f\\v \\+\\(\\),\\-\\+\\\\\\&_:"'/]*(?:.|\\!|\\r\\n))`
            let re = new RegExp(reStringL + word + reStringR, 'g')
            let result = re.exec(s);

            while (result) {

                //this.add_word(result[1].toLowerCase());
                this.add_word(word, result[1]);
                result = re.exec(s);
                if (this.finished(word)) {
                    break;
                }
            }
        }

    }
}




class Reptile_MSDN extends Reptile {
    /**
     * 
     * @param {lex对象} words_lex 
     * @param {数据存储的目录串要求:'abc/'的形式} diyDirectory 
     * @param {本地缓存系统DataBaseSystem} dataBase
     */

    constructor(words_lex, diyDirectory, dataBase, page_limit, StartHomePage) {
        super(words_lex, diyDirectory, dataBase, page_limit);
        this.start_home_page_url = StartHomePage;
    }
    startWork() {
        this.crawling(this.start_home_page_url, this.callback_rule_msdn_vc_get_left_address);
    }
    callback_rule_msdn_vc_get_main($, recursiveGet_Limit_Time_ms) {
        this.m_words_lex.lex($("#main-column>#main").text());
        this.RecursiveGet(recursiveGet_Limit_Time_ms, this.callback_rule_msdn_vc_get_main);
    }
    /*
    从左侧获取地址列表信息
    */
    callback_rule_msdn_vc_get_left_address($) {
        $("nav")
            .find("li[role=treeitem]")
            .find("a")
            .each((i, elem) => {

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

        this.RecursiveGet(this.require_page_time_ms, this.callback_rule_msdn_vc_get_main);
    }

}


function rep_msdn_example_sentences() {
    let myPath = 'msdn_cpp/'
    let page_limit = 10000;

    let msdn = new Reptile_MSDN(new String_Lex(myPath), myPath, new DataBaseSystem(myPath), page_limit,
        "https://docs.microsoft.com/en-us/cpp/windows/desktop-applications-visual-cpp?view=vs-2019"
    )
    msdn.startWork();
}
console.time();
rep_msdn_example_sentences();

module.exports = rep_msdn_example_sentences
