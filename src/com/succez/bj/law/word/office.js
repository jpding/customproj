/**
 * ISSUE:LAWCONT-38
 * 在线查看或者编辑office文档的页面
 * 
 * 必须设置编辑或者查看office文档的命名空间，命名空间中的方法有：
 * 必须方法：
 * getOpenUrl:必须的，打开word文档的url
 * getSaveArgs:保存时必须的，保存word文档的参数，其中args中的url是必须的
 * getFileName:保存时必须的，设置word文档的名称
 * 
 * 非必须：
 * initOffice(plug)：初始化office插件时设置插件的参数，例如启用数据留痕功能等
 * success(result):保存成功后的回调函数，将saveurl对应的action的返回值设置到success函数中
 * 
 * 为什么通过命名空间的方式？
 * 1. 由于是打开的新的浏览器窗口，IE的url中限制了字符串长度为2048，采集中打开附件保存附件的url以及参数都比较多
 * 2. 这种方式灵活度最高，需要什么从方法中获取什么，并且还可以通过initOffice来初始化插件的功能
 * 3. 由于采集中编辑了word并保存后需要通知采集修改了附件，此时必须要有success回调函数
 * 
 * @author guob
 * @createdata 20140916 guob
 */
(function($) {
	/**
	 * 在线查看或者编辑office文档的页面
	 * @class
	 */
	var WSOffice = sz.sys.createClass("sz.ci.WSOffice",
			"sz.commons.ComponentBase");

	/**
	 * TODO
	 * 根据脚本部署的位置，修改该URL链接
	 */		
	WSOffice.DOWNLOADURL = "/meta/LAWCONT/others/word/wordedit.action";		
			
	/**
	 * 文档类型，目前仅支持excel和word两种类型的文档编辑
	 */
	WSOffice.Document = {
		"xls" : "Excel.Sheet",
		"xlsx" : "Excel.Sheet",
		"doc" : "Word.Document",
		"docx" : "Word.Document"
//		"ExcelChart" : "Excel.Chart",
//		"PowerPoint" : "PowerPoint.Show",
//		"Project" : "MSProject.Project",
//		"Visio" : "Visio.Drawing",
//		"Word" : "Word.Document",
//		"WpsWord" : "WPS.Document",
//		"WpsExcel" : "ET.Workbook"
	};

	WSOffice.prototype.build = function(args) {
		if(!sz.utils.browser.msie){
			this.showError("sz.ci.wsoffice.error.browser");
			return;
		}
		WSOffice.superClass.prototype.build.apply(this, arguments);
		this._initDom();
		if (!this.editOffice) {
			this.showError("sz.ci.wsoffice.error.namespace");
			return;
		}
		this._initEvent();
		var _self = this;
		setTimeout(function(){
			_self.openFile();
		},500)		
	}

	WSOffice.prototype._initDom = function() {
		this.$plugin = this.basedom().find(".sz-ci-wsoffice-plugs");
		this.aodControl = this.$plugin[0];
		
  		//var download = "/meta/LAWCONT/others/test/word/wordedit.action?method=downloadword&facttable={0}&keyfield={1}&keys={2}&wordfield={3}";
	    var ns = this.$plugin.data("namespace");
	    if(ns){
	    	this.editOffice = window.opener.sz.sys.namespace(ns);
	    	
	    	var openUrl = this.editOffice.getOpenUrl();
	    	
	    	var self = this;
	    	this.editOffice.getOpenUrl = function(){
	    		return openUrl + "&version=" + self.getWordVersion();
	    	}
	    }else{
	    	var downloadUrl = WSOffice.DOWNLOADURL ;
	  		var downloadUrlParam = sz.utils.setParameter("method", "downloadword");
	  		/**
	  		 * downloadtype 在wordedit.ftl中定义
	  		 */
	  		downloadUrl = downloadUrl+downloadUrlParam+"&sid="+Math.random()+"&version="+this.getWordVersion();
			this.editOffice = sz.sys.namespace("szword");
			
			this.editOffice.getArgs = function(){
				return null;
			}
			
			this.editOffice.getOpenUrl = function() {
				return sz.sys.ctx(downloadUrl);
		    }
		    
		    var saveArgs = {};
		    var saveParams = sz.utils.getParametersOfUrl();
		    for(var i=0; i<saveParams.length; i++){
		    	var param = saveParams[i];
		    	saveArgs[param[0]] = param[1];
		    }
		    saveArgs["method"] = "uploadWord";
		    saveArgs["url"]    = WSOffice.DOWNLOADURL;
		    
		    this.editOffice.getSaveArgs = function() {
			    return saveArgs;
		    }
		    this.editOffice.getFileName = function() {
			    return "word.doc";
		    }
		    this.editOffice.success = function(info) {
			    alert('save success!');
		    }
	    }
	}

	/**
	 * 初始化插件上的事件
	 */
	WSOffice.prototype._initEvent = function() {
		var self = this;
		if (this.aodControl.attachEvent) {
			this.aodControl.attachEvent("OnFileCommand",
					function(item, cancle) {
						self._setControlEvent(item, cancle);
					});
		} else {
			/**
			 * 20140718 guob ISSUE:BI-10897
			 * 问题原因：IE11以后不再支持attachEvent，必须改用addEventListener，但是改用addEventListener后给ActiveX注册
			 * 事件后仍然执行不了设置的事件 解决方案：在IE11以后给ActiveX注册事件只能使用for...event script
			 * blocks方式
			 * 
			 * 相关链接：http://social.msdn.microsoft.com/Forums/en-US/b61503c9-65db-4415-b67b-68ad52fa081c/ie11-activex?forum=ieextensiondevelopment
			 */
			window["_WSOffice_"] = this;
			var handler = document.createElement("script");
			handler.setAttribute("for", "wsofficeobject");
			handler.event = "OnFileCommand(item,cancle)";
			var func = "window['_WSOffice_']._setControlEvent(item, cancle);";
			handler.appendChild(document.createTextNode(func));
			document.body.appendChild(handler);
		}
	}

	/**
	 * 控制事件，此处暂时提供保存的事件
	 */
	WSOffice.prototype._setControlEvent = function(item, cancle) {
		if (item == 3) {
			this.saveToServer();
		}
	}

	/**
	 * 使用插件打开文档
	 * 
	 * @method
	 */
	WSOffice.prototype.openFile = function() {
		if (!this.editOffice.getOpenUrl) {
			this.showError("sz.ci.wsoffice.error.getopenurl");
			return;
		}
		var url = this.editOffice.getOpenUrl();
		if (!url) {
			this.showError("sz.ci.wsoffice.error.openurl");
			return;
		}
		/**
		 * 20140928 guob
		 * 问题现象：采集草稿中在有contextpath的情况下编辑word会出现“您要查看的页面不存在”的问题
		 * 问题原因：由于从采集中获取的打开的url中已经带有ctx，之前又加上了一次ctx，导致有两个ctx
		 * 解决方案：下面代码中的url不再加上ctx
		 */
		url = this.getUrlPrefix() + url;
		if (!this.editOffice.getFileName) {
			this.showError("sz.ci.wsoffice.error.getfilename");
			return;
		}
		
		var name = this.editOffice.getFileName();
		if (!name) {
			this.showError("sz.ci.wsoffice.error.filename");
			return;
		}
		var idx = name.indexOf('.');
		if (idx == -1) {
			this.showError("sz.ci.wsoffice.error.filename.suffix");
			return;
		}
		var suffix = name.substring(idx + 1);
		var ole = WSOffice.Document[suffix.toLowerCase()];
		if(!ole){
			this.showError("sz.ci.wsoffice.error.filetype", suffix);
			return;
		}
		
		this.aodControl.Open(url, null, "Word.Document");
		var editargs = this.editOffice.getArgs();
		if (editargs && editargs.initPlugin) {
			editargs.initPlugin(this.aodControl);
		}
	}
	
	/**
	 * 返回word版本号
	 */
	WSOffice.prototype.getWordVersion = function(){
		return this.aodControl.GetOfficeVersion("Word.Application"); 
	}
	
	/**
	 * 关闭文件
	 */
	WSOffice.prototype.closeFile = function(){
		if(this.aodControl){
			this.aodControl.close(); 
			this.aodControl = null;
		}
	}

	/**
	 * 插件打开或者保存时必须是http的全路径，即“http://xxxx/xxx”，该方法提供获取“http://xxxx”
	 */
	WSOffice.prototype.getUrlPrefix = function() {
		var url = window.location.href;
		return url.substring(0, url.indexOf('/', 7));
	}

	/**
	 * 保存到服务器
	 * 
	 * @method
	 */
	WSOffice.prototype.saveToServer = function() {
		if (!this.editOffice.getSaveArgs) {
			this.showError("sz.ci.wsoffice.error.getsaveargs");
			return;
		}
		var args = this.editOffice.getSaveArgs() || {};
		var url = args.url;
		if (!url) {
			this.showError("sz.ci.wsoffice.error.saveurl");
			return;
		}
		if (!this.editOffice.getFileName) {
			this.showError("sz.ci.wsoffice.error.getfilename");
			return;
		}
		var name = this.editOffice.getFileName();
		if (!name) {
			this.showError("sz.ci.wsoffice.error.filename");
			return;
		}
		try {
			this.aodControl.HttpInit();
			/**
			 * 需要在HttpAddPostCurrFile方法之前将configxml设置到文档中， 否则当前提交的文档的配置文件还是以前的。
			 */
			var url = this.getUrlPrefix() + url;
			/**
			 * 设置参数到插件中，通过post方式提交
			 */
			if (args) {
				var self = this;
				$.each(args, function(k, v) {
							/**
							 * 20140923 guob
							 * ISSUE:LAWCONT-38
							 * 问题三原因：不能给插件设置值为null的值，否则就会抛出“类型不匹配”的js异常
							 * 解决方案：如果设置的值为null，那么设置一个空值避免出现js异常
							 */
							v = v != null ? v : "";
							self.aodControl.HttpAddPostString(k, v);
						});
			}
			this.aodControl.HttpAddPostCurrFile("fileobj",
					encodeURIComponent(name));
			var result = this.aodControl.HttpPost(url);
			if (result && this.editOffice.success) {
				this.editOffice.success(result);
			}
			sz.commons.Alert.show({
						msg : sz.sys.message("sz.ci.wsoffice.save.success")
					});
		} catch (e) {
			sz.commons.Alert.show({
					type : sz.commons.Alert.TYPE.ERROR,
					msg : sz.sys.message(e)
				});
		}
	}

	/**
	 * 显示错误信息的对话框
	 */
	WSOffice.prototype.showError = function(code) {
		sz.commons.Alert.show({
					type : sz.commons.Alert.TYPE.ERROR,
					msg : sz.sys.message(code, arguments[1])
				});
	}

})(jQuery);