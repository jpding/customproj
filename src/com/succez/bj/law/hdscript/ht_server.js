/**
 *  {form=STARTFORM, datas={"UID":"e4ca9a15d35549bfb17d0e9754cd2997","BID_NAME_":"AAAA","PRO_INTRO":"s324324","BID_WAY_ID":"01","CURR_ID":"CNY","BID_AMOUNT":123213234,"CONT_MAIN_TYPE":"","CONT_SUB_TYPE":"","AGENCY":"","INVITED_SUPPLY":"","QUALIFICATION_REQUIREMENTS":"","REMARK":"","ORG":"TEST","dim":"value"}, resid=6553629}
 */
var BeanGetterHolder = com.succez.commons.service.springmvcext.BeanGetterHolder;
var BeanGetter = BeanGetterHolder.getBeanGetter();
var WIFlowService = com.succez.bi.wi.WIFlowService;
var WIUtilStartInstance = com.succez.bi.wi.util.WIUtilStartInstance;
var WIWebUtilParams     = com.succez.bi.wi.util.web.WIWebUtilParams;
var ObjectMapper        = org.codehaus.jackson.map.ObjectMapper;
var StringUtils         = com.succez.commons.util.StringUtils;
var CIUtilDataInsert = com.succez.bi.ci.util.CIUtilDataInsert;
var MetaRepository = com.succez.metadata.api.MetaRepository;
var CITask = com.succez.bi.ci.meta.CITask;
var ActionCIAddDataComponent = com.succez.bi.ci.impl.pages.cidatamgr.adddata.ActionCIAddDataComponent;
var NumberUtils = com.succez.commons.util.NumberUtils;

function main(args){
	var genHtbh = new GenHTBH("test", "2fb66edcfec04573b3d5e793a1b5f1d3");
	println(genHtbh.genHTBHPrefix());
}

var NODE_START = "startevent1";
var NODE_END   = "sid-509D57E3-D450-4800-B61A-F8F99F20F81B";

/**
 * 流程活动，包含节点，包含线条等
 * @param {} flow
 * @param {} event
 * @param {} vars
 * @return {String}
 */
function onActivityCompleted(flow, event,variables){
	/**
	 * 流程开始，更新合同状态
	 */
	var nodeId = event.getActivityId();
	var uid = variables.get("UID");
	println(flow.getPath()+"\t"+nodeId+"\t"+uid);
	var startForm = flow.getWIForm("STARTFORM", false);
	if(startForm != null){
		println("formPath:"+startForm.getPath());
	}
	
	/**
	 * 开始节点
	 */
	var ds = sz.db.getDefaultDataSource();
	if(StringUtils.equalsIgnoreCase(nodeId, NODE_START)){
		ds.update("update LC_HZ_CONT_INFO set STATUS_ = '20' where UID=?", uid);
	}else if(StringUtils.equalsIgnoreCase(nodeId, NODE_END)){
		var htbh = variables.get('CONTRACT_CODE');
		if (htbh==null || htbh==""){
			test_GenHTBH(variables.get('CREATEUSER'), uid);	
		}else{
			ds.update("update LC_HZ_CONT_INFO set STATUS_ ='30' where UID=?", uid);	  
		}
	}
}

function onAssigneeFilter_tzwbgs($flow,datas){
	var result = [];
	result.push(sz.security.getCurrentUser().id);			  
	return result;
}	

/**
 * 生成合同编号，同步合同履行数据
 * @param {} initiator
 * @return {}
 */
function test_GenHTBH(jbr, uid){
	print(jbr + " :: " + uid);
	genHTBH(jbr,uid);
	//更新状态
	print("开始更新状态");
	var ds = sz.db.getDefaultDataSource();
	ds.update("update LC_HZ_CONT_INFO set STATUS_ ='30' where UID=?", uid);
}

function genHTBH(jbr, uid){
	var htbh = new GenHTBH(jbr, uid);
	htbh.update();
}

/**
 * 生成合同编号，参考合同编号生成规则
 * @jbr 经办人
 * @uid 合同流水号
 */
function GenHTBH(jbr, uid){
	this.jbr = jbr;
	this.uid = uid;
}

/**
 * 返回需要操作的数据库表
 */
GenHTBH.prototype.getDBTable = function(){
	return "LC_HZ_CONT_INFO";
}

/**
 * 返回合同编号字段
 */
GenHTBH.prototype.getHTBHField = function(){
	return "CONTRACT_CODE";
}

/**
 * 返回流水号
 */
GenHTBH.prototype.getLSH = function(){
	return tostr(seqnum("HDHT"), "0000");
}

/**
 * 返回合同编号的前缀
 *      
 *	其他合同编号：
 *	     第1~8位  ：工程（费用）编号，
 * 	     第9~10位 ：部门代码，
 *	     第11~14位：流水号。
 *
 *  经办人的部门编号
 */
GenHTBH.prototype.genHTBHPrefix = function(){
	var ds = sz.db.getDefaultDataSource();
	var sql = this.genPrefixSQL(ds);
	var rs = ds.select(sql, [this.uid]);
	if(rs && rs.length == 1 && rs[0].length == 2){
		var gcbh = rs[0][0];
		var userId = rs[0][1];
		var user = sz.security.getUser(userId, true);
		return gcbh+user.org.id;
	}
	
	throw new Error("不存在流水号"+this.uid+"的合同!");
}

/**
 * 查询工程编号和部门编号，要注意SQL的关键字段
 */
GenHTBH.prototype.genPrefixSQL = function(ds){
	var dialect = ds.getDialect();
	var sql = [];
	sql.push("Select ");
	sql.push("PROJ_NUM,CREATEUSER");
	sql.push(" from ");
	sql.push(this.getDBTable());
	sql.push(" where ");
	sql.push(dialect.quote("uid"));
	sql.push("=?");
	return sql.join("");
}

GenHTBH.prototype.genUpdateSQL = function(ds){
	var dialect = ds.getDialect();
	var sql = [];
	sql.push("update ");
	sql.push(this.getDBTable());
	sql.push(" set ");
	sql.push(this.getHTBHField());
	sql.push("=?");
	sql.push(" where ");
	sql.push(dialect.quote("uid"));
	sql.push("=?");
	return sql.join("");
}

/**
 * 要考虑并发的情况，确保生成的编号的唯一的，避免生成重复的合同编号
 */
GenHTBH.prototype.genHTBH = function(){
	return this.genHTBHPrefix()+this.getLSH();
}

/**
 * 根据合同流水号更新，合同编号，要考虑并发的情况，确保生成的编号的唯一的，避免生成重复的合同编号
 * TODO 现在系统还没有提供比较好的同步方案，也可以使用LogService来控制，但里面提供了锁定时间，但要是
 *      锁定时间内，系统还没完成，会导致获取锁出现异常，这样有可能导致合同编号生成不了
 *      
 * 还有一种方式，流水号使用专门的函数生成，确保流水号是顺序递增，不重号，但还是可能出现断号的情形    
 * @param {} uid
 */
GenHTBH.prototype.update=function(uid){
	/**
	 * 获取锁
	 */
	try{
		var htbh = this.genHTBH();
		var ds = sz.db.getDefaultDataSource();
		var sql = this.genUpdateSQL(ds);
		ds.update(sql, [htbh, this.uid]);
	}finally{
		//释放锁
	}
}