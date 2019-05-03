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
    let m_result = { 'timestamp': Date.now(), 'data': {} }
    for (let tmp of sameData) {
        //console.log(tmp.key + ' ' + tmp.value);
        m_result['data'][tmp.key] = tmp.value;
    }

    fs.writeFile(saveFileName, JSON.stringify({
        comment: '合并处理',
        data: m_result
    }), (err) => {
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

findDuplicates('./data/msdn_cpp/counter.json', './data/MDN_Learn/counter.json',
    './data/common.json', './data/firstOnly.json', './data/secondOnly.json')



// fs.readFile(__dirname + '/from100RFC.json', (err, str) => {
//     if (err) {
//         cl(err)
//         throw (err)
//     }
//     let obj = JSON.parse(str);

//     let result = 0;
//     Object.keys(obj).forEach(function (key) {

//         result += obj[key];
//     });
//     cl(result)
// })
