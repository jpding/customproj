function initEnv2() {
	$("body").append(DWZ.frag["dwzFrag"]);

	if ( $.browser.msie && /6.0/.test(navigator.userAgent) ) {
		try {
			document.execCommand("BackgroundImageCache", false, true);
		}catch(e){}
	}
	//清理浏览器内存,只对IE起效
	if ($.browser.msie) {
		window.setInterval("CollectGarbage();", 10000);
	}

	$(window).resize(function(){
		initLayout();
		$(this).trigger(DWZ.eventType.resizeGrid);
	});

	$("#leftside").jBar({minW:150, maxW:700});
	
	
	var ajaxbg = $("#background,#progressBar");
	ajaxbg.hide();
	$(document).ajaxStart(function(){
		ajaxbg.show();
	}).ajaxStop(function(){
		ajaxbg.hide();
	});
	
	$.ajaxSetup({global: false});
	
	if ($.taskBar) $.taskBar.init();
	navTab.init();
	if ($.fn.switchEnv) $("#switchEnvBox").switchEnv();
	if ($.fn.navMenu) $("#navMenu").navMenu();
		
	setTimeout(function(){
		initLayout();
		initUI();
		
		// navTab styles
		var jTabsPH = $("div.tabsPageHeader");
		jTabsPH.find(".tabsLeft").hoverClass("tabsLeftHover");
		jTabsPH.find(".tabsRight").hoverClass("tabsRightHover");
		jTabsPH.find(".tabsMore").hoverClass("tabsMoreHover");
	
	}, 200);

}
function initLayout(){
	var iContentW = $(window).width() - (DWZ.ui.sbar ? $("#sidebar").width() + 10 : 34) - 5;
	var iContentH = $(window).height() - $("#header").height() - 5;

	$("#container").width(iContentW);
	$("#container .tabsPageContent").height(iContentH - 34).find("[layoutH]").layoutH();
	$("#sidebar, #sidebar_s .collapse, #splitBar, #splitBarProxy").height(iContentH - 5);
	$("#taskbar").css({top: iContentH + $("#header").height() + 5, width:$(window).width()});
	$("#framehome").height(iContentH - 34);
}

function addNavTabEvent($href, event){
	var $this = $href;
	var title = $this.attr("title") || $this.text();
	var tabid = $this.attr("rel") || "_blank";
	var fresh = eval($this.attr("fresh") || "true");
	var external = eval($this.attr("external") || "false");
	//var url = unescape($this.attr("href")).replaceTmById($(event.target).parents(".unitBox:first"));
	var url = $this.attr("href");
	DWZ.debug(url);
	if (!url.isFinishedTm()) {
		alertMsg.error($this.attr("warn") || DWZ.msg("alertSelectMsg"));
		return false;
	}
	navTab.openTab(tabid, url,{title:title, fresh:fresh, external:external});

	event.preventDefault();
}

function initUI(_box){
	var $p = $(_box || document);

	$("div.panel", $p).jPanel();

	//tables
	$("table.table", $p).jTable();
	
	// css tables
	$('table.list', $p).cssTable();

	//auto bind tabs
	$("div.tabs", $p).each(function(){
		var $this = $(this);
		var options = {};
		options.currentIndex = $this.attr("currentIndex") || 0;
		options.eventType = $this.attr("eventType") || "click";
		$this.tabs(options);
	});

	$("ul.tree", $p).jTree();
	$('div.accordion', $p).each(function(){
		var $this = $(this);
		$this.accordion({fillSpace:$this.attr("fillSpace"),alwaysOpen:true,active:0});
	});

	$(":button.checkboxCtrl, :checkbox.checkboxCtrl", $p).checkboxCtrl($p);
	
	if ($.fn.combox) $("select.combox",$p).combox();
	
	if ($.fn.xheditor) {
		$("textarea.editor", $p).each(function(){
			var $this = $(this);
			var op = {html5Upload:false, skin: 'vista',tools: $this.attr("tools") || 'full'};
			var upAttrs = [
				["upLinkUrl","upLinkExt","zip,rar,txt"],
				["upImgUrl","upImgExt","jpg,jpeg,gif,png"],
				["upFlashUrl","upFlashExt","swf"],
				["upMediaUrl","upMediaExt","avi"]
			];
			
			$(upAttrs).each(function(i){
				var urlAttr = upAttrs[i][0];
				var extAttr = upAttrs[i][1];
				
				if ($this.attr(urlAttr)) {
					op[urlAttr] = $this.attr(urlAttr);
					op[extAttr] = $this.attr(extAttr) || upAttrs[i][2];
				}
			});
			
			$this.xheditor(op);
		});
	}
	
	if ($.fn.uploadify) {
		$(":file[uploaderOption]", $p).each(function(){
			var $this = $(this);
			var options = {
				fileObjName: $this.attr("name") || "file",
				auto: true,
				multi: true,
				onUploadError: uploadifyError
			};
			
			var uploaderOption = DWZ.jsonEval($this.attr("uploaderOption"));
			$.extend(options, uploaderOption);

			DWZ.debug("uploaderOption: "+DWZ.obj2str(uploaderOption));
			
			$this.uploadify(options);
		});
	}
	
	// init styles
	$("input[type=text], input[type=password], textarea", $p).addClass("textInput").focusClass("focus");

	$("input[readonly], textarea[readonly]", $p).addClass("readonly");
	$("input[disabled=true], textarea[disabled=true]", $p).addClass("disabled");

	$("input[type=text]", $p).not("div.tabs input[type=text]", $p).filter("[alt]").inputAlert();

	//Grid ToolBar
	$("div.panelBar li, div.panelBar", $p).hoverClass("hover");

	//Button
	$("div.button", $p).hoverClass("buttonHover");
	$("div.buttonActive", $p).hoverClass("buttonActiveHover");
	
	//tabsPageHeader
	$("div.tabsHeader li, div.tabsPageHeader li, div.accordionHeader, div.accordion", $p).hoverClass("hover");

	//validate form
	$("form.required-validate", $p).each(function(){
		var $form = $(this);
		$form.validate({
			onsubmit: false,
			focusInvalid: false,
			focusCleanup: true,
			errorElement: "span",
			ignore:".ignore",
			invalidHandler: function(form, validator) {
				var errors = validator.numberOfInvalids();
				if (errors) {
					var message = DWZ.msg("validateFormError",[errors]);
					alertMsg.error(message);
				} 
			}
		});
		
		$form.find('input[customvalid]').each(function(){
			var $input = $(this);
			$input.rules("add", {
				customvalid: $input.attr("customvalid")
			})
		});
	});

	if ($.fn.datepicker){
		$('input.date', $p).each(function(){
			var $this = $(this);
			var opts = {};
			if ($this.attr("dateFmt")) opts.pattern = $this.attr("dateFmt");
			if ($this.attr("minDate")) opts.minDate = $this.attr("minDate");
			if ($this.attr("maxDate")) opts.maxDate = $this.attr("maxDate");
			if ($this.attr("mmStep")) opts.mmStep = $this.attr("mmStep");
			if ($this.attr("ssStep")) opts.ssStep = $this.attr("ssStep");
			$this.datepicker(opts);
		});
	}

	//dialogs
	$("a[target=dialog]", $p).each(function(){
		$(this).click(function(event){
			var $this = $(this);
			var title = $this.attr("title") || $this.text();
			var rel = $this.attr("rel") || "_blank";
			var options = {};
			var w = $this.attr("width");
			var h = $this.attr("height");
			if (w) options.width = w;
			if (h) options.height = h;
			options.max = eval($this.attr("max") || "false");
			options.mask = eval($this.attr("mask") || "false");
			options.maxable = eval($this.attr("maxable") || "true");
			options.minable = eval($this.attr("minable") || "true");
			options.fresh = eval($this.attr("fresh") || "true");
			options.resizable = eval($this.attr("resizable") || "true");
			options.drawable = eval($this.attr("drawable") || "true");
			options.close = eval($this.attr("close") || "");
			options.param = $this.attr("param") || "";

			var url = unescape($this.attr("href")).replaceTmById($(event.target).parents(".unitBox:first"));
			DWZ.debug(url);
			if (!url.isFinishedTm()) {
				alertMsg.error($this.attr("warn") || DWZ.msg("alertSelectMsg"));
				return false;
			}
			$.pdialog.open(url, rel, title, options);
			
			return false;
		});
	});
	$("a[target=ajax]", $p).each(function(){
		$(this).click(function(event){
			var $this = $(this);
			var rel = $this.attr("rel");
			if (rel) {
				var $rel = $("#"+rel);
				$rel.loadUrl($this.attr("href"), {}, function(){
					$rel.find("[layoutH]").layoutH();
				});
			}

			event.preventDefault();
		});
	});
	
	$("div.pagination", $p).each(function(){
		var $this = $(this);
		$this.pagination({
			targetType:$this.attr("targetType"),
			rel:$this.attr("rel"),
			totalCount:$this.attr("totalCount"),
			numPerPage:$this.attr("numPerPage"),
			pageNumShown:$this.attr("pageNumShown"),
			currentPage:$this.attr("currentPage")
		});
	});

	if ($.fn.sortDrag) $("div.sortDrag", $p).sortDrag();

	// dwz.ajax.js
	if ($.fn.ajaxTodo) $("a[target=ajaxTodo]", $p).ajaxTodo();
	if ($.fn.dwzExport) $("a[target=dwzExport]", $p).dwzExport();

	if ($.fn.lookup) $("a[lookupGroup]", $p).lookup();
	if ($.fn.multLookup) $("[multLookup]:button", $p).multLookup();
	if ($.fn.suggest) $("input[suggestFields]", $p).suggest();
	if ($.fn.itemDetail) $("table.itemDetail", $p).itemDetail();
	if ($.fn.selectedTodo) $("a[target=selectedTodo]", $p).selectedTodo();
	if ($.fn.pagerForm) $("form[rel=pagerForm]", $p).pagerForm({parentBox:$p});

	// 执行第三方jQuery插件【 第三方jQuery插件注册：DWZ.regPlugins.push(function($p){}); 】
	$.each(DWZ.regPlugins, function(index, fn){
		fn($p);
	});
}

/**
 * 处理消息事件，当有新消息时，自动修改顶部的消息提示，并自动刷新首页
 * 快捷消息控件，提供显示未读消息面板和轮询消息
 * @author guob
 * @createdata 20140617
 * @depends sz.commons.floatpanel
 */
(function($) {
	var PMessage = sz.sys.namespace("sz.metadata.PMessageEx");
	
	/**
	 * 轮询请求消息个数
	 * @params $container 轮询请求消息个数气泡显示的容器，必须的
	 * @params timer 轮询的事件，没有设置默认为10000ms
	 */
	PMessage.queryMessageCount = function($container, timer) {
		if(!$container){
			return;
		}
		this.timer = timer;
		this._initMessageCountDom($container);
		this._focusCurrentWindw = true;
		this._queryMessageCount();
	}
	
	/**
	 * 初始化消息个数的dom节点，其实就是一个小气泡dom， 在低浏览器（IE678）下是一个方形的，其他浏览器是一个原型或者椭圆形的
	 */
	PMessage._initMessageCountDom = function($container) {
		if (this.$messageCount) {
			return;
		}
		this.$messageCount = $("<span class='sz-metadata-pmessage-count'></span>")
				.appendTo($container);
	}
	
	/**
	 * 发送请求未读消息个数
	 */
	PMessage._queryMessageCount = function() {
		$.ajax({
					url : sz.sys.ctx("/pmsgapi/unreadcount"),
					success : function(count) {
						PMessage._querySuccess(count);
					},
					error : function() {
						/**
						 * 如果轮询个数出现异常时不做任何处理，继续轮询
						 */
						PMessage._queryMessageCount_timer();
						return false;
					}
				});
	}
	
	/**
	 * 请求成功后的处理
	 */
	PMessage._querySuccess = function(count) {
		this._queryMessageCount_timer();
		if (count === this._currentCount) {
			return;
		}
		this._currentCount = count;
		/**
		 * 直接刷新报表，最好由消息机制添加事件，有新的消息时，
		 */
		this._refreshAllReport();
		/**
		 * count可能会存在三种状态： 
		 * count==0  表示正常状态，没有任何新消息，此时隐藏消息格式
		 * count>0   表示正常状态，有新消息，显示消息格式 
		 * count==-1 表示异常状态，服务器异常，此时不做任何事情
		 */
		if (count == 0) {
			this.$messageCount.hide();
		} else if (count > 0) {
			this.$messageCount.css("display", "inline-block");
			this.$messageCount.text(count);
		}
	}

	/**
	 * 每隔10s请求一次消息个数
	 */
	PMessage._queryMessageCount_timer = function() {
		/**
		 * 当已经不在了当前页面时不再启动timer来请求未读消息个数
		 */
		if (!this._focusCurrentWindw) {
			return;
		}
		this._query_timer = setTimeout(function() {
					PMessage._queryMessageCount();
				}, this.timer != null ? this.timer : 30000);
	}
	
	/**
	 * 当有消息来时，自动刷新首页报表
	 */
	PMessage._refreshAllReport = function(){
		var win = $("#framehome")[0].contentWindow;
		if(win && win.sz && win.sz.law){
			win.sz.law.refreshAllReport();
		}
	}
})(jQuery);