(function($) {
	var themes = ['blue', 'red'];
	var maxThemes = themes.length - 1;
	var currentTheme = 0;
	function _applyImage(css, theme) {
		var ima = '/images/';
		return css.substring(0, css.indexOf(ima) + ima.length) + theme + css.substring(css.lastIndexOf('/'));
	}
	function _applyTheme(theme) {
		var imacss = 'background-image';
		var $page = $('.page_login');
		var $sec = $page.find('> .section');
		var $secInner = $sec.find('> .section_inner');
		$sec.css(imacss, _applyImage($sec.css(imacss), theme));
		$secInner.css(imacss, _applyImage($secInner.css(imacss), theme));
	}
	
	$('#prev-theme').click(function(env) {
		env.preventDefault();
		currentTheme -= 1;
		if (currentTheme < 0) {
		    currentTheme = maxThemes;
		}
		_applyTheme(themes[currentTheme]);
    });
	$('#next-theme').click(function(env) {
		env.preventDefault();
		currentTheme += 1;
		if (currentTheme > maxThemes) {
		    currentTheme = 0;
		}
		_applyTheme(themes[currentTheme]);
    });
    
    var roleCaptions = {"YW":"业务人员","FW":"法务人员","YM":"业务管理","QM":"企业管理"};
    var roleDescs = {
    	"YW":[["合同撰写",""],["",""],["",""]],
    	"FW":[["审批职责","对合同和规章制度的管控点执行审批"],["风险控制","有效预防和控制法律风险"],["知识库维护","维护法律和知识库支持管控点风险控制"]],
    	"YM":[["提高效率",""],["全面掌控",""],["",""]],
    	"QM":[[],[],[]]};
})(jQuery);