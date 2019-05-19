'use strict';

const Reptile = require('./reptile')
const DataBaseSystem = require('./dataBaseSystem')
const fs = require('fs')

let cl = console.log;


class String_Lex {
    /**
     * @param {数据来自已经存在的文件路径 ./data/abc/_Example.json} fromHaveDataFileFullPath
     * @param {限制最多为每个单词获取例句的数量} limit 
     */
    constructor(saveFullPath, fromHaveDataFileFullPath = "", limit = 5) {
        //主要是限制数据
        this.myFullPath = saveFullPath;
        this.m_fileData = JSON.parse(fs.readFileSync('./save_document/common.json'));
        this.limit = limit;
        let date = new Date().toLocaleDateString();
        this.m_decideData = {//JSON.parse(fs.readFileSync(this.myFullPath)
            "comment": "临时处理",
            "timestamp": date,
            "data": {
                // "Hi": ["Hi,my name.", "Hi,girl!", "Say Hi"]

            }
        }
        let firstData = this.m_fileData['data'];
        for (const key in firstData) {
            this.m_decideData['data'][key] = new Array();
        }


        this.m_result = {
            "comment": "单词句子",
            "timestamp": date,
            "data": {
                // "Hi": ["Hi,my name.", "Hi,girl!", "Say Hi"]

            }
        }




    }
    Save_Result() {

        //将没有达到limit的单词 例句也写入结果
        this.limit = 1;
        let tempData = this.m_decideData['data'];
        for (const key in tempData) {
            this.finished(key)
        }
        /////////////////////////
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
            this.myFullPath,
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
    //去重
    unique(array) {
        var res = array.filter(function (item, index, array) {
            return array.indexOf(item) === index;
        })
        return res;
    }
    add_word(word, string) {
        this.m_decideData['data'][word].push(string)
    }
    //负责检查 和 迁移数据 到结果
    //@return: true 已经达到足够的次数
    finished(word) {
        this.m_decideData['data'][word] = this.unique(this.m_decideData['data'][word])
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
            if (this.finished(word)) {
                continue;
            }
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


class Reptile_MDN_Learn extends Reptile {
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
        this.crawling(this.start_home_page_url, this.callback_rule_mdn_learn_get_left_address);
    }


    callback_rule_mdn_learn_get_main($, recursiveGet_Limit_Time_ms) {
        this.m_words_lex.lex($("#wikiArticle").text());
        this.RecursiveGet(recursiveGet_Limit_Time_ms, this.callback_rule_mdn_learn_get_main);
    }
    /*
    从左侧获取地址列表信息
    */
    callback_rule_mdn_learn_get_left_address($) {
        $(".toggle li a")
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
            this.webAddressList.length
        );

        this.RecursiveGet(this.require_page_time_ms, this.callback_rule_mdn_learn_get_main);
    }

}


function rep_mdn_learn_example_sentences() {
    let myPath = 'MDN_Learn/'
    let page_limit = 10000;

    let mdn = new Reptile_MDN_Learn(new String_Lex('./data/' + myPath + '/_ExampleSentences.json'),
        myPath, new DataBaseSystem(myPath), page_limit,
        "https://developer.mozilla.org/en-US/docs/Learn"
    )
    mdn.startWork();
}
console.time();
//rep_mdn_learn_example_sentences();

function Example_Sentences_2Dict(myPath, outputPath) {
    let inputFileFullPath = "./data/" + myPath + "_ExampleSentences.json"
    const obj = JSON.parse(fs.readFileSync(inputFileFullPath))
    // 遍历
    let result = ""
    for (let key in obj['data']) {
        result += key + "\r\n<font size=5>" + key + "</font>\r\n<br>\r\neg:\r\n";
        for (let _key in obj['data'][key]) {
            let value = obj['data'][key][_key]
            // 加粗 关键字
            let re = new RegExp("\\b" + key + "[s]?\\b", 'g')
            let tmpValue = value.replace(re, "<b>" + key + "</b>")
            result += "<p class=\"msdn_p\">" + (parseInt(_key) + 1) + ". "
            result += tmpValue
            result += "</p>\r\n"
        }
        result += "</>"
        result += "\r\n"
    }
    let outputFullPath = "./data/" + outputPath + "_ExampleSentencesDict.txt";
    fs.writeFileSync(outputFullPath, result);
    cl("生成字典完成,路径:" + outputFullPath)
}
Example_Sentences_2Dict('MDN_Learn/', 'MDN_Learn/');

module.exports = rep_mdn_learn_example_sentences
