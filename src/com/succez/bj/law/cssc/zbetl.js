var ExpEngine = com.succez.commons.exp.ExpEngine;
var DefaultExpContext = com.succez.commons.exp.impl.DefaultExpContext;
var ExpVarObject   = com.succez.commons.exp.impl.ExpVarObject;
var ExpReturnTypes = com.succez.commons.exp.util.ExpReturnTypes;
var JdbcTemplate = org.springframework.jdbc.core.JdbcTemplate;
var StringUtils  = com.succez.commons.util.StringUtils;

/**
 * 函数表名
 * @type String
 */
var DS_NAME     = "SQCBNY";
var FUNC_TABLE  = "V_Function_ZBS";
var INPUT_TABLE = "FACT_SHUCAI_M";
var OUTPUT_TABLE = "ETL_ZBS_EXPZZ";
/**
 * ETL_TIME  BBQ  EXPZZ
 * @type String
 */
var LOG_TABLE = "";

/**
 * 如果是分时，参数为T，还要区分feng/ping/gu
 * @param {} args
 */
function main(args){
	//var curtime = args.lasttime;
	var curtime = args.curtime;
	//var curtime = '20141117';
	curtime = getLastTime(curtime);
	
	var rq = tostr(curtime, "yyyymm");
	startEtl(DS_NAME, rq);
	//testLoadData();
}

function startEtl(dsName, rq){
	clearTable();
	var fields = ["JLYB","NHL","ZBL", "JG"];
	
	var data = loadData(dsName, INPUT_TABLE, fields, {BBQ:rq});
	if(isNullData(data)){
		return ;
	}
	
	var result = calcExps(data);
	var resultFields = ["ETCode", "NHL","ZBL","JG"];
	saveData(dsName, OUTPUT_TABLE, resultFields, result);
}

function isNullData(data){
	if(data == null || data.length == 0){
		return true;
	}
	
	for(var i=0; i<data.length; i++){
		if(data[i]){
			return false;
		}
	}
	
	return true;
}


/**
 * 返回指定表的，指定字段的值的
 * @param dsName 连接池名
 * @param table 数据库表名  
 * @param fieldNames 字段列表，是一个数组
 * @param 条件  是一个json对象
 * 
 * @return 是一个二维数组的
 * 
 * 例如，读取
 * loadData("SQCBNY", "FACT_SHUCAI_XS", ["JLYB", "NHL", "NHLX"], {BBQ:"2014-11-17",XS:"13"})
 */
function loadData(dsName, table, fieldNames, where){
	var fieldName=fieldNames.join();   //将查询数值数值拼接成 逗号（,）相隔的字符串
	var ds = sz.db.getDataSource(dsName);		   //获取连接池
	var sql = "select "+fieldName+" from " +table;
	if(where){
		sql +=  " where " + where0(where);
	}
	return ds.select(sql);
}

function where0(where){    //将where中JSON格式数据，转变成String类型
	var result = [];
	for(var key in where){
		var str=key+" = '"+where[key]+"'";      //  将JSON格式数据，拼接成 符合查询条件的字符串形式
		result.push(str)
	}	
	return result.join(" and ");
}

function testLoadData(){
	var table="FACT_SHUCAI_XS";
	var fieldNames=["JLYB","NHL","NHLX","JG"];
	var dsName="SQCBNY";
	var where={BBQ:"2014-11-17",XS:"13"};
	var rs=loadData(dsName,table,fieldNames, where);
	
	for(var i=0; i<rs.length; i++){            //输出表数据
		var rrs=rs[i];
		for(var j=0;j<rrs.length;j++){
			print(rrs[j]);
			print("\t");
		}
		println();		
	}
}

/**

create table ETL_UNIT_EXPZZ(
	EUNIT varchar(100),
	NHLX  varchar(100),
	NHL   decimal(20,6)
)

 * @type 
 */

var JavaArray = java.lang.reflect.Array;
var Double    = java.lang.Double;

function clearTable(){
	var ds = sz.db.getDataSource(DS_NAME, true);
	ds.update("delete from "+OUTPUT_TABLE);
}

/**
 * 把data中的数据存储到相应的data中
 * @param {} dsName
 * @param {} table
 * @param {} fieldNames
 * @param {} data 二维数组
 */
function saveData(dsName, table, fieldNames, data){
	var ds = sz.db.getDataSource(dsName, true);
	
	var jdbcTpl = new JdbcTemplate(ds);
	var sql = "insert into " + table +"(" + fieldNames.join(",") + ")";
	var values = [];
	for(var i=0; i<fieldNames.length; i++){
		values.push("?");
	}
	sql += " values("+values.join(",")+")";
	var arrLen = fieldNames.length;
	var convertData = [];
	for(var i=0; i<data.length; i++){
		var obj = JavaArray.newInstance(java.lang.Object, arrLen);
		var row = data[i];
		for(var j=0; j<arrLen; j++){
			obj[j] = row[j];
		}
		convertData.push(obj);
	}
	
	jdbcTpl.batchUpdate(sql, convertData);
}

/**
 * 获取部门、能源介质、公式表
 * @param {} dsName
 * @param {} table
 * 返回的是一个二维数组，其格式如下：
 * [['区域','介质','公式'],...]
 */
function getCalcExps(){
	return loadData(DS_NAME, FUNC_TABLE, ["ETCode", "ETFun"]);
}


/**
 * 计算表达式
 * @param {} srcData
 * @return {}
 */
function calcExps(srcData){
	var expZzs = getCalcExps();
	var result = [];
	calcExps2(result, srcData, expZzs, null);
	return result;
}

function calcExps2(result, srcData, expZzs, constData){
	var paramNHL = {};
	var paramZBL = {};
	var paramJG  = {};
	
	for(var i=0; i<srcData.length; i++){
		if(!srcData[i]){
			continue;
		}
		var paramName = StringUtils.upperCase(StringUtils.trim(srcData[i][0])); 
		paramNHL[paramName] = srcData[i][1]; 
		paramZBL[paramName] = srcData[i][2];
		paramJG[paramName] = srcData[i][3];
	}
	var ctxNhl = createExpContext(paramNHL);
	var ctxZbl = createExpContext(paramZBL);
	var ctxJg  = createExpContext(paramJG);
	if(!result){
		result = [];
	}
	for(var i=0; i<expZzs.length; i++){
		if(!expZzs[i]){
			continue;
		}
		var ETCode  = expZzs[i][0];
		var expZz = expZzs[i][1];
		if(!expZz){
			continue;
		}
		var vNhl = sz_round(calcExp(expZz, ctxNhl));
		var vZbl = sz_round(calcExp(expZz, ctxZbl));
		var vJg = sz_round(calcExp(expZz, ctxJg));
		var row = [ETCode, vNhl, vZbl, vJg];
		if(constData){
			row.push(constData);
		}
		result.push(row);
	}
	return result;
}

function sz_round(vv){
	if(Double.isInfinite(vv)){
		return null;
	}else{
		return round(vv,6);
	}
}

function createExpContext(params){
	var context = new ExpContext(params);
	var oContext = new DefaultExpContext({getVar:function(name){
		return context.getVar(name);
	}});
	return oContext;
}

function calcExp(expZz, context){
	var exp = ExpEngine.createExpression(expZz);
	exp.compile(context);
	return exp.evaluateDouble(context);
}

/**
 * 2015-2-10 名称不需要大小写，全部转换为大写处理
 * @param {} params
 */
function ExpContext(params){
	this.params = params;
}

ExpContext.prototype.getVar = function(name){
	var d = this.params[StringUtils.upperCase(name)];
	if(d != null){
		return new ExpVarObject(name, ExpReturnTypes.FLOAT_TYPE, d);
	}else{
		/**
		 * 对于月的数据，很有可能找不到仪表的情况，这里统一当0处理，TODO 应该记录到日志里面
		 */
		return new ExpVarObject(name, ExpReturnTypes.FLOAT_TYPE, 0);
	}
	return null;
}

/**
 * 通过数据库的方法求上一小时，由于BI3.1.1的规则改变了，而表达式又不支持求上一小时，故采用数据库自己的函数求上一小时
 */
function getLastTime(curtime){
	var ds = sz.db.getDataSource(DS_NAME);
	return ds.select("select convert(varchar,dateadd(hh,-1,  ?),120)", [curtime])[0][0];
}

function testExp(){
	var params = {"a":12,"B":4,"C":5};
	var oContext = createExpContext(params);
	if(calcExp("(A+b)*c", oContext)!=80){
		throw new Error("表达式计算错误!");
	}
}

function getTestData(){
	
}