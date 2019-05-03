'use strict';
/**
 * 分析,任何一个文本文件中的 单词
 */



const Words_lex = require('./words_lex')
const fs = require('fs')


let cl = console.log;



/**
 * 1. 读取文件
 * 2. lex文件
 * 3. 存储结果
 */
function execute(wait_ana_txt_file_full_path) {
    let m_diyDirectory = 'Ana_TXT/'
    fs.readFile(wait_ana_txt_file_full_path, (err, buffer) => {
        if (err) {
            throw (err)
        }
        let m_words_lex = new Words_lex()
        m_words_lex.lex(buffer);
        m_words_lex.Save_Result(m_diyDirectory);
    })


}

execute('E:/Git Project/Programmer-Study-English/data/Ana_TXT/tina_get_english.txt')



module.exports = execute
