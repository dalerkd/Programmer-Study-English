# Programmer-Study-English



## 功能
### rfc_decide
### 

## Next?
什么是更好的需求呢?
- 基于状态的回调处理
我们现在的爬虫还 比较原始.
回调方面 希望 能够升级成:
`基于状态转换的回调`
eg: a种情况 使用 b回调,c种情况,使用d回调.
注册回调函数.

s-a->b-c->d
这样就能兼容多种页面的需求了.现在有些页面:

https://developer.mozilla.org/zh-CN/docs/Web

就会出现这样的情况,现在是两级处理:1回调获取地址2回调获取页面信息.
但是会遇到情况: 获取页面信息中又会获得地址之类的...
