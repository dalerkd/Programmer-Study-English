const fs = require("fs");

let cl = console.log
/**
 * 对比文件中的相同词,将其写入一个文件中
 * @param {对比的文件名} firstFileName 
 * @param {对比的文件名} secondFileName
 * @param {结果存储的文件名} saveFileName 
 */

function compare(property) {
    return function (obj1, obj2) {
        var value1 = obj1[property];
        var value2 = obj2[property];
        return value2 - value1; // 降序
    };
}

function findDuplicates(firstFileName, secondFileName, saveFileName, firstOnlyFileName, secondOnlyFileName) {
    let firstJSON = JSON.parse(fs.readFileSync(firstFileName));
    let secondJSON = JSON.parse(fs.readFileSync(secondFileName));
    let firstData = firstJSON['data'];
    let secondData = secondJSON['data'];
    let sameData = new Array();
    let firstOnlyData = new Object();//1号文件中独有的单词
    let secondOnlyData = new Object();//2号文件中独有的单词
    for (const key in firstData) {
        if (secondData[key] != undefined) {
            //meet Duplicates
            let value = firstData[key] + secondData[key]
            sameData.push({ key, value })
        } else {
            firstOnlyData[key] = firstData[key];
        }
    }
    for (const key in secondData) {
        if (firstData[key] == undefined) {
            secondOnlyData[key] = secondData[key];
        }
    }

    // sort
    sameData.sort(compare("value"))
    let m_result = { 'comment': '合并处理', 'timestamp': Date.now(), 'data': {} }
    for (let tmp of sameData) {
        //console.log(tmp.key + ' ' + tmp.value);
        m_result['data'][tmp.key] = tmp.value;
    }

    fs.writeFile(saveFileName, JSON.stringify(
        m_result
    ), (err) => {
        if (err) {
            throw (err)
        }
        cl('保存共同点文件完成')
    })

    fs.writeFile(firstOnlyFileName, JSON.stringify({
        comment: '第一个文件独有的',
        data: firstOnlyData
    }), (err) => {
        if (err) {
            throw (err)
        }
        cl('保存 第一个文件特有内容 完成')
    })
    fs.writeFile(secondOnlyFileName, JSON.stringify({
        comment: '第二个文件独有的',
        data: secondOnlyData
    }), (err) => {
        if (err) {
            throw (err)
        }
        cl('保存 第二个文件特有内容 完成')
    })


}


/**
 * 对特定文件进行频率分析:
 * 找出 达到 某概率 需要多少单词
 *      达到 指定单词 量 对应的概率是多少
 */
class RFC {
    constructor(filePath) {
        this.filePath = filePath;
        this.data = JSON.parse(fs.readFileSync(filePath));
    }
    /**
     * 获取全部单词的数量(含重复)
     */
    get_all_words_number() {
        let num = 0;
        let tmp = this.data['data'];
        for (const key in tmp) {
            const element = tmp[key];
            num += element;
        }
        return num;
    }
    /**
     * 指定数量的单词会到达多少概率
     * @argument {words_num}
     */
    words_to_robability(words_num) {
        let now_num = 0;
        let need_words = 0;
        let all_words = this.get_all_words_number();
        let tmp_probability = 0;
        let tmp = this.data['data'];

        for (const key in tmp) {
            const element = tmp[key];
            need_words++;
            now_num += element;
            if (need_words == words_num) {
                tmp_probability = now_num / all_words
                break;
            }


        }
        return {
            real_probability: tmp_probability,
            need_words: need_words
        };
    }
    /**
     * 多少单词能达到这个概率?
     * @argument {probability} 100-0
     */
    how_words_be_probability(probability) {
        let now_num = 0;
        let need_words = 0;
        let all_words = this.get_all_words_number();
        let tmp_probability = 0;
        let tmp = this.data['data'];

        for (const key in tmp) {
            const element = tmp[key];
            need_words++;
            now_num += element;
            tmp_probability = now_num / all_words
            if (tmp_probability * 100 > probability) {
                break;
            }

        }
        return {
            real_probability: tmp_probability,
            need_words: need_words
        };
    }

}


// findDuplicates('./data/msdn_cpp/counter.json', './data/MDN_Learn/counter.json',
//     './data/common.json', './data/firstOnly.json', './data/secondOnly.json')


cl(new RFC('./save_document/mdn_counter.json').how_words_be_probability(99))
cl(new RFC('./save_document/mdn_counter.json').words_to_robability(1000))
