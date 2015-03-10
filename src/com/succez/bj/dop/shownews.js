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
	
	/**
	 * 记录访问日志
	 */
	if(id){
		recondLog("notice", id);
	}
	
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

/*
create table SZSYS_CS_LOG (
	LSH_    numeric(18,0),
	MODEL_  varchar(50),
	UID_    varchar(50),
	USER_   varchar(50),
	TIME_   datetime
)
 */

var TABLE_LOG = "SZSYS_CS_LOG";

/**
 * 当有人访问新闻时记录日志，便于以后分析点击率等，没刷新一次算一次pv
 * LSH_      流水号
 * MODEL_    模块，也有可能记录其他模块的阅读日志
 * UID_      访问内容ID，如果是新闻模块，那么就记录新闻ID 
 * USER_     用户ID
 * TIME_     具体访问的时间
 */
function recondLog(model, uid){
	var user = sz.security.getCurrentUser();
	try{
		var ds = sz.db.getDefaultDataSource();
		var dialect = ds.getDialect();
		var sql1 = new java.lang.StringBuilder();
		sql1.append("insert into ").append(TABLE_LOG).append("(LSH_,MODEL_,UID_,USER_, time_)  values(?,?,?,?,getdate())");
		var sql = sql1.toString();
		println(sql);
		ds.update(sql, [seqnum(TABLE_LOG), model, uid, sz.security.getCurrentUser().id]);
	}catch(ex){
		println(ex);
	}
}
