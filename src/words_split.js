/*

状态机:
在个别状态转换时 触发一次 保存单词的 操作

U:Upper 大写
L:Lower 小写

---X---< 代表自循环

S -------U------> U1 -----U----->U2(U自循环)
|         保存操作/||/              ^      
------L----->L1(L自循环)          |
                                 L2


以上状态图支持:

abcDefD 切成:  abc Def D
abcABCD 切成:  abc ABCD

L2是错误状态: DDa是错误状态.不允许.



*/


/*
1-5
*/
const STA_START = 0;
const STA_U1 = 1;
const STA_U2 = 2;
const STA_L1 = 11;
const STA_L2 = 12;
const STA_END = 100;
const STA_ERROR = 999;

// 下一个字符的类型
const TYPE_UPPER = 1;//大写
const TYPE_LOWER = 0;//小写
const TYPE_END = 99;//结束

/*
负责处理单词切分问题
*/
class Words_Split {

    constructor(words) {
        this.m_str = words;
        this.m_index = 0;
        this.m_inputChar = 0; // 正在处理的字符
        this.m_inputType = 0;//正在处理的字符的类型
        this.m_status = 0;
        this.debug = false;
        this.result = new Array();
    }

    isUpperCase(ch) {
        return ch >= 'A' && ch <= 'Z'
    }

    isLowerCase(ch) {
        return ch >= 'a' && ch <= 'z'
    }

    /*
    从字符串中获取一个字符
    */
    getInputChar() {
        let result;
        if (this.m_index + 1 > this.m_str.length) {
            return ""
        } else {
            result = this.m_str[this.m_index];
        }
        this.m_index++;
        return result;

    }
    checkInputType(word) {
        if (word == "") {
            return TYPE_END;
        }
        if (this.isLowerCase(word)) {
            return TYPE_LOWER;
        }
        if (this.isUpperCase(word)) {
            return TYPE_UPPER;
        }
        else {
            console.log("Unvalid word:" + word)
            console.trace();
            throw ('Unvalid word')
        }

    }

    saveWords(words) {
        if (words == '') {
            console.trace()
            throw ('无效的单词')
        }
        else {
            //console.log('正在 假装 存储:' + words);
            this.result.push(words);
        }
    }


    next() {
        this.m_inputChar = this.getInputChar();//0 小写 1 大写
        this.m_inputType = this.checkInputType(this.m_inputChar);
    }

    /**
     * @summary 启动工作
     * @returns {切分单词数组}
     */
    start_split() {
        this.start_status_loop();
        return this.result;
    }
    start_status_loop() {

        this.m_status = STA_START;

        let wloop = true;
        let buffer = "";//Note that: should clear per decide.

        this.next()


        while (wloop) {

            if (this.debug) {
                console.log('当前状态机状态:' + this.m_status)
            }


            switch (this.m_status) {
                case STA_START: {
                    if (this.m_inputType == TYPE_END) {
                        this.m_status = STA_END
                        break;
                    }

                    //促进循环到 下一个
                    if (this.m_inputType == TYPE_UPPER) {
                        this.m_status = STA_U1;
                    } else if (this.m_inputType == TYPE_LOWER) {
                        this.m_status = STA_L1;
                    }
                    break;
                }
                case STA_U1: {
                    if (this.m_inputType == TYPE_END) {
                        this.m_status = STA_END
                        break;
                    }

                    buffer += this.m_inputChar;
                    this.next();
                    if (this.m_inputType == TYPE_UPPER) {
                        this.m_status = STA_U2;
                    } else if (this.m_inputType == TYPE_LOWER) {
                        this.m_status = STA_L1;
                    }
                    break;
                }
                case STA_U2: {
                    if (this.m_inputType == TYPE_END) {
                        this.m_status = STA_END
                        break;
                    }

                    buffer += this.m_inputChar;
                    if (this.m_inputType == TYPE_UPPER) {
                        this.m_status = STA_U2;
                    }
                    else if (this.m_inputType == TYPE_LOWER) { // BBa 这属于无效的单词....会有这种单词吗?
                        this.m_status = STA_L1;
                    }
                    this.next()
                    break;
                }
                case STA_L1: {
                    if (this.m_inputType == TYPE_END) {
                        this.m_status = STA_END
                        break;
                    }

                    if (this.m_inputType == TYPE_UPPER) {
                        this.saveWords(buffer);
                        buffer = "";
                        this.m_status = STA_U1;
                    }
                    else if (this.m_inputType == TYPE_LOWER) { // BBa 这属于无效的单词....会有这种单词吗?
                        buffer += this.m_inputChar;
                        this.m_status = STA_L1;
                        this.next()
                    }
                    break;
                }
                case STA_L2: { // URIs难道不是单词吗
                    console.trace();
                    console.log('无效的单词解析:' + this.m_str)
                    throw ('');
                    break;
                }
                case STA_ERROR: {
                    console.trace();
                    console.log('无效的状态STA_ERROR:' + this.m_str)
                    throw ('');
                    break;
                }
                case STA_END: {
                    //如果Buffer中有数据,则保存.
                    if (0 != buffer.length) {
                        this.saveWords(buffer);
                        buffer = "";
                    }
                    else {
                        console.trace();
                        console.log('无效的单词:为空')
                        throw ('');
                    }
                    wloop = false;
                    break;
                }
                default: {
                    console.log(this.m_str + '是一个可能无效的单词,不符合所有规则...')
                    console.assert(false)
                }
            }


        }
    }

}

// let result = new Words_Split('abcdEDD').start_split();

// for (const tmp in result) {
//     const element = result[tmp];
//     console.log(element)
// }




module.exports = Words_Split;
