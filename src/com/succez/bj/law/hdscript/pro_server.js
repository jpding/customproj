/**
 * 根据人员、角色，返回人员对应部门中包含有roleName角色的人员
 * @param {} starter 流程启动者
 * @param {} roleName
 * @return {}
 *
 * 例如综合计划部的人员A送审了一个审批流程，要获取其室主任，就需要用到这个方法
 * 执行者过滤的表达式如下：${wiutil.call(execution,"getUserByStarter",starter,"室主任")}
 */
function getUserByStarter(starter, roleName) {        
	var user = sz.security.getUser(starter, true);
    print("送审人员："+user.name);
	var orgid = user.org.id;
	return getUserByRole(orgid, roleName);
}

/**
 * 返回部门中包含该角色的人员，如果有多个相同的角色的人员，返回找到的所有符合条件的人员。
 * 由于业务经办人员都是数据“室”下面一级的人员，找他们的部门领导，就需要跨过“室”这一级，所
 * 以需要进行循环遍历，遍历到HD01这个根节点为止
 * @param {} dptid
 * @param {} roleName
 * @return {}
 */
function getUserByRole(dptid, roleName) {
	var result = [];
	var parentOrgId = dptid;
	print("parentOrgId:"+parentOrgId);
        print("roleName"+roleName);
	while (result.length ==0 && parentOrgId && parentOrgId != "HD01"){
		var userlist = sz.security.listUsers(parentOrgId, false);
                print(userlist.length);
		for (var i = 0; i < userlist.length; i++) {
			var sib = userlist[i];
                        print(sib.id);
                        print(i);
			if (sib.isRole(roleName)) {
				result.push(sib.id);
			}
		}
		var pOrg = sz.security.getOrg(parentOrgId).parent;
		parentOrgId = pOrg ? pOrg.id : null; 
	}
	
	if (result.length > 0){
		return result.join(",");
	}else{
		throw new Error('找不到机构“' + dptid + "，请查看该部门下是否有用户设置了“"+roleName+"”角色!");
	}
}

/**
 * 任务分配给用户时将触发这个函数，可以通过返回值修改分配用户信息，返回值为空时将按照原分配人进行分配
 * @param flow 流程对象
 * @param event activiti事件对象
 * @param task actviti任务对象，可以从中获取当前任务assignee
 * @param vars 流程参数，可以获取当前TASKTYPE_字段信息
 * @return 返回被委托用户ID
*/
function onTaskAssigned(flow, event, task, vars){
	var assignee = task.getAssignee();
	if(assignee == null){
		return null;   
	}
	return getAllDelegateUsers(assignee);
}

var BeanGetter  = com.succez.commons.service.springmvcext.BeanGetterHolder.getBeanGetter();
var StringUtils = com.succez.commons.util.StringUtils;
var serviceAttachments = BeanGetter.getBean(com.succez.bi.ci.impl.mgr.CIServiceAttachmentsImpl);

/**
 * http://jira.succez.com/browse/BI-12787 
 * 工作交接
 */
var CI_DEL_PATH = "LAWCONT:/collections/sys_manager/taskAssign";

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
		if(StringUtils.isNotEmpty(user)){
			result.push(user);
		}
	}
	return result.join(",");
}

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
 * 生成合同流水号，系统内部函数，在用的时候需要注意：
 * 1、在采集表上需要定义一个“UID”主键，其值为=$id
 * 2、采集任务的基本配置中，需要设置“填报明细数据”，并设置"UID"为主键，那么该函数的返回值将作为“主键”的默认值。
 * 3、需要配置表单相应的工作流
 * @param {} repo
 * @param {} task
 * @param {} period
 * @param {} hierachy
 * @return {}
 */
function generateDetailGrainId(repo, task, period, hierachy) {
	var uid = java.util.UUID.randomUUID().toString();
	return com.succez.commons.util.StringUtils.replace(uid, "-", "");
}

//列出机构下所有的用户，例如传入'BC'，那么将会列出法务部所有人员
function listUsers(org){
	var userMgr = sz.security.getUserManager();
	var fullOrg = "security:/orgmgr/"+org;
	var orgUsers = userMgr.listUsers(fullOrg);
	if(orgUsers == null){
		return [];
	}
	var result = [];
	for(var i=0; i<orgUsers.size(); i++){
		var userBean = orgUsers.get(i);
		var user = {};
		
	}
	return result;
}
/**
*  在合同生效之后，更新合同状态为审批通过，审批通过的状态为30。
*  详细状态字段如下
*  10 起草；20 审批中；30 审批通过；40 已生效；50 解除中；60 项目取消
*  70 已解除；90 变更中；100 已归档；
*/
function update_state_to_30(uid,tableName){
	var ds = sz.db.getDefaultDataSource();
	print("update state_ "+tableName+" uid = "+uid);
	ds.update("update "+tableName+" set STATUS_ ='30' where UID=?", uid);
}

/**
* 在经办人提交申请的时候，如果提交给室主任，需要将室主任列出来，该函数的作用就是列出当前登录用户的室主任
* @param $flow 系统自动传入的值，工作流对象
* @param datas 工作流中的一些数据，也是系统自动传入的值
* 
* 如何使用呢？ 只需要在工作流中室主任审核节点，将该节点的编号改为“szrsh”。那么程序在自动调用这里的脚本函数
**/
function onAssigneeFilter_szrsh($flow,datas){
	print("onAssigneeFilter_szrsh");
	var userid = sz.security.getCurrentUser().id;
	var result = getUserByStarter(userid,"室主任").split(",");
	return result;
}


/**
* 在经办人提交申请的时候，如果提交给部门领导，需要将部门领导列出来，该函数的作用就是列出当前登录用户的部门领导
* @param $flow 系统自动传入的值，工作流对象
* @param datas 工作流中的一些数据，也是系统自动传入的值
* 
* 如何使用呢？ 只需要在工作流中部门领导审核节点，将该节点的编号改为“bmldsh”。那么程序在自动调用这里的脚本函数
**/
function onAssigneeFilter_bmldsh($flow,datas){
	print("onAssigneeFilter_bmldsh");
	var userid = sz.security.getCurrentUser().id;
	var result = getUserByStarter(userid,"部门领导").split(",");
	return result;
}

/**
* 在经办人提交申请的时候，如果提交给部长，需要将部长列出来，该函数的作用就是列出当前登录用户的部长
* @param $flow 系统自动传入的值，工作流对象
* @param datas 工作流中的一些数据，也是系统自动传入的值
* 
* 如何使用呢？ 只需要在工作流中部长审核节点，将该节点的编号改为“bzsh”。那么程序在自动调用这里的脚本函数
**/
function onAssigneeFilter_bzsh($flow,datas){
	print("onAssigneeFilter_bzsh");
	var userid = sz.security.getCurrentUser().id;
	var result = getUserByStarter(userid,"部长").split(",");
	return result;
}

var StringUtils = com.succez.commons.util.StringUtils;
var FilenameUtils    = com.succez.commons.util.FilenameUtils;

/**
 * 工作流全局事件，解决工作流，送审后的状态，以及审批完成后的设置，要注意所有的新工作流的开始
 * 和结束节点，都需要设置成下面的两个节点名称，结束节点只需要以“endevent”开头既可，因为结束节点
 * 可能不止一个。
 */
var NODE_START = "startevent1";
var NODE_END   = "endevent";

/**
 * 流程活动，包含节点，包含线条等，用于解决流程审批中、流程结束，修改事实表的相关字段
 */
function onActivityCompleted(flow, event,variables){
	/**
	 * 流程开始，更新合同状态
	 */
	var nodeId = event.getActivityId();
	var uid = variables.get("UID");
	println("wipath:"+flow.getPath()+"\tnodeid:"+nodeId+"\tuid:"+uid);
	var startForm = flow.getWIForm("STARTFORM", false);
	if(startForm == null){
		return ;
	}
	
	var formPath = startForm.getPath();
	println("formPath:"+formPath);
	/**
	 * LAWCONT:/collections/HD_PROJECT/HDBD_HTGL/LC_CONT_INFO/forms/default/HZ_CONT_INFO
	 * @type String
	 */
	var citaskpath = StringUtils.substringBefore(formPath, "/forms/default/");
	var dwTable =  FilenameUtils.getName(formPath);
	
	var ds = sz.db.getDefaultDataSource();
	
	//只处理开始和结束节点的事件，开始节点触发之后，有可能需要改变状态，例如变更申请之后，需要马上将合同状态修改为“变更中”，
	//而在审批完成之后，需要将合同状态改变为“生效中”
	if(StringUtils.equalsIgnoreCase(nodeId, NODE_START)){
		startBeforeModifyStatus(update, uid, dwTable, variables, nodeId);
		var update = sz.ci.getDataUpdater(citaskpath);
		update.set({UID:uid,dwtable:dwTable,field:"STATUS_",value:"20"});
		update.set({UID:uid,dwtable:dwTable,field:"ORG",value:variables.get("ORG")});
		update.commit();
	}else if(StringUtils.startsWith(nodeId, NODE_END)){
		var update = sz.ci.getDataUpdater(citaskpath);
		update.set({UID:uid,dwtable:dwTable,field:"STATUS_",value:"30"});
		update.set({UID:uid,dwtable:dwTable,field:"ORG",value:variables.get("ORG")});
		/**
		 * 和合同状态一起修改相关数据
		 */
		endModifingStatus(update, uid, dwTable, variables, nodeId);
		update.commit();
		
		/**
		 * 让个性化的流程实现定制功能
		 */
		endAfterModifyStatus(update, uid, dwTable, variables, nodeId);
	}
}

/**
 * 流程开始脚本
 */
function startBeforeModifyStatus(update, uid, dwTable, variables, nodeId){

}

/**
* 流程结束脚本
*/
function endModifingStatus(update, uid, dwTable, variables, nodeId){
	
}

/**
* 流程结束脚本
*/
function endAfterModifyStatus(update, uid, dwTable, variables, nodeId){
	
}