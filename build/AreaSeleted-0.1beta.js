function XmlDom() {
	if (window.ActiveXObject) {
		try {
			var oXmlDom = new ActiveXObject("Microsoft.XMLDOM");
			oXmlDom.async = false;
			return oXmlDom;

		} catch (oError) {
			oError.reason;
		}
		throw new Error("MSXML is not installed on you system.");
	} else if (document.implementation
			&& document.implementation.createDocument) {

		var oXmlDom = document.implementation.createDocument("", "", null);

		oXmlDom.addEventListener("load", function() {
			this.__changeReadyState__();
		}, false);

		/**
		 * 设置为同步模式，使其在调用 load 方法完成对xml文档的读入后在继续进行其他操作<br/> 如果设置为异步模式，则在使用
		 * oXmlDom 对象前首先判断xml文档是否已经加载完成。<br/> xml文档加载完成的标志是：<br/> 1、在 IE 中
		 * oXmlDom 对象的 readyState 属性等于4时； 2、在 Mozilla 中 oXmlDom 对象的 readyState
		 * 属性等于 'complete' 时;
		 */
		oXmlDom.async = false;

		return oXmlDom;
	} else {
		throw new Error("Your browser doesn't support an XML DOM object.");
	}
}
// Mozilla
if (typeof (Document) != 'undefined') {
	Document.prototype.onreadystatechange = null;
	Document.prototype.__changeReadyState__ = function() {
		if (typeof this.onreadystatechange == 'function') {
			this.onreadystatechange();
		}
	};
	Document.prototype.loadXML = function(sXml) {
		var oParser = new DOMParser();
		var oXmlDom = oParser.parseFromString(sXml, "text/xml");

		while (this.firstChild) {
			this.removeChild(this.firstChild);
		}
		for ( var i = 0; i < oXmlDom.childNodes.length; i++) {
			var oNewNode = this.importNode(oXmlDom.childNodes[i], true);
			this.appendChild(oNewNode);
		}
	};

	// 为节点定义xml获取函数，使其节点可以直接使用方法.xml
	// __defineGetter__方法只在Mozilla中定义
	Node.prototype.__defineGetter__("xml", function() {
		var oSerializer = new XMLSerializer();
		return oSerializer.serializeToString(this, "text/xml");
	});

	/**
	 * 查找匹配XPath表达式的节点（Mozilla实现selectNodes方法；IE自带该方法）
	 * 
	 * @param sXPath
	 *            XPAHT表达式
	 * @return 节点集合数组 Array<Element>
	 */
	Element.prototype.selectNodes = function(sXPath) {
		var oEvaluator = new XPathEvaluator();
		var oResult = oEvaluator.evaluate(sXPath, this, null,
				XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
		var aNodes = new Array();
		if (oResult != null) {
			var oElement = oResult.iterateNext();
			while (oElement) {
				aNodes.push(oElement);
				oElement = oResult.iterateNext();
			}
		}
		return aNodes;
	};
	/**
	 * 查找第一个匹配XPath表达式的节点（Mozilla实现selectSingleNode方法；IE自带该方法）
	 * 
	 * @param sXPath
	 *            XPAHT表达式
	 * @return 节点元素对象 instanceof Element is true
	 */
	Element.prototype.selectSingleNode = function(sXPath) {
		var oEvaluator = new XPathEvaluator();
		var oResult = oEvaluator.evaluate(sXPath, this, null,
				XPathResult.FIRST_ORDERED_NODE_TYPE, null);
		if (oResult != null) {
			return oResult.singleNodeValue;
		} else {
			return null;
		}
	};
	/**
	 * 统计匹配指定模式的节点个数（该方法仅限于Mozilla）
	 * 
	 * @param sXPath
	 *            XPAHT表达式
	 * @return 返回匹配节点个数。如没有匹配则返回0
	 */
	Element.prototype.count = function(sXPath) {
		var __count = 0;
		sXPath = "count(" + sXPath + ")";
		var oEvaluator = new XPathEvaluator();
		var oResult = oEvaluator.evaluate(sXPath, this, null,
				XPathResult.NUMBER_TYPE, null);
		if (oResult) {
			__count = oResult.numberValue;
		}
		return __count;
	};
	/**
	 * 判断指定XPath表达式是否有匹配节点（该方法仅限于Mozilla）
	 * 
	 * @param sXPath
	 *            XPAHT表达式
	 * @return true|false
	 */
	Element.prototype.isMatch = function(sXPath) {
		var oEvaluator = new XPathEvaluator();
		var oResult = oEvaluator.evaluate(sXPath, this, null,
				XPathResult.BOOLEAN_TYPE, null);
		return oResult.booleanValue;
	};
	// IE 实现的XPath不支持谓语表达式中带有last()|position()
}
/**
 * 读xml文件，兼容IE、Firefox、Chrome浏览器。当使用chrome浏览器时应确保该代码存放在服务器端.
 * <br/>如果需要直接在Chrome浏览器中运行，需要在使用 <blockquote>`chrome.exe
 * --allow-file-access-from-files`</blockquote> 来启动浏览器，否则无法在chrome浏览中无法读入xml文件
 * 
 * @returns {Doccumnt Object} xml文档对象
 */
function loadxml() {
	var start = +new Date();
	var oXmlDom = XmlDom();
	if (typeof (oXmlDom.load) == 'undefined') {
		var xmlhttp = new XMLHttpRequest();
		/*
		 * when set async eq true and load local xml file, the chrome will throw
		 * excption 'XMLHttpRequest cannot load file:///...areadata.xml. Origin
		 * null is not allowed by Access-Control-Allow-Origin.' when set async
		 * eq false and load local xml file will throw exception "Uncaught
		 * Error: NETWORK_ERR: XMLHttpRequest Exception 101" in addition to the
		 * above
		 */
		xmlhttp.open("POST", "areadata.xml", false);// 同步执行
		xmlhttp.setRequestHeader('Content-Type', 'application/xml');
		xmlhttp.send(null);
		oXmlDom = xmlhttp.responseXML;
	} else {
		oXmlDom.load("areadata.xml");
	}
	var end = +new Date();
	console.log("load xml spend : " + (end - start) + " ms");
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
function HtmlSelect(sId, sName, sVal) {
	this.id = sId;
	this.name = sName;
	this.val = sVal;
	this.select = this.createSelect_();
}
/**
 * 创建select元素
 * 
 * @private
 * @returns {Element} select element
 */
HtmlSelect.prototype.createSelect_ = function() {
	var oSelect = document.createElement("select");
	oSelect.setAttribute("id", this.id);
	oSelect.setAttribute("name", this.name);
	return oSelect;
};
/**
 * 创建并添加 option 元素
 * 
 * @param {string}
 *            sVal option 元素 value
 * @param {string}
 *            sText option 元素 显示值
 * @returns {Element} option element
 */
HtmlSelect.prototype.addOption = function(sVal, sText) {
	/**
	 * 创建option方法1<br/> 使用该方法IE6\FF下，默认selected不会出现错位
	 */
	var option = document.createElement("option");
	option.appendChild(document.createTextNode(sText));
	option.setAttribute('value', sVal);
	if (this.val && sVal == this.val) {
		option.setAttribute('selected', 'selected');
	}

	this.select.appendChild(option);

	/**
	 * 创建option方法2<br/> 使用该方法IE6下，默认selected会出现错位
	 */

	// var option = null;
	// if (this.val && sVal == this.val) {
	// option = new Option(sText, sVal, true, true);
	// } else {
	// option = new Option(sText, sVal, false, false);
	// }
	// try {
	// this.select.add(option, null); // standards compliant
	// } catch (ex) {
	// this.select.add(option); // IE only
	// }
	/**
	 * 创建option方法2<br/> 使用该方法IE6下，默认selected会出现错位
	 */
	// var option = document.createElement("option");
	// option.value = sVal;
	// option.text = sText;
	// if (this.val && sVal == this.val) {
	// option.setAttribute('selected', 'true');
	// }
	// //this.select.appendChild(option);IE6下此时不可用appendChild添加
	// try {
	// this.select.add(option, null); // standards compliant
	// } catch (ex) {
	// this.select.add(option); // IE only
	// }
};
/**
 * 清除 select 元素下所有的 option 元素
 * 
 */
HtmlSelect.prototype.cleanOptions = function() {
	if (this.select && this.select.options.length != 0) {
		// 需要从最后一个option进行清除，否则会发生异常
		for ( var i = this.select.options.length - 1; i >= 0; i--) {
			this.select.remove(this.select.options[i]);
		}
	}
};

/**
 * 显示select标签在页面中
 * 
 * @param {string}
 *            offset select元素父节点id
 */
HtmlSelect.prototype.showHtml = function(offset) {
	var op = document.getElementById(offset);
	op.appendChild(this.select);
};

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
function LinkageMenu(sOffset, sId, sName, sVal) {
	// 保证area.xml文件只被加载一次
	this.xml = LinkageMenu.xml ? LinkageMenu.xml : loadxml();
	this.offset = sOffset;
	this.id = sId;
	this.name = sName;
	this.val = sVal;
	this.htmlSelect = new HtmlSelect(this.id, this.name, this.val);
}
/**
 * 伪静态areadata.xml数据变量
 */
LinkageMenu.xml = loadxml();

/**
 * 初始化数据并显示在页面指定元素中
 * 
 * @param {string}
 *            xPath xPath表达式
 */
LinkageMenu.prototype.init = function(xPath) {
	var xmlData = this.xml.documentElement.selectNodes(xPath);
	if (!this.val && xmlData[0]) {// 如果没有默认值，则将第一个元素设置为默认值
		this.val = xmlData[0].getAttribute("name");
		this.htmlSelect.val = this.val;
	}
	for ( var i = 0; i < xmlData.length; i++) {
		this.htmlSelect.addOption(xmlData[i].getAttribute("name"), xmlData[i]
				.getAttribute("name"));
	}
	this.htmlSelect.showHtml(this.offset);
};
/**
 * 联动菜单onchange事件
 * 
 * @param {string}
 *            xPath 新数据 xPath 表达式
 * @returns
 */
LinkageMenu.prototype.change = function() {
	var oLink = LinkageMenu["link_" + this.id];// 获取onchange方法的绑定对象
	oLink.htmlSelect.cleanOptions();

	var sXpath = oLink.xPath.replace("&var", this.value);// 替换xPath中的变量部分
	var xmlData = oLink.xml.documentElement.selectNodes(sXpath);
	for ( var i = 0; i < xmlData.length; i++) {
		oLink.htmlSelect.addOption(xmlData[i].getAttribute("name"), xmlData[i]
				.getAttribute("name"));
	}
	var oLinkedLink = LinkageMenu["link_" + oLink.id];// 获取被绑定对象onchange绑定的对象
	if (oLinkedLink) {
		oLinkedLink.htmlSelect.cleanOptions();
		var data = xmlData[0].childNodes;
		for ( var j = 0; j < data.length; j++) {
			if (data[j].nodeType == 1) {// ELEMENT_NODE
				oLinkedLink.htmlSelect.addOption(data[j].getAttribute("name"),
						data[j].getAttribute("name"));
			}
		}
	}
};
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
function Province(sOffset, sId, sName, sVal) {
	LinkageMenu.call(this, sOffset, sId, sName, sVal);
	this.xPath = "//province";
	this.init(this.xPath);
}
Province.prototype = new LinkageMenu();

/**
 * 省市联动
 * 
 * @param {City}
 *            oCity 联动市对象
 */
Province.prototype.linkCity = function(oCity) {
	oCity.xPath = "//province[@name='&var']/city";
	LinkageMenu["link_" + this.id] = oCity;// 指定当前province绑定的city
	this.htmlSelect.select.onchange = this.change;
	if (this.val) {
		var sXpath = oCity.xPath.replace("&var", this.val);
		oCity.init(sXpath);
	}
};
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
 * @constructor
 * @extends {LinkageMenu}
 * @returns {City}
 */
function City(sOffset, sId, sName, sVal, isInit) {
	LinkageMenu.call(this, sOffset, sId, sName, sVal);
	this.xPath = "//city";
	if (isInit) {
		this.init(this.xPath);
	}
}
City.prototype = new LinkageMenu();
/**
 * 市区联动
 * 
 * @param {Area}
 *            oArea 区对象
 */
City.prototype.linkArea = function(oArea) {
	oArea.xPath = "//city[@name='&var']/country";
	LinkageMenu["link_" + this.id] = oArea;// // 指定当前city绑定的area
	this.htmlSelect.select.onchange = this.change;
	if (this.val) {
		oArea.htmlSelect.cleanOptions();
		var sXpath = oArea.xPath.replace("&var", this.val);
		oArea.init(sXpath);
	}
};
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
 * @constructor
 * @extends {LinkageMenu}
 * @returns {Area}
 */
function Area(sOffset, sId, sName, sVal, isInit) {
	LinkageMenu.call(this, sOffset, sId, sName, sVal);
	this.xPath = "//country";
	if (isInit) {
		this.init(this.xPath);
	}
}
Area.prototype = new LinkageMenu();
