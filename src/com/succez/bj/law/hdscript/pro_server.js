/**
 * 根据人员、角色，返回人员对应部门中包含有roleName角色的人员
 * @param {} starter
 * @param {} roleName
 * @return {}
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
 * 以需要进行循环遍历
 * @param {} dptid
 * @param {} roleName
 * @return {}
 */
function getUserByRole(dptid, roleName) {
	var result = [];
	var parentOrgId = dptid;
	print("parentOrgId:"+parentOrgId);
	while (result.length ==0 && parentOrgId && parentOrgId != "HD01"){
		var userlist = sz.security.listUsers(parentOrgId, false);
		for (var i = 0; i < userlist.length; i++) {
			var sib = userlist[i];
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
 * 1:合同;2:案件;3:所有
 * @param flow 流程对象
 * @param event activiti事件对象
 * @param task actviti任务对象，可以从中获取当前任务assignee
 * @param vars 流程参数，可以获取当前TASKTYPE_字段信息
 * @return 返回被委托用户ID
*/
function onTaskAssigned(flow, event, task, vars){
	
}

/**
 * 生成合同流水号
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

/**
* 根据维表代码查询某个特定的属性的值
* @params dimpath 维表路径
* @params code 维代码
* @params property 维属性名称
* @return 返回维属性值
*/
function dim(dimpath, code, property){
	var beangetter = com.succez.commons.service.springmvcext.BeanGetterHolder.getBeanGetter();
	var repo = beangetter.getBean(com.succez.metadata.api.MetaRepository);
	var entity = repo.getMetaEntity(dimpath);
	var dim = entity.getBusinessObject(com.succez.bi.dw.DimensionTable);
	var treeitem = dim.getTreeItem(code).getField(property);
	return treeitem;
};

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
*  在合同生效之后，更新合同状态为审批通过
*/
function update_state_to_30(uid,tableName){
	var ds = sz.db.getDefaultDataSource();
	print("update state_ "+tableName+" uid = "+uid);
	ds.update("update "+tableName+" set STATUS_ ='30' where UID=?", uid);
}

function onAssigneeFilter_szrsh($flow,datas){
	print("onAssigneeFilter_szrsh");
	var userid = sz.security.getCurrentUser().id;
	var result = getUserByStarter(userid,"室主任").split(",");
	print(result);
	return result;
}

function onAssigneeFilter_bmldsh($flow,datas){
	print("onAssigneeFilter_bmldsh");
	var userid = sz.security.getCurrentUser().id;
	var result = getUserByStarter(userid,"部门领导").split(",");
	print(result);
	return result;
}