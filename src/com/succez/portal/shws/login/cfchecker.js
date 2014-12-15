(function($) {
	/**
	 * 谷歌浏览器内嵌框架的地址
	 */
	var cfUrl = 'http://www.google.com/chromeframe';
	/**
	 * 谷歌浏览器内嵌框架的名字
	 */
	var CONTROL_NAME = 'ChromeTab.ChromeFrame';
	/**
	 * 获取谷歌浏览器内嵌框架的启用状态，如能够渲染当前页面将返回true
	 */
	function isActiveCFRenderer() {
		return window.externalHost ? true : false;
	}
	/**
	 * 谷歌浏览器内嵌框架是否已经安装，如已经安装则返回true，这里安装了并不表示就可以用了，有可能并没有启用
	 */
	function CFChecker() {
		var win = window;
		var ua = win.navigator.userAgent.toLowerCase();
		if (ua.indexOf('chromeframe') >= 0)
			return true;

		if (typeof win['ActiveXObject'] !== 'undefined') {
			try {
				var chromeFrame = (new win.ActiveXObject(CONTROL_NAME));
				if (chromeFrame) {
					// 注册谷歌浏览器内嵌框架
					chromeFrame.registerBhoIfNeeded();
					return true;
				}
			}
			catch (e) {
			}
		}
		return false;
	}
	function _inited() {
		var html = [];
		html.push('<B class="sz-commons-browserChecker-CFInstall">');
		html.push('<SPAN class="install">您的浏览器版本过低，可能无法正常访问。请');
		html.push('<A href="', cfUrl, '">');
		html.push('下载并安装浏览器兼容性插件</A>，以确保您能正常访问。</SPAN>');
		html.push('<SPAN class="activate">您的浏览器已安装了谷歌浏览器内嵌框架，现在只是没有启用它。为了获得更好的浏览体验，建议您通过“管理加载项”设置将ChromeFrame BHO启用后再使用。</SPAN></B>');
		return $(html.join('')).appendTo('body');
	}

	$(window).on('load.sz.commons.CFInstallChecker', function() {
		    var showCFInstall = sz.utils.browser.msie && sz.utils.browser.version < 9;
		    if (!showCFInstall) {
			    return;
		    }

		    var $dom = $('.sz-commons-browserChecker-CFInstall');
		    if (!$dom.length) {
			   $dom = _inited();
		    }
		    if (CFChecker()) {
			    // 安装了但并没有启用则需要更换提示内容
			    $dom.addClass('activate');
			    var spans = $dom.find('>span');
			    spans.first().html(spans.last().html());
		    }
		    if (isActiveCFRenderer()) {
			    // 已经启用了则删除提示
			    $dom.remove();
		    }
		    else {
			    // 显示提示内容
			    $dom.css('display', 'block');
		    }
	    });
})(jQuery);