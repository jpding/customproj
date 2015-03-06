var BeanGetter  = com.succez.commons.service.springmvcext.BeanGetterHolder.getBeanGetter();
var StringUtils = com.succez.commons.util.StringUtils;
var serviceAttachments = BeanGetter.getBean(com.succez.bi.ci.impl.mgr.CIServiceAttachmentsImpl);


/**
 * 显示新闻
 * @param {} req
 * @param {} res
 */
 
/**
 * 新闻采集任务PATH
 * @type String
 */ 
var CI_NEWS_PATH = "IntegratedManagement:/collections/doq/notice";

function execute(req, res){
	var id = req.id;
	
	var news = getNewsObject(id);
	
	res.attr("title", news.title);
	res.attr("content", news.content);
	
	return "show.ftl";
}

var EMPTY_CONTENT = {title:"", content:""};

/**
 * 返回新闻对象，{title:"", content:""}
 * @param {} id
 */
function getNewsObject(id){
	var citask = serviceAttachments.getCITask(CI_NEWS_PATH);
	
	var factTablePath = null;
	var tables = citask.getAllDWTables();
	for(var i=0; i<tables.size(); i++){
		var tb = tables.get(i);
		var tabObj = citask.getDWTableInf(tb);
		var path = tabObj.getPath();
		if(path.indexOf("models/forms") > -1){
			factTablePath = path;
			break;
		}
	}
	
	var ft = sz.metadata.get(factTablePath).getObject();
	var dbTable = ft.getDbTable(); 
	var uidField = citask.getDetailGrainDef().getIDField();
	
	var ds  = sz.db.getDefaultDataSource();
	var sql = "select title, content from "+dbTable+" where "+uidField+"=?";
	var rs = ds.select(sql, [id]);
	if(!rs || rs.length == 0){
		return EMPTY_CONTENT;
	}
	
	return {title:rs[0][0], content:rs[0][1]};
}

