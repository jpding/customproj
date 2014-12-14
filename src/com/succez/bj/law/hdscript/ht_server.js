/**
 *  {form=STARTFORM, datas={"UID":"e4ca9a15d35549bfb17d0e9754cd2997","BID_NAME_":"AAAA","PRO_INTRO":"s324324","BID_WAY_ID":"01","CURR_ID":"CNY","BID_AMOUNT":123213234,"CONT_MAIN_TYPE":"","CONT_SUB_TYPE":"","AGENCY":"","INVITED_SUPPLY":"","QUALIFICATION_REQUIREMENTS":"","REMARK":"","ORG":"TEST","dim":"value"}, resid=6553629}
 */
var BeanGetterHolder = com.succez.commons.service.springmvcext.BeanGetterHolder;
var BeanGetter = BeanGetterHolder.getBeanGetter();
var WIFlowService = com.succez.bi.wi.WIFlowService;
var WIUtilStartInstance = com.succez.bi.wi.util.WIUtilStartInstance;
var WIWebUtilParams     = com.succez.bi.wi.util.web.WIWebUtilParams;
var ObjectMapper        = org.codehaus.jackson.map.ObjectMapper;
var CIUtilDataInsert = com.succez.bi.ci.util.CIUtilDataInsert;
var MetaRepository = com.succez.metadata.api.MetaRepository;
var CITask = com.succez.bi.ci.meta.CITask;
var ActionCIAddDataComponent = com.succez.bi.ci.impl.pages.cidatamgr.adddata.ActionCIAddDataComponent;

var NumberUtils = com.succez.commons.util.NumberUtils;
var StringUtils         = com.succez.commons.util.StringUtils;

function main(args){
	var params = {"form":"STARTFORM"};
	var flow = getWIFlow("LAWCONT:/workflows/法律业务系统/风险指标管理/RISKPOINT");
	var form = getWiForm(flow, params);
	println(form.name);
	println(form.caption);
	println(form.path);
	
	var result = listRisk();
	println(result);
	var mp = genRiskData(result[0]);
	println(mp);
	var user = sz.security.getUser(mp["createuser"]);
	var pid = "ORG="+user.org.id;
	println(pid);
	addData("LAWCONT:/collections/风险指标管理/RISKPOINT", pid, mp);
}

/**
 * 列出所有的风险点，根据时间来启动
 * 0 风险提出人:starter
 * 1 风险点解决人：合同承办人
 * 2 风险点名称：
 * 3 风险点内容：
 * 4 开始时间：
 * 5 结束时间：
 * 6 合同编号：
 * 
 * 提出人;承办人;风险点名称;风险点内容;开始日期;结束日期;合同编号
 */
function listRisk(){
	var rptpath = "LAWCONT:/collections/风险指标管理/RISK_LIST/reports/RISK_REPORT";
	var entity = sz.metadata.get(rptpath);
	var rpt = entity.getObject();
	var rptResult = rpt.calc({});
	var tableResult = rptResult.getComponent("table1");
	
	var result = [];
	for(var i=1; i<tableResult.getRowCount(); i++){
		var row = [];
		row.push(tableResult.getCell(i,6).value);
		row.push(tableResult.getCell(i,8).value);
		row.push(tableResult.getCell(i,2).value);
		row.push(tableResult.getCell(i,3).value);
		row.push(tableResult.getCell(i,4).value);
		row.push(tableResult.getCell(i,5).value);
		row.push(tableResult.getCell(i,7).value);
		result.push(row);
	}
				   
	return result;
}

/**
 * 根据风险集合表里面查询出来的数据，生成表单字段
 * @param {} risk
 * @return {}
 */
function genRiskData(risk){
	var obj = {};
	obj["uid"]          = generateDetailGrainId();
	obj["cont_uid"]     = risk[6];
	obj["risk_name"]    = risk[2];
	obj["risk_content"] = risk[3];
	obj["begindate"]    = risk[4];
	obj["enddate"]      = risk[5];
	obj["createuser"]   = risk[0];
	return obj;
}


function startWiFlow(wiPath, user, businessKey){
	var flow = getWIFlow(wiPath);
	var params = {"form":"STARTFORM"};
	
	startFlow(flow, user, params);
}

function getWIFlow(path){
	var flowService = BeanGetter.getBean(WIFlowService);
	var obj = sz.metadata.get(path);
	return flowService.getWIFlow(obj.id, true);
}

function startFlow(flow, user, params){
	var startInst = BeanGetter.getBean(WIUtilStartInstance);
	startInst.reset();
	startInst.setFlow(flow);
	startInst.setStarter(user);
	
	var form = getWiForm(flow, params);
	var datas = getTaskVariables(params);
	var businesskey =getBusinesskeyFormVariables(form, datas);
	startInst.setFlowForm(form);
	startInst.setBussinessKey(businesskey);
	startInst.setVariables(datas);
	startInst.start();
}

function getWiForm(flow, params){
	var webParams = BeanGetter.getBean(WIWebUtilParams);
	return webParams.getWIFlowStartFormInf(flow, params);
}

/**
 * 
 * @param {} wiFlowFormInf
 */
function getFormData(wiFlowFormInf){
	
}

function getTaskVariables(params){
	var datas = params.get("datas");
	if(datas == null){
		return {};
	}
	
	var mapper = new ObjectMapper();
	return mapper.readValue(datas, java.util.Map);
}

function getBusinesskeyFormVariables(form, datas){
	if(!form){
		return null;
	}
	var key = form.getKeyField();
	if(!key){
		return null;
	}
	return datas.get(key);
}


/**
 * 生成合同编号，同步合同履行数据
 * @param {} initiator
 * @return {}
 */
function test(uid, user){
	println("================================");
	println("uid\t"+uid);
	println("user\t"+user);
	updateHTBHId(user,uid);
	synData(uid, user);
	println("=================================");
}

function updateHTBHId(userid, uid){
	var cont_id = genHTBHId(userid);
	var ds = sz.db.getDefaultDataSource();
	ds.update("update LC_HZ_CONT_INFO set cont_id=? where \"UID\"=?", [cont_id, uid]);
}

function genHTBHId(userId){
	var prefix = genPrefixHTBH(userId);
	var num = tostr(genHTBHNum(userId)["num"], '0000');
	return prefix+num;
}

function genPrefixHTBH(userId){
	var user = sz.security.getUser(userId);
	var org = user.org;
	var deptId = right(org.id, 2);
	var prefix = "CSSC-"+deptId+"-"+tostr(today(),'yyyy')+"-";
	return prefix;
}

function genHTBHNum(userId){
	var prefix = genPrefixHTBH(userId);
	
	var ds = sz.db.getDefaultDataSource();
	var result = sz.db.getDefaultDataSource().select("select CONT_ID from LC_HZ_CONT_INFO where CONT_ID like '"+prefix+"%' order by CONT_ID desc");
	if(result == null||result.length==0){
		return {num:1}
	}
	var line = result[0];
	if(line == null||line.length == 0){
		return {num:1};
	}
	var max = line[0];
	max = max.substring(prefix.length+1, max.length);
	var num = com.succez.commons.util.NumberUtils.toInt(max, 0);
	return {num:num+1}
}

/**
 *  通过脚本自动添加数据
 */

function synData(uid, userId){
	var values = getPlanValues(uid);
	if(values == null || values.length ==0){
		println("===========================");
		println("获取不到数据,uid:"+uid+"user:"+userId);
		println("===========================");
	}
	var user = sz.security.getUser(userId);
	for(var i=0; i<values.length; i++){
		var mp = values[i];
		mp["UID"] = generateDetailGrainId();
		mp["CONT_UID"] = uid;
		mp["CREATEUSER"] = userId;
		addData("LAWCONT:/collections/合同管理/LC_CONT_CRIT", "ORG="+user.org.id, mp);
		println("加入数据：uid:"+mp["UID"]+";CONT_ID:"+uid+";user:"+userId);
	}
}

function getPlanValues(uid){
	var ds = sz.db.getDefaultDataSource();
	var result = ds.select1("select PAY_MODEM_ID from LC_HZ_CONT_INFO where \"UID\"=?", [uid])
	/**
	 * 1:一次性；  2:分期
	 */
	println("付款方式："+result);
	if(result == '1'){
		return getOneTimeValues(uid);
	}else{
		return getMoreTimeValues(uid);
	}
}

/**
 * 获取一期的值，返回的是一个数组
 */
function getOneTimeValues(uid){
	var ds = sz.db.getDefaultDataSource();
	var query1 = ds.select("select per_begin_date, per_end_date, cont_zj from LC_HZ_CONT_INFO where \"UID\"=?", [uid])
	
	var result = [];
	var values = {};
	values['PAY_CLAUSE'] = '一次性';
	values['BEGIN_DATE'] = query1[0][0];
	values['END_DATE']   = query1[0][1];
	values['JSFHTK']     = (query1[0][2] == null ? 0 : NumberUtils.toDouble(query1[0][2],0));
	values['PERFORM_DESC'] =  "一次性付款";
	
	result.push(values);
	return result;
}

/**
 * 获取多期的值，返回的是一个数组
 */
function getMoreTimeValues(uid){
	var ds = sz.db.getDefaultDataSource();
	var query1 = ds.select("select fxproj, sjq, sjz, fkje, fkzb, fkyj, kxnr from LC_LC_CONT_INFO_F2 where \"UID\"=?", [uid])
	if(query1 == null || query1.length == 0){
		return [];
	}
	
	var result = [];
	for(var i=0; i<query1.length; i++){
		var values = {};
		if(query1[i] == null)
			continue;
		values['PAY_CLAUSE'] = query1[i][0];
		values['BEGIN_DATE'] = query1[i][1];
		values['END_DATE']   = query1[i][2];
		values['JSFHTK']     = (query1[i][3] == null ? 0 : NumberUtils.toDouble(query1[i][3],0));
		values['PERFORM_DESC'] =  query1[i][6];
		result.push(values);
	}
	return result;
}

function addData(resid, pid, values){
	var repo = BeanGetter.getBean(MetaRepository);
	var citask = repo.getMetaEntity(resid,true).getBusinessObject(CITask);
	var dataInsert = BeanGetter.getBean(CIUtilDataInsert);
	dataInsert.insertDetailData(citask, null, null, pid, values);
}
