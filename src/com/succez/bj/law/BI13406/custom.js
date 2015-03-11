var BeanGetter = com.succez.commons.service.springmvcext.BeanGetterHolder.getBeanGetter();
var lockService = BeanGetter.getBean(com.succez.commons.service.impl.lock.LockServiceImpl);
var StringUtils = com.succez.commons.util.StringUtils;
var NumberUtils = com.succez.commons.util.NumberUtils;
var conflictTableResource = lockService.createResourceByPath("/SUCCEZBJHD/SZ_CUSTOM_CONFLICT");
var TIME_ONE_DAY = 86400000;

var FORM_FIELD_UID  = "uid";
var FORM_TABLE = "XDFKEHU_FM_CONT_LEGAL";
var FORM_FIELD_SHENG = "SHENG";
var FORM_FIELD_LX = "LX";
var FORM_FIELD_SEQ = "LEGAL_ID_";

function main(args){
	needUpdate("aa");
}

/**
 * BI-13406
 */
function aftersubmitdata(args){
	var datah = args["datahierarchies"];	
	var uid = getDetailIdValue(datah, FORM_FIELD_UID);
		
	var lockObj = lockService.createLock();
	lockObj.addReadLocks(conflictTableResource);
	lockObj.lock(TIME_ONE_DAY);
	try{
		if(needUpdate(uid)){
			var num = genSeqnum(uid);
			updateSeqnum(uid, num);
		}
	}finally{
		lockObj.unlock();
	}
}

function needUpdate(uid){
	var sql = "select %s from %s where %s = ?";
	var rSql = java.lang.String.format(sql, FORM_FIELD_SEQ, FORM_TABLE, FORM_FIELD_UID);
	println("needUpdate:"+rSql);
	var ds = sz.db.getDefaultDataSource();
	var s1 = ds.select1(rSql, [uid]);
	var isNull = StringUtils.isEmpty(s1); 
	println("needUpdate:"+isNull+";s1:"+s1);
	return isNull;
}

function getDetailIdValue(keys, idField){
	var arrs = StringUtils.parseEnumValue(keys);
	for(var i=0; i<arrs.length; i++){
		var id = arrs[i][0];
		if(StringUtils.equalsIgnoreCase(id, idField)){
			return arrs[i][1];
		}
	}
	return null;
}

/**
 * select sheng from db t1 where exists (select 1 from db2 t2 where t2.uid = ? and t2.sheng = t1.sheng) 
 * @type String
 */

var SQL_MAX_SEQ = "select %1$2s from %2$2s t1 where exists (select 1 from %2$2s t2 where t2.%3$1s=? and t2.%4$1s=t1.%4$1s)";

//=LX.concat('-',SHENG,'-',1000+seqnum('XDF'),'-',left(today(),6)) 

/**
 * 2-0010-1022-201503
 * 
 * @param {} dbTable    存储对应的数据库表
 * @param {} fieldSheng 省对应的字段
 * @param {} fieldSeq   生成新的seq并写入
 */
function genSeqnum(uid){
	var ds = sz.db.getDefaultDataSource();
	var dialect = ds.getDialect();
	var maxSeqField = dialect.renderFunction("max",dialect.renderFunction("right", dialect.renderFunction("left", FORM_FIELD_SEQ, 11), 4));
	
	var sql = java.lang.String.format(SQL_MAX_SEQ, maxSeqField, FORM_TABLE, FORM_FIELD_UID, FORM_FIELD_SHENG);
	println("genSeqnum:"+sql+";uid:"+uid);
	var maxSeq = ds.select1(sql, [uid]);
	
	if(!maxSeq){
		return "0001";
	}
	return tostr(NumberUtils.toInt(maxSeq)+1, "0000");
}

function updateSeqnum(uid, seq){
	var sql = "select %s, %s from %s where %s=?";
	var rSql = java.lang.String.format(sql, FORM_FIELD_LX,FORM_FIELD_SHENG, FORM_TABLE, FORM_FIELD_UID);
	var ds = sz.db.getDefaultDataSource();
	var rs = ds.select(rSql, [uid]);
	
	var lx = rs[0][0];
	var sheng = rs[0][1];
	var newSeq = lx+"-"+sheng+"-"+seq+"-"+tostr(today(),'yyyymm');
	
	var usql = java.lang.String.format("update %s set %s=? where %s=?", FORM_TABLE, FORM_FIELD_SEQ, FORM_FIELD_UID);
	ds.update(usql, [newSeq, uid]);
}