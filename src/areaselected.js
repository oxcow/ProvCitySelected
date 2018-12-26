/*
 * 读xml文件，兼容IE、Firefox、Chrome浏览器。当使用chrome浏览器时应确保该代码存放在服务器端.
 * <br/>如果需要直接在Chrome浏览器中运行，需要在使用
 * 		<blockquote>`chrome.exe --allow-file-access-from-files`</blockquote>
 * 来启动浏览器，否则无法在chrome浏览中无法读入xml文件
 *
 * @returns {Doccumnt Object} xml文档对象
 */
function loadxml() {
	var start = +new Date();
	var oXmlDom = XmlDom();
	if ( typeof (oXmlDom.load) == 'undefined') {
		var xmlhttp = new XMLHttpRequest();
		/*
		 * when set async eq true and load local xml file,the chrome will throw excption
		 * "XMLHttpRequest cannot load file:///...areadata.xml.
		 * 	Origin null is not allowed by Access-Control-Allow-Origin."
		 *
		 * when set async eq false and load local xml file,the chrome will throw exception
		 * "Uncaught Error: NETWORK_ERR: XMLHttpRequest Exception 101" in addition to the above"
		 *
		 */
		xmlhttp.open("POST", "areadata.xml", false);
		xmlhttp.setRequestHeader('Content-Type', 'application/xml');
		xmlhttp.send(null);
		oXmlDom = xmlhttp.responseXML;
	} else {
		oXmlDom.load("areadata.xml");
	}
	console.log(`load xml spend: ${+new Date() - start} ms`);
	return oXmlDom;
}

/**
 * html select 标签类
 *
 * @param {string}
 *            sId 标签id
 * @param {string}
 *            sName 标签 name
 * @param {string}
 *            sVal 标签值
 * @constructor
 * @returns {HtmlSelect}
 */
class HtmlSelect {
	constructor(sId, sName, sVal){
		this.id = sId;
		this.name = sName;
		this.val = sVal;
		this.select = HtmlSelect.CreateSelect(this.id, this.name);
	}
 
	/**
	 * 创建并添加 option 元素
	 *
	 * @param {string}
	 *            sVal option 元素 value
	 * @param {string}
	 *            sText option 元素 显示值
	 * @returns {Element} option element
	 */
	addOption(sVal,sText){
		/**
		 * 创建option方法1<br/> 使用该方法IE6\FF下，默认selected不会出现错位
		 */
		var option = document.createElement('option');
		option.appendChild(document.createTextNode(sText));
		option.setAttribute('value', sVal);
		if (this.val && sVal == this.val) {
			option.setAttribute('selected', 'selected');
		}

		this.select.appendChild(option);
	}
	/**
	 * 清除 select 元素下所有的 option 元素
	 *
	 */
	cleanOptions(){
		if (this.select && this.select.options.length !== 0) {
			// 需要从最后一个option进行清除，否则会发生异常
			for (var i = this.select.options.length - 1; i >= 0; i--) {
				this.select.remove(this.select.options[i]);
			}
		}
	}
	/**
	 * 显示select标签在页面中
	 *
	 * @param {string}
	 *            offset select元素父节点id
	 */
	showHtml(offset) {
		document.getElementById(offset).appendChild(this.select);
	}

	/**
	 * 创建select元素
	 *
	 * @private
	 * @returns {Element} select element
	 */
	static CreateSelect(id, name){
		var oSelect = document.createElement('select');
		oSelect.setAttribute('id', id);
		oSelect.setAttribute('name', name);
		return oSelect;
	}
}
 
/**
 * 联动菜单基类
 *
 * @param {string}
 *            sOffset select标签存放位置
 * @param {String}
 *            sId select标签id属性
 * @param {string}
 *            sName select标签name属性
 * @param {string}
 *            sVal select标签默认选项
 * @constructor
 * @returns {LinkageMenu}
 */
class LinkageMenu{
	constructor(sOffset, sId, sName, sVal) {
		this.xml = LinkageMenu.xml ? LinkageMenu.xml : loadxml();
		this.offset = sOffset;
		this.id = sId;
		this.name = sName;
		this.val = sVal;
		this.htmlSelect = new HtmlSelect(this.id, this.name, this.val);
	}
	/**
	 * 初始化数据并显示在页面指定元素中
	 *
	 * @param {string}
	 *            xPath xPath表达式
	 */
	init(xPath) {

		var xmlData = this.xml.documentElement.selectNodes(xPath);

		if (!this.val && xmlData[0]) {// 如果没有默认值，则将第一个元素设置为默认值
			this.val = xmlData[0].getAttribute('name');
			this.htmlSelect.val = this.val;
		}
		for (var i = 0; i < xmlData.length; i++) {
			this.htmlSelect.addOption(xmlData[i].getAttribute('name'), xmlData[i].getAttribute('name'));
		}
		this.htmlSelect.showHtml(this.offset);
		
	}

	/**
	 * 联动菜单onchange事件
	 *
	 * @param {string}
	 *            xPath 新数据 xPath 表达式
	 * @returns
	 */
	change(){
		// 获取onchange方法的绑定对象
		var oLink = LinkageMenu["link_" + this.id];

		oLink.htmlSelect.cleanOptions();

		// 替换xPath中的变量部分
		var sXpath = oLink.xPath.replace("&var", this.value);

		var xmlData = oLink.xml.documentElement.selectNodes(sXpath);

		for (var i = 0; i < xmlData.length; i++) {
			var _name = xmlData[i].getAttribute("name");
			oLink.htmlSelect.addOption(_name, _name);
		}
		var oLinkedLink = LinkageMenu["link_" + oLink.id];
		// 获取被绑定对象onchange绑定的对象
		if (oLinkedLink) {
			oLinkedLink.htmlSelect.cleanOptions();
			var data = xmlData[0].childNodes;
			for (var j = 0; j < data.length; j++) {
				if (data[j].nodeType == 1) {// ELEMENT_NODE
					var _name = data[j].getAttribute("name");
					oLinkedLink.htmlSelect.addOption(_name, _name);
				}
			}
		}
	}
}

/**
 * 伪静态areadata.xml数据变量
 */
LinkageMenu.xml = loadxml();

/**
 * 省份下拉对象
 *
 * @param {string}
 *            sOffset 显示位置
 * @param {string}
 *            sId select元素的id属性
 * @param {string}
 *            sName select元素的name属性
 * @param {string}
 *            sVal select元素默认选中值
 * @constructor
 * @extends {LinkageMenu}
 * @returns {Province}
 */
class Province extends LinkageMenu{
	constructor(sOffset, sId, sName, sVal) {
		super(sOffset, sId, sName, sVal);
		this.xPath = '//province';
		this.init(this.xPath);
	}
	/**
	 * 省市联动
	 *
	 * @param {City}
	 *            oCity 联动市对象
	 */
	linkCity(oCity){

		oCity.xPath = "//province[@name='&var']/city";

		// 指定当前province绑定的city
		LinkageMenu["link_" + this.id] = oCity;

		this.htmlSelect.select.onchange = this.change;
		 
		if (this.val) {
			var sXpath = oCity.xPath.replace("&var", this.val);
			oCity.init(sXpath);
		}
	}
}

/**
 * 市下拉对象
 *
 * @param {string}
 *            sOffset 显示位置
 * @param {string}
 *            sId select元素的id属性
 * @param {string}
 *            sName select元素name属性
 * @param {string}
 *            sVal select元素默认选中值
 * @param {boolean|undefined|null}
 *            isInit
 *            <ul>
 *            是否初始数据。默认为false。
 *            <li>如果只是构造单独的市下拉菜单，则需要设置该变量为true</li>
 *            <li>如果是构造联动菜单，则需要将该变量设置为false</li>
 *            </ul>
 * @param {string}
 *			  province 省份.当该参数为空时，将取出所有省份的城市.否则将只显示该省份下的所有市
 *
 * @constructor
 * @extends {LinkageMenu}
 * @returns {City}
 */
class City extends LinkageMenu {

	constructor(sOffset, sId, sName, sVal, isInit, province){
		super(sOffset, sId, sName, sVal);

		this.xPath = province ? "//province[@name='" + province + "']/city" : '//city';

		if (isInit) {
			this.init(this.xPath);
		}
	}

	/**
	 * 市区联动
	 *
	 * @param {Area}
	 *            oArea 区对象
	 */
	linkArea(oArea){
		oArea.xPath = "//city[@name='&var']/country";
		LinkageMenu["link_" + this.id] = oArea;
		// // 指定当前city绑定的area
		this.htmlSelect.select.onchange = this.change;
 
		if (this.val) {
			oArea.htmlSelect.cleanOptions();
			var sXpath = oArea.xPath.replace("&var", this.val);
			oArea.init(sXpath);
		}
	}
}
 
/**
 * 地区下拉对象
 *
 * @param {string}
 *            sOffset 显示位置
 * @param {string}
 *            sId select元素的id属性
 * @param {string}
 *            sName select元素name属性
 * @param {string}
 *            sVal select元素默认选中值
 * @param {boolean|undefined|null}
 *            isInit
 *            <ul>
 *            是否初始数据。默认为false。
 *            <li>如果只是构造单独地区下拉菜单，则需要设置该变量为true</li>
 *            <li>如果是构造联动菜单，则需要将该变量设置为false</li>
 *            </ul>
 * @param {string}
 * 			  city 市.当该参数为空时,将取出所有省份的城市.否则将只显示该市下的所有地区
 * @constructor
 * @extends {LinkageMenu}
 * @returns {Area}
 */
class Area extends LinkageMenu {
	constructor(sOffset, sId, sName, sVal, isInit, city){
		super(sOffset, sId, sName, sVal);
		this.xPath = city ? "//city[@name='" + city + "']/country" : '//country';

		if (isInit) {
			this.init(this.xPath);
		}
	}
}
