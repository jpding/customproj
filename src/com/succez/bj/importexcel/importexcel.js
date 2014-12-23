var FileInputStream = java.io.FileInputStream;
var InputStream = java.io.InputStream;

var HSSFCell = org.apache.poi.hssf.usermodel.HSSFCell;
var HSSFDateUtil = org.apache.poi.hssf.usermodel.HSSFDateUtil;
var HSSFRow = org.apache.poi.hssf.usermodel.HSSFRow;
var HSSFSheet = org.apache.poi.hssf.usermodel.HSSFSheet;
var HSSFWorkbook = org.apache.poi.hssf.usermodel.HSSFWorkbook;
var XSSFWorkbook = org.apache.poi.xssf.usermodel.XSSFWorkbook;
var WorkbookFactory = org.apache.poi.ss.usermodel.WorkbookFactory;
var POIFSFileSystem = org.apache.poi.poifs.filesystem.POIFSFileSystem;
var NumberUtils = com.succez.commons.util.NumberUtils;
var StringUtils = com.succez.commons.util.StringUtils;
var Pattern = java.util.regex.Pattern;
var DocumentHelper = org.dom4j.DocumentHelper;
var DWTableUtil  = com.succez.bi.dw.impl.DWTableUtil;
var CellNameUtil = com.succez.commons.util.CellNameUtil;
var FilenameUtils = com.succez.commons.util.FilenameUtils;

function main(args){
	//testLoadConfig("ZCSWSJ:/others/importexcel/config/data.xml");
	//var config = loadExcelConfig("ZCSWSJ:/others/importexcel/config");
	var config = loadExcelConfig("ZCSWSJ:/others/importexcel/config/hkqkmxb.xml");
	testCheckTableData("ZCSWSJ:/others/importexcel/xls/回款情况明细表.xlsx", config);
	//var data = testImportData("ZCSWSJ:/others/importexcel/xls/test.xlsx", config);
	//println(data)
	//var data = testImportData("ZCSWSJ:/others/importexcel/xls/hr.xlsx", config);
	//var data = testImportData("ZCSWSJ:/others/importexcel/xls/1.3_人力资源部_部门项目结算单(内部).xlsx", config);
	//var data = testImportData("ZCSWSJ:/others/importexcel/xls/6.1_看板模板(财务).xlsx", config);
	//writeAllTable(data);
}

function importXls(req, res){
	var configPath = req.configpath;
	var ecxelFile = req.getFile("excelfile");
	if(!ecxelFile){
		res.attr("msg","请选择文件");
		res.attr("config",configPath);
		return "导入界面/excelImport.ftl";
	}
	var file = req.getFile("excelfile").file;
	var bbq = req.bbq;//getDataPeriodValue(file);
	println("filename:"+file.getName()+";bbq="+bbq);
	var config = loadExcelConfig(configPath);
	var data = readExcelDataByFile(file, config);
	
	/**
	 * 验证数据
	 */
	var errLog = new java.lang.StringBuilder(50);
	checkExcelAllData(data, errLog);
	if(errLog.length() > 0){
		res.attr("msg", errLog.toString());
		return "excelImport.ftl";
	}
	
	/**
	 * 处理数据期，如果数据期是通过文件传递过来的，在读取文件后，把数据期的值，赋值给每个sheet
	 */
	for(var i=0; i<data.length; i++){
		var sheetData = data[i];
		sheetData.bbq = bbq;
	}
	
	var log = new java.lang.StringBuilder(50);
	writeAllTable(data, log);
	res.attr("msg", log.toString());
	return "excelImport.ftl";
}

/**
 * 为了便于管理方便，一个Excel Sheet对应一个配置文件，可以指定装入某个元数据目录下的所有文件
 * 文件名要和Sheet名一致
 */
function loadExcelConfig(path){
	var excelConfig = {};
	var folderEntity = sz.metadata.get(path);
	
	var type = folderEntity.type;
	var files ;
	if(type == "folder"){
		files = folderEntity.listChildren(false);
	}else{
		files = [];
		files.push(folderEntity);
	}
	
	println("读取配置文件："+path);
	for(var i=0; i<files.length; i++){
		var entity = files[i];
		var content = entity.content;
		var caption = entity.caption;
		println("开始读取配置文件：config="+caption);
		var config = loadSheetConfig(content, caption);
		excelConfig[caption] = config;
	}
	return excelConfig;
}

/**
 * 20101004.xls
 * 一般导入的时间都是通过文件名获取
 */
function getDataPeriodValue(file){
	var name = FilenameUtils.getBaseName(file.getName());
	return name;
}

/**
 * 在导入之前备份表里面的数据，避免用户误操作，导致数据丢失
 */
function backupDataBeforeImport(){
}

/**
 * this.fieldObjs = params.fieldObjs;
 * this.startRow = params.startRow;
 * this.primarykey = params.primarykey;
 * this.endRow   = -1;
 * this.tablePath = params.table;
 * <?xml version="1.0" encoding="UTF-8"?>
<import>
	<properties>
		<table>datasource:/default/SAMPLE/ACT_GE_BYTEARRAY</table>
		<startrow>3</startrow>
		<primarykey>A;B</primarykey>
		<!--数据类型，是固定表(fix)，还是浮动表(float)，默认是浮动表-->
		<datatype>float</datatype>
		
		<!--
			验证数据合法性字段，在这里指定一个字段，然后在checkTable中的checkTableField中进行验证
		-->
		<checkFieldName></checkFieldName>
		<checkTable></checkTable>
		<checkTableField></checkTableField>
	</properties>
	<fields>
		<field col="C" dbfiled="A" type=""></field>
		<field col="D" dbfiled="B" type="N"></field>
		<field col="E" dbfiled="C" type=""></field>
		<field col="F" dbfiled="D" type=""></field>
	</fields>
</import>
 */
function loadSheetConfig(text, configName){
	var params = {};
	println("开始解析XML:"+configName);
	var dom = DocumentHelper.parseText(text);
	var rootElem = dom.getRootElement();
	var fieldElem = rootElem.element("fields");
	var fieldObjs = [];
	var elems = fieldElem.elements("field");
	for(var i=0; i<elems.size(); i++){
		var node = elems.get(i);
		var field = {};
		field["col"] = node.attributeValue("col");
		field["dbfield"]  = node.attributeValue("dbfield");
		field["type"] = node.attributeValue("type");
		var validate = node.attributeValue("validate");
		if(field["dbfield"] == null){
			throw new Error("configName:"+configName+";col:"+field["col"]+"; field is null");
		}
		println("col:"+field["col"]+";dbfield:"+field["dbfield"]+";type="+field["type"]);
		field["matcher"] = null;
		if(validate != null && validate.length > 0){
			field["matcher"] = Pattern.compile(validate); 
		}
		
		field["index"] = i;
		fieldObjs.push(field);
	}
	
	params.fieldObjs = fieldObjs;
	
	var pptElem = rootElem.element("properties");
	params.startRow = pptElem.elementText("startrow");
	params.primarykey = pptElem.elementText("primarykey");
	params.tablePath = pptElem.elementText("table");
	params.bbqfield = StringUtils.trimToEmpty(pptElem.elementText("bbqfield"));
	params.datatype  = StringUtils.defaultIfEmpty(pptElem.elementText("datatype"), "float");
	
	params.checkFieldName = StringUtils.trimToEmpty(pptElem.elementText("checkFieldName"));
	params.checkTable = StringUtils.trimToEmpty(pptElem.elementText("checkTable"));
	params.checkTableField = StringUtils.trimToEmpty(pptElem.elementText("checkTableField"));
	
	println("xml解析完成");
	
	return new SheetConfig(params);
}

function writeAllTable(data, log){
	for(var i=0, len=data.length; i<len; i++){
		var tableData = data[i];
		var config = tableData.config;
		var table = config.getTable();
		println("开始写入数据Table："+table);
		var sourceName = config.getDataSource();
		var ds = sz.db.getDataSource(sourceName,true);
		writeTable(ds, tableData, config);
		log.append("Table:").append(table).append(";").append("导入数据行数:").append(tableData.value.length).append("\r\n");
		println("数据导入完成Table："+table);
	}
}

/**
 * @param {} ds
 * @param {} tableData  {bbq:"",value:[],config:sheetConfig}
 * @param {} sheetConfig
 */
function writeTable(ds, tableData, sheetConfig){
	var table = sheetConfig.getTable();
	var upd = ds.createTableUpdater(sheetConfig.getTable(), "");
	var values = tableData.value;
	var bbq = tableData.bbq;
	var fieldObjs = sheetConfig.getFieldObjsExcludePK();
	var fieldPkObjs = sheetConfig.getPrimaryFieldObjs();;
	var bbqfield = sheetConfig.getBBQField();
	var commited = true;
	for(var i=0; i<values.length; i++){
		var row = values[i];
		println("写入数据：table="+table+";rowData:"+row);
		var pks = {};
		for(var k=0; k<fieldPkObjs.length; k++){
			var field = fieldPkObjs[k];
			pks[field.dbfield] = row[field.index];
			println("pkfield:"+field.dbfield);
		}
		/**
		 * 处理导入数据期问题，Object.create
		 */
		if(bbqfield){
			pks[bbqfield] = bbq;
		}
		
		for(var j=0; j<fieldObjs.length; j++){
			var field = fieldObjs[j];
			//println("updatefield:"+field.dbfield);
			upd.set(field.dbfield, row[field.index], pks);
		}
		
		/**
		 * 默认是每50条一提交，如果是单条提交，效率很低，但有可能批量提交的数据会出错，这样不便于查错。如果要查错，
		 * 可以修改为每条一提交，只需要把下面的50修改为1即可。
		 */
		
		if(i % 50 == 0){
			try{
				upd.commit();
				commited = true;
			}catch(ex){
				println("****错误数据*****："+row);
				var exstr = com.succez.commons.util.ExceptionUtils.exception2str(ex.javaException,row.join(","));
				throw new java.lang.Exception(exstr);
			}
		}else{
			commited = false;
		}
	}
	
	if(!commited){
		upd.commit();
	}
}

function getMetaEntity(path){
	var beanGetter = com.succez.commons.service.springmvcext.BeanGetterHolder.getBeanGetter();
	var metaRepo = beanGetter.getBean(com.succez.metadata.api.MetaRepository);
	return metaRepo.getMetaEntity(path, true);
}

function testCheckTableData(path, config){
	var entity = getMetaEntity(path);
	var ins = entity.readContent().asInputStream();
	try{
		var data = readExcelDataByInputStream(ins, config);
		checkExcelAllData(data);
	}finally{
		ins.close();
	}
}

function testImportData(path, config){
	var entity = getMetaEntity(path);
	var ins = entity.readContent().asInputStream();
	try{
		var data = readExcelDataByInputStream(ins, config);
		for(var i=0; i<data.length; i++){
			var vv = data[i].value;
			println("打印数据:"+data[i].name);
			println(vv);
		}
		return data;
	}finally{
		ins.close();
	}
}

function testLoadConfig(path){
	var obj = sz.metadata.get(path);
	var content = obj.content;
	var sheetConfig = loadSheetConfig(content, obj.caption);
	
	println(sheetConfig.getStartRow()==3);
	println(sheetConfig.getFieldObjs().length==4);
	println(sheetConfig.getPrimaryFieldObjs().length==2);
	println(sheetConfig.getFieldObjsExcludePK().length==2);
	println(sheetConfig.getDataSource()=="default");
	println(sheetConfig.getTable()=="A");

	println(sheetConfig.getCheckTable()=="datasource:/default/dbo/B");
	println(sheetConfig.getCheckFieldNameIndex()==2);
	println(sheetConfig.getCheckTableField()=="XM");
}

/**
 * 检查验证数据合法性，把不合法的数据返回，只需要关键字对应的数据即可
 */
function checkExcelAllData(data, errorLog){
	for(var i=0, len=data.length; i<len; i++){
		var tableData = data[i];
		var config = tableData.config;
		if(config.getCheckFieldNameIndex() == -1){
			continue;
		}
		
		var table = config.getTable();
		println("开始验证Table："+table+"的数据");
		var rows = tableData.value;
		var errorData = checkSheetData(rows, config);
		if(errorData.length > 0){
			errorLog.append("Table:").append(table).append(";").append("错误数据编号:").append(errorData.join(";")).append("\r\n");
		}
		println("验证完成Table："+table);
	}
}

function checkSheetData(dataRows, config){
	var fieldIndex = config.getCheckFieldNameIndex();
	var pks = loadCheckTable(config);
	var errorData = [];
	for(var i=0; i<dataRows.length; i++){
		var row = dataRows[i];
		var vv = row[fieldIndex]; 
		if(!pks[vv]){
			errorData.push(vv);
		}
	}
	return errorData;
}

function loadCheckTable(config){
	var checkTable      = config.getCheckTable();
	var checkTableField = config.getCheckTableField();
	
	var datasource = DWTableUtil.getDWTableDataSource(checkTable);
	var dbTable = DWTableUtil.getDWTableName(checkTable);
	
	var ds = sz.db.getDataSource(datasource,true);
	var sql = "select distinct " + checkTableField + " from " + dbTable;
	var rs = ds.select(sql,[]);
	var pks = {};
	for(var i=0; i<rs.length; i++){
		pks[rs[i][0]]=1;
	}
	return pks;
}

function readExcelDataByFile(file, excelConfig){
	var ins = new FileInputStream(file);
	try{
		return readExcelDataByInputStream(ins, excelConfig);
	}finally{
		ins.close();
	}
}

/**
 * 返回该Excel所有sheet的数据，其返回对象格式为  [{name:"sheetName",config:xxx, value:[]},{}...] 
 * @param {} file
 * @return {}
 */
function readExcelDataByInputStream(ins, excelConfig){
	var wb = WorkbookFactory.create(ins);
	var datas = [];
	for(var i=0, len=wb.getNumberOfSheets(); i<len; i++){
		var sheet = wb.getSheetAt(i);
		var sheetName = wb.getSheetName(i);
		println("read data sheetIndex:"+i+";sheetName:"+sheetName);
		
		var sheetConfig = getSheetConfig(sheetName, excelConfig);
		if(sheetConfig==null){
			println("not found sheetConfig :"+sheetName);
			continue;
			//throw new Error("not found sheetConfig:");
		}
		
		var datatype = sheetConfig.datatype
		var sheetData ;
		if(datatype == "float"){
			sheetData = readExcelSheetByRow(sheet, sheetName, i, sheetConfig);
		}else if(datatype == "fix"){
			sheetData = readExcelSheetByCell(sheet, sheetName, i, sheetConfig);
		}else{
			throw new Error("配置文件：sheetConfig:"+sheetName+" datatype配置错误，应该为float或者fix");
		}
		 
		if(sheetData == null){
			continue;
		}
		datas.push(sheetData);
	}
	return datas;
}

/**
 * 按行的方式来读取Excel内容，相当月采集中的变长表
 * @param {} sheet
 * @param {} sheetName
 * @param {} sheetIndex
 * @param {} excelConfig
 * @return {}
 */
function readExcelSheetByRow(sheet, sheetName, sheetIndex, sheetConfig){
	/**
	 * {name:"sheetName",value:[]}
	 * @type 
	 */
	var data = {};
	data.name = sheetName;
	data.config = sheetConfig;
	var values = [];
	
	var fieldObjs = sheetConfig.getFieldObjs();
	var endRow = sheetConfig.getEndRow();
	if(endRow == -1 || !endRow){
		endRow = sheet.getLastRowNum()+5;
	}
	println("endRow:"+endRow);
	for(var i=sheetConfig.getStartRow(), rowNum = endRow; i<rowNum; i++){
		var row = sheet.getRow(i);
		if(row == null)
			continue;
		var rowData = [];
		for(var j=0; j<fieldObjs.length; j++){
			var field = fieldObjs[j];
			//println("field:"+field.col);
			var colIndex = CellNameUtil.getCellRowColByName(field.col+"1")%10000;
			//println("colIndex:"+colIndex);
			var cell = row.getCell(colIndex);
			if(cell == null){
				rowData.push(null);
				continue;
			}
				
			var cellData =  readExcelCellValue(cell, sheetName);
			var matcher = field["matcher"];
			if(matcher != null){
				var md = matcher.matcher(cellData).matches();
				if(!md){
					println("no match: sheet:"+sheetName+" row:+"+(i+1)+";col:"+field["col"]);
					rowData == null;
					break;
				}
			}
			
			//处理带%号的数字例如  9%，导入时应该是0.09
			if(field.type=="N" && StringUtils.endsWith(cellData,"%")){
				cellData = NumberUtils.toDouble(StringUtils.ensureNotEndWith(cellData, '%'))*0.01;
			}
			
			rowData.push(cellData);
		}
		
		if(isNullRow(rowData)){
			println("rowIndex:"+(i+1)+";rowData:ISNULL");
			continue;
		}
		println("rowIndex:"+i+";rowData:"+rowData);	
		values.push(rowData);
	}
	data.value = values;
	return data;
}

/**
 * 根据Cell表元名来读取字段内容，相当于采集中固定表
 * @param {} sheet
 * @param {} sheetName
 * @param {} sheetIndex
 * @param {} excelConfig
 */
function readExcelSheetByCell(sheet, sheetName, sheetIndex, sheetConfig){
	/**
	 * {name:"sheetName",value:[]}
	 * @type 
	 */
	var data = {};
	data.name = sheetName;
	data.config = sheetConfig;
	var values = [];
	var rowData = [];
	var fieldObjs = sheetConfig.getFieldObjs();
	for(var i=0; i<fieldObjs.length; i++){
		var field = fieldObjs[i];
		var cellName = field["col"];
		var rowcol = getCellRowColByName(cellName);
		var rowIndex = rowcol[0];
		var colIndex = rowcol[1];	
		
		println("cellName:"+cellName+";row="+rowIndex+";col="+colIndex);
		var row = sheet.getRow(rowIndex);
		var cell = row.getCell(colIndex);
		if(cell == null){
			rowData.push(null);
			continue;
		}
		var cellData = readExcelCellValue(cell, sheetName);
		
		//处理带%号的数字例如  9%，导入时应该是0.09
		if(field.type=="N" && StringUtils.endsWith(cellData,"%")){
			cellData = NumberUtils.toDouble(StringUtils.ensureNotEndWith(cellData, '%'))/100.0;
		}
		
		rowData.push(cellData)
	}
	values.push(rowData);
	data.value = values;
	return data;
}

function readExcelCellValue(cell, sheetName){
	var cellType = cell.getCellType();
	switch(cellType){
		case HSSFCell.CELL_TYPE_BLANK:
				return null;
		case HSSFCell.CELL_TYPE_BOOLEAN:
			return java.lang.String.valueOf(cell.getBooleanCellValue());
		case HSSFCell.CELL_TYPE_FORMULA:
			//return cell.getStringCellValue(); //getCellFormula();
			return null;
		case HSSFCell.CELL_TYPE_NUMERIC: {
			//_formatter.formatCellValue(cell)
			var value = cell.getNumericCellValue();
			/**
			 * 避免把整数读成小数
			 */
			var intValue = Math.round(value);
			if (value == intValue) {
				return StringUtils.int2Str(intValue);
			}
			return value;
		}
		case HSSFCell.CELL_TYPE_STRING:
			return cell.getStringCellValue();
		case HSSFCell.CELL_TYPE_ERROR:
			var errorInfo = "sheet:"+sheetName+"row:"+cell.getRow().getRowNum()+";"+"col:"+col;
			throw new Error(errorInfo+org.apache.poi.ss.formula.eval.ErrorEval.getText(cell.getErrorCellValue()));
			break;
		default:
			var errorInfo = "sheet:"+sheetName+"row:"+cell.getRow().getRowNum()+";"+"col:"+col;
			throw new Error(errorInfo+"Unexpected cell type (" + cell.getCellType() + ")");
	}
	return null;
}

/**
 * 判断是否是空行，所设置的行列是否有合同表元，如果有合并表元，也不需要导入
 * @param {} row
 * @param {} sheetConfig
 * @return {Boolean}
 */
function isNullRow(cellsData){
	for(var i=0; cellsData != null && i<cellsData.length; i++){
		if(cellsData[i] != null)
			return false;
	}
	return true;
}

function getSheetConfig(sheetName, excelConfig){
	return excelConfig[sheetName];
}

/**
   字段  loadSheetConfig 的注释
 * @param {} params
 */
function SheetConfig(params){
	println("配置对象初始化："+params);
	this.params = params;
	this.fieldObjs = this.params.fieldObjs;
	this.startRow = this.params.startRow;
	this.datatype = this.params.datatype;
	
	/**
	 * 增加验证字段，便于导入数据的时候，筛选出不合法的数据
	 * @type 
	 */
	this.checkFieldName = this.params.checkFieldName;
	this.checkFieldNameIndex = -1; //为-1表示没有验证字段
	this.checkTable = this.params.checkTable;
	this.checkTableField = this.params.checkTableField;
	
	
	this.endRow   = -1;
	if(this.params.endRow){
		this.endRow = this.params.endRow;
	}
	this.bbqfield = this.params.bbqfield;
	this.tablePath = this.params.tablePath;
	this.datasource = DWTableUtil.getDWTableDataSource(this.tablePath);
	this.table = DWTableUtil.getDWTableName(this.tablePath);

	this._initFieldObjsPks();
	println("====="+this.tablePath);	
	this._initFieldObjsExcludePK();
	
	/**
	 * 找出验证字段序号
	 */
	this._initCheckFieldNameIndex();
	println("配置对象初始化完成!");
};

/**
 * 找出验证字段的序号
 */
SheetConfig.prototype._initCheckFieldNameIndex = function(){
	if(!this.checkFieldName){
		return ;
	}
	var fieldObjs = this.getFieldObjs();
	for(var i=0; i<fieldObjs.length; i++){
		var field = fieldObjs[i];
		var dbfield = field.dbfield;
		
		if(StringUtils.equalsIgnoreCase(dbfield, this.checkFieldName)){
			this.checkFieldNameIndex = i;
			break;
		}
	}
	
	if(this.checkFieldNameIndex == -1){
		throw new Error("验证字段配置错误："+this.tablePath+"中，不存在验证字段："+this.checkFieldName);
	}
}

SheetConfig.prototype._initFieldObjsPks = function(){
	var pk = this.params.primarykey;
	println("pk:"+pk);
	var fieldNames = StringUtils.split(pk,";");
	println("pklen:"+fieldNames.length);
	var fieldObjsPKs = [];
	for(var i=0; i<fieldNames.length; i++){
		var fieldObj = [];
		var name = fieldNames[i];
		println("fieldName:"+name);
		for(var j=0; j<this.fieldObjs.length; j++){
			var tmpField = this.fieldObjs[j];
			println("tmpField:"+tmpField.dbfield+";name:"+name);
			if(StringUtils.equalsIgnoreCase(name, tmpField.dbfield)){
				fieldObjsPKs.push(tmpField);
				break;
			}
		}
	}
	this.fieldObjsPk = fieldObjsPKs;
}

SheetConfig.prototype._initFieldObjsExcludePK = function(){
	var exPks = [];
	for(var i=0; i<this.fieldObjs.length; i++){
		var field = this.fieldObjs[i];
		if(this.fieldObjsPk.indexOf(field)<0){
			exPks.push(field);
		}
	}
	this.fieldObjsExPK = exPks;
}

/**
 * 返回一个字段列表，index是记录该字段对应的序号，便于存储到数据库中时，根据序号从row中取值
 * [{col:"A",dbfield:"",type:"",index:0},{}]
 */
SheetConfig.prototype.getFieldObjs = function(){
	return this.fieldObjs;
}

/**
 * 返回验证字段的序号，验证字段要从XML配置文件中读取
 */
SheetConfig.prototype.getCheckFieldNameIndex = function(){
	return this.checkFieldNameIndex;
}

/**
 * 返回验证表的PATH，导入数据时其他的数据的主键要和该表的checkTableField进行比较，列出不在该表的数据
 * @return {}
 */
SheetConfig.prototype.getCheckTable = function(){
	return this.checkTable;
}

/**
 * 返回CheckTable验证表的验证字段
 * @return {}
 */
SheetConfig.prototype.getCheckTableField = function(){
	return this.checkTableField;
}

SheetConfig.prototype.getFieldObjsExcludePK = function(){
	return this.fieldObjsExPK;
}

/**
 * 返回主键列，可以是多列
 */
SheetConfig.prototype.getPrimaryFieldObjs = function(){
	return this.fieldObjsPk;
}

SheetConfig.prototype.getStartRow = function(){
	return this.startRow;
}

/**
 * 结束行，可以手工指定，也可以不指定，程序自动判断
 * @return {}
 */
SheetConfig.prototype.getEndRow = function(){
	return this.endRow;
}

SheetConfig.prototype.getTable = function(){
	return this.table;
}

SheetConfig.prototype.getDataSource = function(){
	return this.datasource;
}

/**
 * 如果bbqField有值，那么就需要导入数据期，反之则不需要导入
 * @return {}
 */
SheetConfig.prototype.getBBQField = function(){
	return this.bbqfield;
}

function getCellRowColByName(name) {
	var numIndex = 0;
	var col = -1;
	var len = name.length;
	
	var c = name.charCodeAt(numIndex++);
	var A = "A".charCodeAt(0);
	var Z = "Z".charCodeAt(0);
	var a = 'a'.charCodeAt(0);
	var z = 'z'.charCodeAt(0);
	while (((c >=A  && c <= Z) || (c >=a  && c <= z)) && numIndex < len) {
		col = (col + 1) * 26 + (c >= a ? c - a : c - A); // 兼容大小写，一般情况下表元名中的字母都是大写
		c = name.charCodeAt(numIndex++);
	}
	var row = numIndex - 1 < len ? parseInt(name.substring(numIndex - 1, name.length)) - 1 : -1;
	return [row, col];
}