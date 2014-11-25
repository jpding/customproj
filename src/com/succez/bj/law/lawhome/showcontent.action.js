var PortalUtils = com.succez.bi.portal.utils.PortalUtils;
var StringUtils = com.succez.commons.util.StringUtils;
var StringEscapeUtils = com.succez.commons.util.StringEscapeUtils;

function execute(req, res){
	/**
	 * respath 
	 * params={}
	 */
	var path = req.path;
	var params = new java.util.HashMap();
	println("path:"+path);
	PortalUtils.mergeRequestParams(req, params);
	res.attr("params", params);
	res.attr("respath", StringEscapeUtils.unescapeJavaScript(path));
	return "showcontent.ftl";
}