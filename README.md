# 省市地区三级联动选择

该项目为建立省市地区三级联动菜单。数据依赖于 areadata.xml 提供的 xml 格式数据。

整个代码使用面向对象方式进行编写，对于xml数据搜索使用到了xpath

### 适用范围
1. 该代码目前在IE7、IE8、FireFox3.6.9、Opera10、360se、遨游2.5.15、Lunascape6下测试通过

2. 该代码可在Chrome浏览下使用，但前提是必须放在服务下进行测试。直接在本地打开测试页面，由于Chrome浏览器权限访问文件权限是指问题会导致报错而无法正常使用。

3. 该代码在IE6下，当使用<code>option.text</code>,<code>option.value</code>或<code>new Option</code>创建下拉选项时，在存在默认值的情况下会出现下拉错位.具体可看代码，也可将test.html在IE6下测试。目前尚不太清楚该问题的产生原因


#### 文件清单
- areadata.xml 为省市地区数据

- loadxml.js 为 js 读取 xml处理脚本

- areaselected.js 为联动菜单处理脚本

- demo.html 为完整的省市页面调用示例

- test.html 为HtmlSelect的测试页面