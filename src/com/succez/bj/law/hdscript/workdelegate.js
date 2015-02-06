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
}

function delegate(uid){
	
}

/**
 * 返回交接人员
 */
function getDele(uid){
	var rs = getUsers(uid, FIELD_JJRY);
	var jjry = rs[0][0];
	if(StringUtils.isEmpty(jjry)){
		throw new Error("交接人员为空:“"+uid+"”");
	}
	return jjry;
}

/**
 * 返回被交接人员，有可能是多个人
 */
function getDele2Users(uid){
	var rs = getUsers(uid, FIELD_JJRY, "F0");
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

function getAllDelegateUsers(assignee){
	var db1 = getDeleDBTable();
	var db2 = getDeleDBTable("F0");
	var sql = "select distinct " + FIELD_JJRY + "," + FIELD_BJJRY + " from "+db1+" t0 inner join "+db2+" t1 on t0.uid=t1.uid where "+FIELD_JJRY+"=?";
	var ds = sz.db.getDefaultDataSource();
	println(sql);
	var rs = ds.select(sql, [assignee]);
	return rs;
}