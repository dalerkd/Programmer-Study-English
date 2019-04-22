const fs = require("fs");
const get_uuid = require('uuid/v4')


let cl = console.log;

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

module.exports = DataBaseSystem
