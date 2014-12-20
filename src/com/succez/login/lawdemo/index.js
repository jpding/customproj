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
    	"YW":[["业务发起","负责合同起草和规章湿度制定，并提交进入审批流程"],["合同阶段维护","负责合同验收、履行、中止等阶段信息维护"],["法律风险预控","按照法务人员管理要求完成合同和规章制度执行"]],
    	"FW":[["审批职责","对合同和规章制度的管控点执行审批"],["风险控制","有效预防和控制法律风险"],["知识库维护","维护法律和知识库支持管控点风险控制"]],
    	"YM":[["业务最终审批权","作为业务部门经理和法务部负责人，审批流程决策环节"],["业务精细化管理","通过分析挖掘模块，审批决策时参考要求和数据"],["法律风险管控","按照法务人员管理要求完成审批决策"]],
    	"QM":[["法务管理", "健全法务管理体系，全面掌控企业规则制度及合同信息"],["领导驾驶舱","通过领导驾驶舱，提供企业管理效率"],["企业内控管理","通过分析预警，规避企业法律风险"]]};
})(jQuery);