var BeanGetter  = com.succez.commons.service.springmvcext.BeanGetterHolder.getBeanGetter();
var StringUtils = com.succez.commons.util.StringUtils;

var serviceAttachments = BeanGetter.getBean(com.succez.bi.ci.impl.mgr.CIServiceAttachmentsImpl);

/**
 * http://jira.succez.com/browse/BI-12787 
 * 工作交接
 */
var CI_DEL_PATH = "LAWCONT:/collections/sys_manager/taskAssign";

/**
 * 交接人员ID
 */
var FIELD_JJRY  = "djjryid";

/**
 * 被交接人员
 * @type String
 */
var FIELD_BJJRY = "bjjryid";

function main(args){
	var fb = getDeleDBTable("F0"); 
	println(fb);
	
	println(getAllDelegateUsers("1"));
	delegate("")
}

/**
 * 单次交办时执行代理，会把所有正在运行时的任务代理给被交接人
 * @param {} uid  单次交办时对应的流水号
 */
function delegate(uid){
	var jjr  = getDele(uid);
	if(StringUtils.isEmpty(jjr)){
		throw new Error("交接人员为空:“" + uid + "”");
	}
	
	var bjjrs = getDele2Users(uid); 
	if(bjjrs.length == 0){
		throw new Error("被交接人员为空：“" + uid + "”");
	}
	
	var bjjr = bjjrs.join(",");
	println("交办人："   + jjr);
	println("被交接人：" + bjjr);
	//sz.wi.delegateFlow("*", jjr, bjjr, "");
}

/**
 * 返回交接人员
 * @param {} uid 某一次交接的审批 
 * @return {}
 */
function getDele(uid){
	var rs = getUsers(uid, FIELD_JJRY);
	return rs[0][0];
}

/**
 * 返回被交接人员，有可能是多个人
 */
function getDele2Users(uid){
	var rs = getUsers(uid, BFIELD_JJRY, "F0");
	var result = [];
	for(var i=0; i<rs.length; i++){
		var uu = rs[i][0];
		if(StringUtils.isEmpty(uu)){
			continue;
		}
		result.push(uu);
	}
	return result
}

/**
 * 获取交接或被交接的用户，
 * @param {} uid    某一次提交的交接的流水号
 * @param {} field  交接或者被交接用户对应的字段名
 * @param {} alias  采集任务中的表别名 
 * @return {}
 */
function getUsers(uid, field, alias){
	var dbTable = getDeleDBTable(alias);
	var sql = "select " + field + " from " + dbTable + " where uid=?";
	var ds = sz.db.getDefaultDataSource();
	var rs = ds.select(sql, [uid]);
	if(!rs || rs.length == 0 || rs[0].length==0){
		throw new Error("交接人员为空:“"+uid+"”");
	}
	return rs;
}

/**
 * 返回代理的数据库表
 */
function getDeleDBTable(alias){
	var citask = serviceAttachments.getCITask(CI_DEL_PATH);
	var formName = citask.getDefaultFormSet().getAllFormNames().get(0);
	if(alias){
		formName = formName + "_" + alias;
	}
	
	var factTablePath = citask.getDWTableInf(formName).getPath();
	var ft = sz.metadata.get(factTablePath).getObject();
	return ft.getDbTable();
}

/**
 * 全局代理
 */
function onTaskDelegate(flow, event, task, vars){
	var assignee = task.getAssignee();
	if(assignee == null){
		return null;   
	}
	return getAllDelegateUsers(assignee);
}

/**
 * TODO 目前未考虑 A->B; B->C的情况
 * @param {} assignee
 * @return {}
 */
function getAllDelegateUsers(assignee){
	var db1 = getDeleDBTable();
	var db2 = getDeleDBTable("F0");
	var sql = "select distinct " + FIELD_JJRY + "," + FIELD_BJJRY + " from "+db1+" t0 inner join "+db2+" t1 on t0.uid=t1.uid where "+FIELD_JJRY+"=?";
	var ds = sz.db.getDefaultDataSource();
	println(sql);
	var rs = ds.select(sql, [assignee]);
	if(!rs || rs.length == 0){
		return null;
	}
	
	var result = [];
	for(var i=0; i<rs.length; i++){
		var user = rs[i][1];
		result.push(user);
	}
	return result.join(",");
}