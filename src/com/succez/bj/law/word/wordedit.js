var BeanGetter = com.succez.commons.service.springmvcext.BeanGetterHolder.getBeanGetter();

var serviceAttachments = BeanGetter.getBean(com.succez.bi.ci.impl.mgr.CIServiceAttachmentsImpl);
var dataPackageUtil = BeanGetter.getBean(com.succez.bi.ci.impl.mgr.datapackage.DataPackageUtil);

var mgr = BeanGetter.getBean(com.succez.commons.jdbc.ConnectionFactoryManager);
var sf  = BeanGetter.getBean(com.succez.commons.jdbc.sql.SQLFactory);

var WebUtils = com.succez.commons.util.WebUtils;
var StringUtils = com.succez.commons.util.StringUtils;
var IOUtils   = com.succez.commons.util.io.IOUtils;
var FileUtils = com.succez.commons.util.io.FileUtils;
var CIMetaConsts = com.succez.bi.ci.meta.CIMetaConsts;
var MyByteArrayOutputStream = com.succez.commons.util.io.MyByteArrayOutputStream;
var MyByteArrayInputStream  = com.succez.commons.util.io.MyByteArrayInputStream;

var URLDecoder = java.net.URLDecoder;
var Document = com.aspose.words.Document;
var ProtectionType = com.aspose.words.ProtectionType;
var NumberUtils    = com.succez.commons.util.NumberUtils;
var ActionUtils = com.succez.commons.webctrls.domain.ActionUtils;
var repo = BeanGetter.getBean(com.succez.metadata.api.MetaRepository);
var tempFileService = BeanGetter.getBean(com.succez.commons.service.io.TempFileService);
var jsonMapper = new org.codehaus.jackson.map.ObjectMapper();

var HttpServletResponse = javax.servlet.http.HttpServletResponse;
var FileOutputStream    = java.io.FileOutputStream;
var FileInputStream    = java.io.FileInputStream;

com.succez.bi.activedoc.impl.aspose.AsposeUtil.licence();

/**
 * word操作Action，主要支持如下功能：
 * 1.保存word
 * 2.word强制留痕
 * 3.word只读
 * 
 * 显示方式：IE下用插件显示、非IE下直接使用html
 * 
 * 1.主要是打开事实表中的word，必须传递如下参数：
 *    facttable 事实表名
 *    keyfield  主键名
 *    keys      主键的值
 *    wordfield word存储的字段
 *    wordname  word文件名     可以不用传递 
 *    
 * /meta/LAWCONT/others/test/word/wordedit.action?method=open&facttable=27262991&keyfield=UID&keys=23141f39c6a44efb81aaae0e276bb1a2&wordfield=ATTACHMENT1
 * 
 * 表单中word文档，在线打开时，word权限控制   
 * 1. 流程中的word，都需要留痕打开
   2. 其他时候都是只读打开
   3. 合同打印的时候，判断该合同是否审批完成，接受所有修订
   4. 合同起草时
	  1. 范本合同，只能修改  窗体域
	  2. 自由合同，全面能修改
 */

function main(args){
//	var obj = {facttable:"27262991",keyfield:"UID",keys:"23141f39c6a44efb81aaae0e276bb1a2",wordfield:"ATTACHMENT1"};
//	//var obj = {facttable:"27262991",keyfield:"UID",keys:"CSSC",wordfield:"ATTACHMENT1"};
//	var ins = getWordInputStream(obj);
//	println(ins);
	testGetCIField();
}

/**
 * 默认是只读打开word
 * @param {} req
 * @param {} res
 */
function execute(req, res){
	res.attr("downloadtype",ProtectionType.READ_ONLY);
	return "wordedit.ftl";
}

function testGetCIField(){
	var task = serviceAttachments.getCITask("18907146");
	println(getCITableFieldValue(task, "LC_CONTRACTINFO", "20141114", "ORG=CSSC&UID=CSSC", "status_"));
}
/**
 * /meta/LAWCONT/others/test/word/wordedit.action?method=open&facttable=xxx&keyfield=xxx&keys=xxx&wordfield=xxxx
 * /meta/LAWCONT/others/test/word/wordedit.action?method=open&facttable=27262991&keyfield=UID&keys=CSSC&wordfield=ATTACHMENT1
 * 普通方式打开
 * @param {} req
 * @param {} res
function open(req, res){
	res.attr("downloadtype","-1");
	return "wordedit.ftl";
}
 */

/**
 * word文档存储
 * @param {} req
 * @param {} res
 */
function save(req, res){
}

/**
 * /meta/LAWCONT/others/test/word/wordedit.action?method=downloadword&facttable=xxx&keyfield=xxx&keys=xxx&wordfield=xxxx
 * /meta/LAWCONT/others/test/word/wordedit.action?method=downloadword&facttable=27262991&keyfield=UID&keys=23141f39c6a44efb81aaae0e276bb1a2&wordfield=ATTACHMENT1
 * 
 * UID=
 * 		ProtectionType.ALLOW_ONLY_COMMENTS;
		ProtectionType.ALLOW_ONLY_FORM_FIELDS;
		ProtectionType.ALLOW_ONLY_REVISIONS;
		ProtectionType.READ_ONLY;
		ProtectionType.NO_PROTECTION;
 * @param {} req
 * @param {} res
 */
function downloadword(req, res){
	println("=================================");
	
	var params = getDownloadParam(req);
	var ins = getWordInputStream(params);
	
	try{
		
		com.succez.commons.webctrls.domain.ActionUtils.setHeaderForDownload(res, req.getHeader("USER-AGENT"), "application/msword",
				"utf-8", null, "word.doc");
		
		var input = java.io.BufferedInputStream(ins);
		var out = res.getOutputStream();
		try {
			var downloadtype = NumberUtils.toInt((params.downloadtype+""), ProtectionType.READ_ONLY);
			println("downloadtype==========:"+downloadtype);
			if(downloadtype == -1){
				IOUtils.copy(input, out);
			}else{
				var doc = new Document(input);
				if(downloadtype == ProtectionType.ALLOW_ONLY_REVISIONS){
					doc.setTrackRevisions(true);
				}
				doc.protect(downloadtype);
				//1 doc  8 docx
				doc.save(out,1);
			}
		}
		finally {
			out.close();
		}
	}finally{
		ins.close();
	}
}

/**
 * 
 * @param {} ins  word输入流
 * @param {} res
 */
function writeWord(input, res, downloadtype){
	var out = res.getOutputStream();
	try {
		//var downloadtype = NumberUtils.toInt((params.downloadtype+""), -1);
		println("downloadtype==========:"+downloadtype);
		if(downloadtype == -1){
			IOUtils.copy(input, out);
		}else{
			var doc = new Document(input);
			if(downloadtype == ProtectionType.ALLOW_ONLY_REVISIONS){
				doc.setTrackRevisions(true);
			}
			doc.protect(downloadtype);
			//1 doc  8 docx
			doc.save(out,1);
		}
	}
	finally {
		out.close();
	}
}



/**
 * 点击保存时，保存先前打开的word文件
 */
function uploadWord(req, res){
	var params = getDownloadParam(req);
	var wordfile = null;
	var files = req.getFiles();
	for(var i=0; i<files.length; i++){
		wordfile = files[i];
	}
	if(wordfile == null){
		throw new Error("获取不到word文件，wordfile为空!");
	}
	var file = wordfile.file;
	if(file == null){
		throw new Error("获取不到word文件，上传文件为空!");
	}
	/**
	 * 防止客户端随意存储word，这里先屏蔽掉，表单中的word存储，会走其他接口
	 */
	//saveWordToDb(params, file);
}

function getDownloadParam(req){
	var obj = {};
	obj.facttable = req.facttable;
	obj.keyfield = req.keyfield;
	obj.keys = req.keys;
	obj.wordfield = req.wordfield;
	obj.wordname = req.wordname;
	obj.downloadtype = req.downloadtype;
	return obj;
}

/**
 * 获取事实表中的word流
 * @param {} factTable  事实表全路径
 * @param {} keyfield
 * @param {} keys
 * @param {} wordField
 * @param {} wordName
 */
function getWordInputStream(args){
	var factTable = args.facttable;
	var keyfield = args.keyfield;
	var keys = args.keys;
	var wordField = args.wordfield;
	var wordName = args.wordname;
	var entity =getMetaEntity(args);
	var factObj = entity.getObject();
	var dsName = factObj.getDataSourceName();
	var ds = sz.db.getDataSource(dsName);
	
	var dbTableName = factObj.getDbTable();
	println("事实表："+factTable+";数据库表："+dbTableName);
	
	//验证字段TODO
	var dialect = ds.getDialect();
	
	var sql = "select "+wordField+" from "+dbTableName+" where " + dialect.quote(keyfield) +"=?";
	var rs = ds.select(sql, keys);
	println(sql);
	if(!rs || rs.length == 0 ){
		throw new Error('事实表：'+factTable+"中不存在主键："+keyfield+"："+keys+"的数据");
	}
	
	var blob = rs[0][0];
	return blob.getBinaryStream();	
}

function getMetaEntity(args){
	var factTable = args.facttable;
	var entity = sz.metadata.get(factTable);
	if(entity == null){
		throw new Error('元数据中不存在事实表：'+factTable);
	}
	return entity;
}

/**
 * 把文件存储到数据库
 * @param {} args  url链接上的相关参数
 * @param {} file  插件保存时,上传到服务器端的临时文件
 */
function saveWordToDb(args, file){
	var entity = getMetaEntity(args);
	var factObj = entity.getObject();
	var dsName = factObj.getDataSourceName();
	var dbTableName = factObj.getDbTable();
	
	var ds = sz.db.getDataSource(dsName);
	var dialect = ds.getDialect();
	var updateSql = "update " + dbTableName + " set  "+args.wordfield+"=? where " + dialect.quote(args.keyfield) +"=?";
	println(updateSql);
	var ins = file.getInputStream();
	try{
		ds.update(updateSql,[ins, args.keys]);
	}finally{
		ins.close();
	}
}

/**
 * 下载表单中的word文档
 * 1.表单编辑状态
 *   a.未保存编辑 
 *   b.保存后，在编辑
 * 2.审批状态中
 * 3.打印
 * 
 * TODO 在留痕打开时，要设置当前word的操作人，这样便于是哪个用户留的痕迹，在保存的时候，要判断word的操作人
 * 是否和当前登录用户一致，避免用户在客户端直接修改当前的word的操作用户
 * @param {} req
 * @param {} res
 */
function downloadFormWord(req, res){
	var id = req.id;
	var resid = req.path;
	var datahierarchies = req.datahierarchies;
	var dataperiod = req.dataperiod;
	var rowKey = req.rowKey;
	var dwTable = req.dwTable;
	var fileContentField = req.fileContentField;
	var fileNameField    = req.fileNameField;
	var citask = serviceAttachments.getCITask(resid);
	println("=========downloadFormWord==="+id+";resid:"+resid);
	
	if(StringUtils.isNotBlank(id)){
		downloadDraftAttachment(req, res, citask, id);
	}else{
		datahierarchies = URLDecoder.decode(datahierarchies, "utf-8");
		var myOut = new MyByteArrayOutputStream();
		serviceAttachments.downloadAttachment(myOut, citask, dataperiod, datahierarchies, rowKey,
					dwTable, fileContentField, fileNameField);
		var bins = new MyByteArrayInputStream(myOut.getBuf());
		/**
		 * 下载已经存储到表单数据库中的文档：
		 * 1.该表单已经提交审批了， 留痕打开
		 * 2.未提交审批，要区分自由合同和范本合同
		 *   a.自由合同，不限制编辑
		 *   b.范本合同，只能编辑窗体域
		 * TODO  
		 */
		var downloadType = ProtectionType.READ_ONLY;
		var state = getAuditState(task, dwTable, dataperiod, datahierarchies);
		if(state == "saved"){
			downloadType = -1;
		}else if(StringUtils.startsWith(state, "submit")){
			downloadType = ProtectionType.ALLOW_ONLY_REVISIONS;
		}
		writeWord(bins, res, downloadType);			
	}
}

/**
 * 把word附件中的内容存储到草稿库中，主要用于用户选择范本时，要往范本里面记录一个标识信息，便于
 * 以后用户编辑时，设置word的状态
 * 
 * TODO
 * 自动生成合同文本，把表单里面的项，自动插入到文本中
 */
function saveDraft(req, res){
	var resid = req.path;
	var dataperiod = req.dataperiod;
	var datahierarchies = req.datahierarchies;
	var formset = req.formset;
	var rowKey   = req.rowKey;
	var formName = req.formName;
	var compid   = req.compid;
	var id       = req.id;
	println("====saveDraft:resid="+resid+";datahierarchies="+datahierarchies);
	
	var ciattachmentstr = req.ciattachment;
	var ciattachment = jsonMapper.readValue(ciattachmentstr, java.util.Map);
	
	var srctaskid = ciattachment["taskid"];
	var srcdatahierarchies = ciattachment["datahierarchies"];
	var srcdataperiod = ciattachment["dataperiod"];
	var srcrowKey = ciattachment["rowKey"];
	var srcfileContentField = ciattachment["fileContentField"];
	var srcfileNameField = ciattachment["fileNameField"];
	var srcdwtable = ciattachment["dwTable"];

	var citask = serviceAttachments.getCITask(srctaskid);
	var file = tempFileService.createTempFile(null);
	try {
		var srcAttachment = null;
		var out = new FileOutputStream(file);
		try {
			srcAttachment = serviceAttachments.getAttachment(citask, srcdataperiod, srcdatahierarchies, srcrowKey, srcdwtable,
					srcfileContentField, srcfileNameField, out);
		}
		finally {
			out.close();
		}
		var filename = srcAttachment.getFilename();
		var size = srcAttachment.getSize();
		var contentType = srcAttachment.getContentType();
		
		/**
		 * 插入范本标识
		 */
		wordAddTemplateSign(file);
		
		var ins = new FileInputStream(file);
		try {
			return serviceAttachments.saveAttachment(resid, formset, dataperiod, datahierarchies, rowKey, formName, compid, false,
					filename, size, ins, contentType, id);
		}
		finally {
			ins.close();
		}
	}
	finally {
		FileUtils.remove(file);
	}
}

/**
 * 加入范本标识，并返回一个输入流
 */
function wordAddTemplateSign(file){
	var doc = new Document(file);
	doc.getVariables().add(PROP_TEMPLATE, "1");
	doc.save(file);
}

/**
 * 在word修改时要对
 */
function backUpWord(){
}

/**
 * 在审批过程中，要对word文档进行修改，这时数据会直接写入数据库对应的表单库，而不是写入到草稿库中
 * 1.在写入时，要注意文件的安全性
 */
function saveWordInForm(req, res){
}

/**
 * 下载草稿中的文档，要区分是用户上传的文档，还是通过范本起草的文档
 * @param {} req
 * @param {} res
 * @param {} citask
 * @param {} id
 */
function downloadDraftAttachment(req, res, task, id){
	var draft = dataPackageUtil.getDWTable(task, CIMetaConsts.SYS_PREFIX + CIMetaConsts.TABLE_CI_DRAFT_ATTACHMENTS);
	var ds = draft.getDataSourceName();
	var cf = mgr.get(ds);

	var query = getDraftAttachmentInfQuery(id, draft);

	var querySql = query.getQuerySql();
	var sqlstr = sf.getSql(querySql, cf.getDbMetaData());
	var rs = null;
	var conn = null;
	var ps = null;
	var input = null;
	try {
		conn = cf.getConnection();
		ps = conn.prepareStatement(sqlstr);
		rs = ps.executeQuery();
		if (!rs.next()) {
			res.sendError(HttpServletResponse.SC_NOT_FOUND);
			return;
		}
		input = rs.getBinaryStream(CIMetaConsts.SYS_PREFIX + CIMetaConsts.FIELD_ATTACHMENT);
		/**
		 * 如果是范本合同  ProtectionType.ALLOW_ONLY_FORM_FIELDS，那么以窗体只读的方式打开
		 */
		var downloadType = -1;
		
		var doc = new Document(input);
		if(isTemplateContract(doc)){
			downloadType = ProtectionType.ALLOW_ONLY_FORM_FIELDS;
		}
		println("=======downloadType=="+downloadType);
		doc.protect(downloadType);
		var out = res.getOutputStream();
		try{
			//1 doc  8 docx
			doc.save(out,1);
		}finally{
			out.close();
		}
	}
	finally {
		IOUtils.closeQuietly(input);
		com.succez.commons.jdbc.impl.JdbcUtils.closeQuietly(conn, ps, rs);
	}
}

/**
 * 判断某一表单是否处于审核中，一段进入审核了，那么word打开，只能已修订模式打开，判断方式：
 * 1.可以通过表单里面的字段state_来判断
 * 2.可以通过工作流表直接查询，审批状态
 * 目前直接通过表单里面的字段查询出
 * saved     保存未提交
 * submited  提交审批
 * 
 */
function getAuditState(task, dwTable, dataperiod, datahierarchies){
	return getCITableFieldValue(task, dwTable, dataperiod, datahierarchies, "status_");
}

var Arrays = java.util.Arrays;

/**
 * 返回存储到库中的CI某一个字段的值
 * @param {} task
 * @param {} dwTable
 * @param {} dataperiod
 * @param {} datahierarchies
 * @param {} fieldName
 * @return {String}
 */
function getCITableFieldValue(task, dwTable, dataperiod, datahierarchies, fieldName){
	var model = dataPackageUtil.getAggregateTable(task, dwTable, datahierarchies);
	if (model == null) {
		return "";
	}
	var field = model.getField(fieldName);
	if (field == null) {
		throw new Error("事实表：" + dwTable + "中字段：" + fieldName + "不存在!");
	}
	var dsName = model.getDataSourceName();
	var sql = dataPackageUtil.createQuery(task, dwTable, Arrays.asList(fieldName),Arrays.asList(dataperiod),
			Arrays.asList(datahierarchies), "");
	var ds = sz.db.getDataSource(dsName, true);
	var rs = ds.select(sql, []);
	if(rs && rs.length > 0){
		var row = rs[0];							 
		return row[row.length-1];
	}
	return "";
}

var PROP_TEMPLATE = "succezdoctemplate";

/**
 * 判断是否是范本合同，直接从文档流里面读出，在插入到临时表时，就记录上一个特殊的标记
 */
function isTemplateContract(doc){
	var tpl = doc.getVariables().get(PROP_TEMPLATE);
	println("=========tpl======="+tpl);
	return tpl == "1";
}

function getDraftAttachmentInfQuery(id, draft) {
	var query = BeanGetter.getBean(com.succez.bi.dw.dwdata.DWTableQuery2);
	query.setDWTable(draft);
	query.addQueryField(CIMetaConsts.SYS_PREFIX + CIMetaConsts.FIELD_DATAPERIOD);
	query.addQueryField(CIMetaConsts.SYS_PREFIX + CIMetaConsts.FIELD_DATAHIERARCHIES);
	query.addQueryField(CIMetaConsts.SYS_PREFIX + CIMetaConsts.FIELD_FORMNAME);
	query.addQueryField(CIMetaConsts.SYS_PREFIX + CIMetaConsts.FIELD_COMPONENTNAME);
	query.addQueryField(CIMetaConsts.SYS_PREFIX + CIMetaConsts.FIELD_ROWKEY);
	query.addQueryField(CIMetaConsts.SYS_PREFIX + CIMetaConsts.FIELD_FILENAME);
	query.addQueryField(CIMetaConsts.SYS_PREFIX + CIMetaConsts.FIELD_CONTENTTYPE);
	query.addQueryField(CIMetaConsts.SYS_PREFIX + CIMetaConsts.FIELD_SUBMITDATE);
	query.addQueryField(CIMetaConsts.SYS_PREFIX + CIMetaConsts.FIELD_ATTACHMENT);
	query.addFieldFilter(CIMetaConsts.SYS_PREFIX + CIMetaConsts.FIELD_ATTACHEMENT_ID, "='" + id + "'");
	return query;
}