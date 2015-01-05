var BeanGetter = com.succez.commons.service.springmvcext.BeanGetterHolder.getBeanGetter();

var serviceAttachments = BeanGetter.getBean(com.succez.bi.ci.impl.mgr.CIServiceAttachmentsImpl);
var dataPackageUtil    = BeanGetter.getBean(com.succez.bi.ci.impl.mgr.datapackage.DataPackageUtil);
var scmgr = BeanGetter.getBean(com.succez.bi.ci.mgr.CIServiceCacheMgr);

var mgr = BeanGetter.getBean(com.succez.commons.jdbc.ConnectionFactoryManager);
var sf  = BeanGetter.getBean(com.succez.commons.jdbc.sql.SQLFactory);

var WebUtils = com.succez.commons.util.WebUtils;
var StringUtils = com.succez.commons.util.StringUtils;
var IOUtils   = com.succez.commons.util.io.IOUtils;
var FileUtils = com.succez.commons.util.io.FileUtils;
var ContentTypeUtils = com.succez.commons.util.ContentTypeUtils;
var CIMetaConsts = com.succez.bi.ci.meta.CIMetaConsts;
var MyByteArrayOutputStream = com.succez.commons.util.io.MyByteArrayOutputStream;
var MyByteArrayInputStream  = com.succez.commons.util.io.MyByteArrayInputStream;

var URLDecoder = java.net.URLDecoder;
var NumberUtils    = com.succez.commons.util.NumberUtils;
var StringEscapeUtils = com.succez.commons.util.StringEscapeUtils;
var ActionUtils = com.succez.commons.webctrls.domain.ActionUtils;
var repo = BeanGetter.getBean(com.succez.metadata.api.MetaRepository);
var tempFileService = BeanGetter.getBean(com.succez.commons.service.io.TempFileService);
var jsonMapper = new org.codehaus.jackson.map.ObjectMapper();

var HttpServletResponse = javax.servlet.http.HttpServletResponse;
var FileOutputStream    = java.io.FileOutputStream;
var FileInputStream    = java.io.FileInputStream;
var StringReader = java.io.StringReader;

var Document = com.aspose.words.Document;
var ProtectionType = com.aspose.words.ProtectionType;
var DocumentBuilder = com.aspose.words.DocumentBuilder;
var HeaderFooter = com.aspose.words.HeaderFooter;
var HeaderFooterType = com.aspose.words.HeaderFooterType;
var HorizontalAlignment = com.aspose.words.HorizontalAlignment;
var Paragraph = com.aspose.words.Paragraph;
var RelativeHorizontalPosition = com.aspose.words.RelativeHorizontalPosition;
var RelativeVerticalPosition = com.aspose.words.RelativeVerticalPosition;
var Section = com.aspose.words.Section;
var SectionCollection = com.aspose.words.SectionCollection;
var Shape = com.aspose.words.Shape;
var ShapeType = com.aspose.words.ShapeType;
var VerticalAlignment = com.aspose.words.VerticalAlignment;
var WrapType = com.aspose.words.WrapType;
var SaveFormat = com.aspose.words.SaveFormat;

var FunctionNames = com.succez.commons.jdbc.function.FunctionNames;

var ISDEBUG = true;

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
 * 打开word文档，默认是只读打开，其url示例如下：
 * /meta/LAWCONT/others/test/word/wordedit.action?facttable=xxx&keyfield=xxx&keys=xxx&wordfield=xxxx
 * @param {} req  req传递的参数见上面
 * @param {} res
 * @mapping
 */
function execute(req, res){
	res.attr("downloadtype",ProtectionType.READ_ONLY);
	if(req.namespace){
		res.attr("namespace",req.namespace);
	}
	/**
	 * 插件只能在IE下打开，假如安装了chromeframe，那么应该在这里忽略谷歌插件
	 */
	res.attr("ignoreChromeFrame", "true");
	return "wordedit.ftl";
}

/**
 * 
 * @param {} req
 * @param {} res
 */
function show(req, res){
	
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
 * @mapping
 */
function downloadword(req, res){
	println("download:"+req.getRequestURI());
	var params = getDownloadParam(req);
	var ins = getWordInputStream(params);
	var input = java.io.BufferedInputStream(ins);
	try{
		
		com.succez.commons.webctrls.domain.ActionUtils.setHeaderForDownload(res, req.getHeader("USER-AGENT"), "application/msword",
				"utf-8", null, "word.doc");
		
		var downloadtype = NumberUtils.toInt((params.downloadtype+""), ProtectionType.READ_ONLY);
		if(req.print=="1"){
			log("printword", params);
			printWord(input, res);
		}else{
			log("downloadword", params);
			writeWord(input, res, downloadtype, params.version == "Word.Application.11");
		}
	}finally{
		input.close();
	}
}

/**
 * 生成合同文本，返回对应的合同附件信息
 * @param {} req
 * @param {} res
 */
function makecontract(req, res){
	println("download:"+req.getRequestURI());
	var id = req.id;
	var resid = req.path;
	var datahierarchies = req.datahierarchies;
	var dataperiod = req.dataperiod;
	var rowKey = req.rowKey;
	var dwTable = req.dwTable;
	var fileContentField = req.fileContentField;
	var fileNameField    = req.fileNameField;
	var citask = serviceAttachments.getCITask(resid);
	println("=========makecontract==="+id+";resid:"+resid);
	if(ISDEBUG){
		log("makecontract", {"cipath":resid,"dwTable":dwTable,"fileNameField":fileNameField, "datahierarchies":datahierarchies});
	}
	
	if(datahierarchies){
		datahierarchies = URLDecoder.decode(datahierarchies, "utf-8");
	}
	
	var input = null;
	/**
	 * 从草稿或者表单内容中获取相应的word文档流
	 */
	var attachmentObj = {};
	if(StringUtils.isNotBlank(id)){
		input = getContractInputStreamByDraft(citask,id, attachmentObj);
	}else{
		var myOut = new MyByteArrayOutputStream();
//		serviceAttachments.downloadAttachment(myOut, citask, dataperiod, datahierarchies, rowKey,
//					dwTable, fileContentField, fileNameField);
		var attachmentInf = serviceAttachments.getAttachment(citask, dataperiod,datahierarchies, rowKey,
			dwTable, fileContentField, fileNameField, myOut);
		attachmentObj["name"] = attachmentInf.getFilename();	
		input = myOut.asInputStream();
	}
	
	try{
		var doc = new Document(input);
		var formDataStr = req.formdatas;
		if(ISDEBUG){
			println("formDataStr:"+formDataStr);
		}
		var formData = jsonMapper.readValue(formDataStr, java.util.Map);
		makeTemplateContract(doc, formData);
		var myOutput = new MyByteArrayOutputStream();
		doc.save(myOutput, SaveFormat.DOCX);
		var filename = attachmentObj["name"];
		var size = myOutput.size();
		var contentType = "application/msword";
		var inputStream = myOutput.asInputStream();
		try {
			println("filename:"+filename);
			var attachment = serviceAttachments.saveDraft(citask, id, dataperiod, datahierarchies, rowKey,
					req.formName, req.compName, filename, contentType, size, inputStream, false);
			return getAttachmentInfo(attachment);
		}
		finally {
			inputStream.close();
		}
	}finally{
		IOUtils.closeQuietly(input);
	}
}

/**
 * 打印word
 */
function printWord(input, res, is2003){
	var out = res.getOutputStream();
	try{
		var doc = new Document(input);
		var imgIn = getWaterMarkerImg();
		try{
			insertIntoWatermark(doc, imgIn);
			doc.acceptAllRevisions();
			doc.protect(ProtectionType.READ_ONLY);
			//1 doc  8 docx
			doc.save(out,is2003 ? SaveFormat.DOC:SaveFormat.DOCX);
		}finally{
			imgIn.close();
		}
	}finally{
		out.close();
	}
}

/**
 * 返回水印图片，其规则是从水印表里面，根据当前用户获取相应的图片
 */
function getWaterMarkerImg(){
	var params = {};
	params["facttable"] = "LAWCONT:/collections/HD_PROJECT/HDBD_HTGL/sygl/models/forms/SYGL";
	params["keyfield"] = "CREATEUSER";
	params["keys"] = 'wangyg';
	params["wordfield"] = "ATTACHMENT1";
	return getWordInputStream(params);
}

/**
 * 见writeWord2函数
 * @param {} input
 * @param {} res
 * @param {} downloadtype
 * @param {} is2003 word版本，是否为2003
 */
function writeWord(input, res, downloadtype, is2003){
	var out = res.getOutputStream();
	try {
		writeWordByInputStream(input, out, downloadtype, is2003);
	}
	finally {
		out.close();
	}
}

/**
 * word插件向服务器端请求内容时，都通过该函数下载，
 * @param {} input  word输入流
 * @param {} out    输出流，一般都是通过res.getOutputStream()获取
 * @param {} downloadtype
 */
function writeWordByInputStream(input, out, downloadtype, is2003){
	//var downloadtype = NumberUtils.toInt((params.downloadtype+""), -1);
	println("downloadtype==========:"+downloadtype);
	//downloadtype = -1;
//	if(downloadtype == -1){
//		IOUtils.copy(input, out);
//	}else{
		var doc = new Document(input);
		writeWordByDoc(doc, out, downloadtype, is2003);
//	}
}

function writeWordByDoc(doc, out, downloadtype, is2003){
	/**
	 * 对下载的word打验证标记
	 */
	//doc.getVariables().add(PROP_CHECKVALID, "1");
	
	if(downloadtype == ProtectionType.ALLOW_ONLY_REVISIONS){
		doc.setTrackRevisions(true);
	}
	doc.protect(downloadtype);
	/**
	 * 2003的格式，有可能在2010下打开有问题，故目前都设置成2007的格式，不在保存成2003的格式
	 */
	//1 doc  8 docx
	doc.save(out,is2003 ? SaveFormat.DOC:SaveFormat.DOCX);
}


/**
 * 点击保存时，保存先前打开的word文件
 */
function uploadWord(req, res){
	var params = getDownloadParam(req);
	var wordfile = getUploadFile(req);
	/**
	 * 防止客户端随意存储word，这里先屏蔽掉，表单中的word存储，会走其他接口
	 */
	log("uploadWord", params);
	//saveWordToDb(params, file);
}

/**
 * 从req获取上传文件，一般只有一个文件，是一个map对象
 * {fileName:"", file:file} 其中fileName是经过编码的，需要解码，file是sz.io.FileObject对象
 * @param {} req
 */
function getUploadFile(req){
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
	
	return wordfile;
}

function getDownloadParam(req){
	var obj = {};
	obj.facttable = req.facttable;
	obj.keyfield = req.keyfield;
	obj.keys = req.keys;
	obj.wordfield = req.wordfield;
	obj.wordname = req.wordname;
	obj.downloadtype = req.downloadtype;
	obj.version = req.version;
	return obj;
}

/**
 * 获取事实表中的word流
 * @param {} facttable  事实表全路径
 * @param {} keyfield
 * @param {} keys
 * @param {} wordfield
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
		var info = '事实表：'+factTable+"中不存在主键："+keyfield+"："+keys+"的数据"; 
		throw new Error(info);
	}
	
	var blob = rs[0][0];
	if(blob == null){
		var info = '事实表：'+factTable+"中不存在主键："+keyfield+"："+keys+"的数据"; 
		throw new Error(info);
	}
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
 * @param {} args  url链接上的相关参数  {facttable:xx1,wordfield:xx2,keyfield:xx3,keys:xy}
 * @param {} file  插件保存时,上传到服务器端的临时文件
 */
function saveWordToDb(args, file){
	log("saveWordToDb", args);
	var entity = getMetaEntity(args);
	var factObj = entity.getObject();
	var dsName = factObj.getDataSourceName();
	var dbTableName = factObj.getDbTable();
	
	var ds = sz.db.getDataSource(dsName);
	var dialect = ds.getDialect();
	var updateSql = "update " + dbTableName + " set  "+args.wordfield+"=? where " + dialect.quote(args.keyfield) +"=?";
	println("saveWordToDB:"+updateSql);
	/**
	 * 验证word文档完整性，避免用户随意打开一个文档，直接点击保存，由于word都有只读打开，或者是修订打开，没权限
	 * 装入本地的其他文件
	 */
	//checkSaveWord(fileObj);
	
	/**
	 * 备份先前存储的文档  TODO
	 */
	backupWord(dbTableName, args.wordfield, args.keyfield, args.keys);
	
	var ins = file.getInputStream();
	try{
		ds.update(updateSql,[ins, args.keys]);
	}finally{
		ins.close();
	}
}

/**
 * word备份表
 * @type String
 */
var DB_BACKUP_WORD = "SZSYS_CS_WORD";

/**
 * 在word修改时要对修改之前的word进行存档
 * SUBMITTIME_  USERID_  PATH_   CONTENT_  
 * 
 * submittime_  提交时间
 * userid_      提交人
 * path_        文档路径
 * content_     文档内容
 */
function backupWord(factTable, wordfield, keyfield, keyValue){
	try{
		var ds = sz.db.getDefaultDataSource();
		var dialect = ds.getDialect();
		var sql1 = new java.lang.StringBuilder();
		sql1.append("insert into ").append(DB_BACKUP_WORD).append("  ");
		sql1.append("select ");
		sql1.append(dialect.renderFunction(FunctionNames.CURRENT_TIMESTAMP)).append(",");
		sql1.append("'"+sz.security.getCurrentUser().id+"'").append(",");
		sql1.append("'"+factTable+"'").append(",");
		sql1.append("'"+keyValue+"'").append(",");
		sql1.append(wordfield);
		sql1.append(" from ").append(factTable);
		sql1.append(" where ").append(dialect.quote(keyfield)).append("=?");
		var sql = sql1.toString();
		println(sql);
		ds.update(sql, [keyValue]);
	}catch(ex){
		println(ex);
	}
}


/**
 * 对保存的word进行验证，避免用户随意装载其他word进行存储，从系统下载的word写一个临时标记，然后对该标记进行验证
 * 如果标记不存在，那么不予保存
 */
function checkSaveWord(fileObj){
	var ins = file.getInputStream();
	try{
		var doc = new Document(ins);
		var checkSign = doc.getVariables().get(PROP_CHECKVALID);
		if(checkSign != "1"){
			throw new Error("提交的文档被重新装入，请在原文档上修改!");
		}
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
 * @mapping
 */
function downloadFormWord(req, res){
	println("download:"+req.getRequestURI());
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
	if(ISDEBUG){
		log("downloadFormWord", {"cipath":resid,"dwTable":dwTable,"fileNameField":fileNameField, "fileNameField":datahierarchies});
	}
	
	if(StringUtils.isNotBlank(id)){
		downloadDraftAttachment(req, res, citask, id);
	}else{
		datahierarchies = URLDecoder.decode(datahierarchies, "utf-8");
		var myOut = new MyByteArrayOutputStream();
		serviceAttachments.downloadAttachment(myOut, citask, dataperiod, datahierarchies, rowKey,
					dwTable, fileContentField, fileNameField);
		var bins = myOut.asInputStream();
		/**
		 * 下载已经存储到表单数据库中的文档：
		 * 1.该表单已经提交审批了， 留痕打开
		 * 2.未提交审批，要区分自由合同和范本合同
		 *   a.自由合同，不限制编辑
		 *   b.范本合同，只能编辑窗体域
		 * TODO  
		 */
		var downloadType = ProtectionType.READ_ONLY;
		var state = getAuditState(citask, dwTable, dataperiod, datahierarchies);
		println("downloadFormWord: state="+state);
		if(state == "10"){
			downloadType = -1;
		}else if(state=="20"){
			downloadType = ProtectionType.ALLOW_ONLY_REVISIONS;
			/**
			 * 审批后在表单中打开word，要判断多人同时编辑的情形，其判断的逻辑见lock函数
			 * TODO
			 * citaskPath, uid, formName, wordField, sessionid)
			 */
			var uidField = citask.getDetailGrainDef().getIDField();
			var uid = getDetailIdValue(datahierarchies, uidField);
			var sessionid = req.getSession().getId();
			var lockObj = null;//checkLock(resid, uid, dwTable, fileContentField, sessionid);
			if(lockObj != null){
				downloadType = ProtectionType.READ_ONLY;
			}
		} else if(state == "-1"){
			/**
			 * 不存在状态字段
			 */
			downloadType = ProtectionType.READ_ONLY;
		}
		writeWord(bins, res, downloadType, req.version == "Word.Application.11");			
	}
}

/**
 * 把word附件中的内容存储到草稿库中，主要用于用户选择范本时，要往范本里面记录一个标识信息，便于
 * 以后用户编辑时，设置word的状态
 * 
 * 自动生成合同文本，把表单里面的项，自动插入到文本中
 * @mapping
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
		 * 插入范本之前做一些处理，见函数说明
		 */
		var formDataStr = req.formdatas;
		if(ISDEBUG){
			println("formDataStr:"+formDataStr);
		}
		var formData = jsonMapper.readValue(formDataStr, java.util.Map);
		insertTemplateBefore(file, formData);
		
		var ins = new FileInputStream(file);
		try {
			var attachment = serviceAttachments.saveAttachment(resid, formset, dataperiod, datahierarchies, rowKey, formName, compid, false,
					filename, size, ins, contentType, id); 
			return getAttachmentInfo(attachment);
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
 * 插入范本之前，对文档做如下处理：
 * 1.插入范本标识
 * 2.把表单内容填入到word中
 * @formDatas key全大写
 */
function insertTemplateBefore(file, formDatas){
	var doc = new Document(file);
	doc.getVariables().add(PROP_TEMPLATE, "1");
	
	println("insert template sign:"+file);
	
	/**
	 * 初始化BookMark的值
	 */
	makeTemplateContract(doc, formDatas);
	
	doc.save(file);
}

/**
 * 根据word、表单的数据生成合同，重复生成合同，不能使用邮件域，邮件域生成一次后就在也找不到了，
 * 故使用BookMark的方式来生成。
 * 
 * TODO Aspose不支持ActivX控件，只支持旧版本的组件
 */
function makeTemplateContract(doc, formDatas){
	if(formDatas == null){
		return doc;
	}
	if(ISDEBUG){
		println("formdata====="+log2("makeTemplateContract", formDatas));
	}
	
	var keys = formDatas.keySet().toArray();
	var bks = doc.getRange().getBookmarks();
	var bkNames = [];
	for(var i=0, len=bks.getCount(); i<len; i++){
		var bk = bks.get(i);
		var key = bk.getName();
		bkNames.push(key);
		
		var kk = StringUtils.upperCase(key);
		if(keys.indexOf(kk) < 0){
			continue;
		}
		
		if(formDatas[kk] == null || formDatas[kk] == "null"){
			bk.setText("");		
		}else{
			bk.setText(StringUtils.trimToEmpty(formDatas[kk]));
		}
	}
	
	if(ISDEBUG){
		println("BookMark:"+bkNames.join(";"));
	}
}


/**
 * 在审批过程中，要对word文档进行修改，这时数据会直接写入数据库对应的表单库，而不是写入到草稿库中
 * 1.在写入时，要注意文件的安全性
 * 
 * 客户端传递的参数：
 * 1. resid， 可以通过该id获取CITask, 由于脚本不能直接接收resid，这里修改为path
 * 2. period  数据期
 * 3. datahierarchies  数据级次
 * 4. formName 表单名
 * 5. compName 组件名  可以获取存储到哪个字段
 * 6. compress 是否压缩存储
 * 7. rowKey   如果是浮动表，还需要传入一个rowKey， TODO 目前先不解决浮动表的
 * @mapping
 */
function saveWordInForm(req, res){
	var path = req.path;
	var ciTask = serviceAttachments.getCITask(path);
	var formName = req.formName;
	var compName = req.compName;
	var compileForms = scmgr.getCIFormsCompileInf(ciTask, "default");
	var finf = compileForms.getCIFormCompileInf(formName);
	var cdbinf = serviceAttachments.getFormField(finf, compName);
	var srcdwtable = cdbinf.getTableName();
	if(ISDEBUG){
		log("saveWordInForm", {"path":path,"formName":formName, "compName":compName, "srcdwtable":srcdwtable});
	}
	
	var state = getAuditState(ciTask, srcdwtable, req.period, req.datahierarchies);
	println("saving:"+state);
	if(state == "10" || state == null || state == ""){
		return editFormSavingWord(req, res, ciTask);
	}else if(state == "20"){
		auditFormSavingWord(req, res, ciTask, formName, compName);
	}
}

function editFormSavingWord(req, res, citask){
	var fileobj = getUploadFile(req);
	var filename = fileobj.fileName;
	/**
	 * 20140917 guob
	 * ISSUE:LAWCONT-38
	 * 问题现象：通过插件上传的文件的文件名中有中文，传到后台后乱码
	 * 解决方案：在js端对文件名进行了编码（encodeURIComponent），在服务器端需要解码，
	 * 这样包装中文的文件名不会乱码
	 */
	filename = StringEscapeUtils.decodeURI(filename);
	
	var file = fileobj.file;
	var size = file.length();
	var contentType = ContentTypeUtils.getContentType(filename);//自动识别contentType
	var inputStream = file.getInputStream();
	try {
		println("filename:"+filename);
		var attachment = serviceAttachments.saveDraft(citask, req.id, req.period, req.datahierarchies, req.rowKey,
				req.formName, req.compName, filename, contentType, size, inputStream, false);
		return getAttachmentInfo(attachment);
	}
	finally {
		inputStream.close();
	}
}

function getAttachmentInfo(attachment){
	var info = {};//url在客户端生成
	info["id"] = attachment.getID();
	info["size"] =  java.lang.String.valueOf(attachment.getSize());
	info["name"] = attachment.getFilename();
	info["updateTime"] = String.valueOf(attachment.getUpdateTime());
	var contentType = attachment.getContentType();
	info["contentType"] = contentType;		
	log("getAttachmentInfo", info);
	return info;
}

function auditFormSavingWord(req, res, ciTask, formName, compName){
	var compileForms = scmgr.getCIFormsCompileInf(ciTask, "default");
	var finf = compileForms.getCIFormCompileInf(formName);
	var cdbinf = serviceAttachments.getFormField(finf, compName);
	var srcdwtable = cdbinf.getTableName();
	var wordfield = cdbinf.getName();
	var detailGrain = ciTask.getDetailGrainDef();
	if(!detailGrain){
		throw new Error(ciTask.getPath()+"未设置填报明细，暂不支持!");
	}
	var uid = ciTask.getDetailGrainDef().getIDField();
	var facttable = ciTask.getDWTableInf(srcdwtable).getPath();
	var dataHier  = req.datahierarchies;
	var keys = getDetailIdValue(dataHier, uid);
	if(!keys){
		throw new Error(dataHier+"找不到填报明细的内容!填报明细字段为："+uid);
	}
	
	var wordfile = getUploadFile(req);
	/**
	 * 防止客户端随意存储word，这里先屏蔽掉，表单中的word存储，会走其他接口
	 */
	var params = {"facttable":facttable, "wordfield":wordfield, "keyfield":uid, "keys":keys};
	saveWordToDb(params, wordfile.file);
}

/**
 * 解析出数据次级中的明细字段的值
 * ORG=SHFUS&UID=95f99345da174959959c95a6de4d8520
 * @param {} uidField
 */
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
 * 用户在起草合同时，上传的文档是存储在草稿中的，通过范本引入的文档也是存储在草稿中，故打开草稿时，也要区分
 * 用户自定义的合同，还是范本起草的合同，如果是范本起草的合同，要以窗体的方式打开。
 * @param {} req
 * @param {} res
 * @param {} citask
 * @param {} id
 */
function downloadDraftAttachment(req, res, task, id){
	var input = getContractInputStreamByDraft(task,id);
	try {
		/**
		 * 如果是范本合同  ProtectionType.ALLOW_ONLY_FORM_FIELDS，那么以窗体只读的方式打开
		 */
		var out = res.getOutputStream();
		try{
			var downloadType = -1;
			var doc = new Document(input);
			if(isTemplateContract(doc)){
				downloadType = ProtectionType.ALLOW_ONLY_FORM_FIELDS;
			}
			println("downloadDraftAttachment=======downloadType=="+downloadType);
			writeWordByDoc(doc, out, downloadType, req.version == "Word.Application.11");
		}finally{
			out.close();
		}
	}
	finally {
		IOUtils.closeQuietly(input);
	}
}

/**
 * 从草稿中获取合同的内容，便于根据表单内容重新更新合同范本
 */
function getContractInputStreamByDraft(task, id, attachmentObj){
	var draft = dataPackageUtil.getDWTable(task, CIMetaConsts.SYS_PREFIX + CIMetaConsts.TABLE_CI_DRAFT_ATTACHMENTS);
	var ds = draft.getDataSourceName();
	var cf = mgr.get(ds);

	var query = getDraftAttachmentInfQuery(id, draft);

	var querySql = query.getQuerySql();
	var sqlstr = sf.getSql(querySql, cf.getDbMetaData());
	var rs = null;
	var conn = null;
	var ps = null;
	try {
		conn = cf.getConnection();
		ps = conn.prepareStatement(sqlstr);
		rs = ps.executeQuery();
		if (!rs.next()) {
			throw new Error("taskpath:"+task.getPath()+"中不存在ID为“"+id+"”的草稿!");
		}
		
		if(attachmentObj){
			attachmentObj["id"] = id;
//			attachmentObj["size"] =  java.lang.String.valueOf(attachment.getSize());
			attachmentObj["name"] = rs.getString(CIMetaConsts.SYS_PREFIX + CIMetaConsts.FIELD_FILENAME);
//			attachmentObj["updateTime"] = String.valueOf(attachment.getUpdateTime());
			attachmentObj["contentType"] = rs.getString(CIMetaConsts.SYS_PREFIX + CIMetaConsts.FIELD_CONTENTTYPE);		
		}
		
		var input = rs.getBinaryStream(CIMetaConsts.SYS_PREFIX + CIMetaConsts.FIELD_ATTACHMENT);
		try{
			var myOut = new MyByteArrayOutputStream();
			IOUtils.copy(input, myOut);
			return myOut.asInputStream();
		}finally{
			IOUtils.closeQuietly(input);
		}
	}
	finally {
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
		println("事实表：" + dwTable + "中字段：" + fieldName + "不存在!");
		return "-1";
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
var PROP_CHECKVALID = "succezwordvalid";

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
 * 插入水印
 */
function insertIntoWatermark(doc, imgIn){
	var watermarkPara = new Paragraph(doc);
		
	var shape = createWatermark(doc, imgIn);
	watermarkPara.appendChild(shape);
	var sections = doc.getSections();
	for (var i = 0; i < sections.getCount(); i++) {
		var sect = sections.get(i);
		insertWatermarkIntoHeader(watermarkPara, sect, HeaderFooterType.HEADER_PRIMARY);
		insertWatermarkIntoHeader(watermarkPara, sect, HeaderFooterType.HEADER_FIRST);
		insertWatermarkIntoHeader(watermarkPara, sect, HeaderFooterType.HEADER_EVEN);
	}
	return doc;
}

function createWatermark(doc, imgIn){
	var shape = new Shape(doc, ShapeType.IMAGE);
	shape.getImageData().setImage(imgIn);
	shape.setWrapType(WrapType.NONE);
	shape.setBehindText(true);
	shape.setWidth(500);
	shape.setHeight(500);
	shape.setRelativeHorizontalPosition(RelativeHorizontalPosition.PAGE);
	shape.setHorizontalAlignment(HorizontalAlignment.CENTER);
	shape.setRelativeVerticalPosition(RelativeVerticalPosition.PAGE);
	shape.setVerticalAlignment(VerticalAlignment.CENTER);
	return shape;
}

function insertWatermarkIntoHeader(watermarkPara, sect, headerType){
	var header = sect.getHeadersFooters().getByHeaderFooterType(headerType);
	if(header == null){
		header = new HeaderFooter(sect.getDocument(), headerType);
		sect.getHeadersFooters().add(header);
	}
	header.appendChild(watermarkPara.deepClone(true));
}
/**
 * ========================插入水印结束====================================
 */

/**
 * ======================多人编辑word冲突处理==============================
 * 
 * 多人编辑只存在于审批中，故只需要考虑审批状态下的多人编辑，多人编辑的实现
 * 
 * 1.打开word文档时，先判断该文档是否已经锁定
 *   a.如果锁定，那么就提示用户“该文档正在被xxx编辑，目前只能以只读模式打开!”
 *   b.未锁定，那么就锁定该文档，直接打开
 * 
 *   
 *  
 */
var lockService = BeanGetter.getBean(com.succez.commons.service.impl.lock.LockServiceImpl);
var activeusers = BeanGetter.getBean(com.succez.security.api.session.ActiveUsers);
var conflictTableResource = lockService.createResourceByPath("/SUCCEZBJHD/SZ_CUSTOM_CONFLICT");
var TIME_ONE_DAY = 86400000;

/**
 * 检查某个文档是否被锁定了，如果锁定了，那么就返回锁定信息，反之则返回null
 * @return {}
 */
function checkLock(citaskPath, uid, formName, wordField, sessionid){
	var lockObj = lockService.createLock();
	lockObj.addReadLocks(SZ_CUSTOM_CONFLICT);
	lockObj.lock(TIME_ONE_DAY);
	try{
		var queryObj = queryLockObj(citaskPath, uid, formName);
		if(queryObj == null){
			/**
			 * 插入信息
			 */
			insertLockObj(citaskPath, uid, formName, wordField, sessionid);
			return null;
		}
		
		return queryObj;
	}finally{
		lockObj.unlock();
	}
}

function queryLockObj(citaskPath, uid_, formName, wordField){
	var ds = sz.db.getDefaultDataSource();
	var rs = ds.select("select ID_, CREATETIME_,USEID_, SESSIONID_ from SZ_CUSTOM_CONFLICT where TASKID_=? and UID_= ? and formname_ = ? and attachfield_=?", 
			[citaskPath, uid_, formName, wordField]);
	if(rs == null || rs.length == 0 || rs[0].length == 0 || rs[0][0] == null){
		return null;
	}		
	
	var lockObj = {"user":rs[0][2], "sessionid":rs[0][3], "createtime":rs[0][1], "id":rs[0][0]};
	var actUsers = activeusers.getActiveUsers();
	for(var i=0; i<actUsers.size(); i++){
		var login = actUsers.get(i);
		var sessionid = login.getSessionId();
		if(sessionid == lockObj.sessionid ){
			/**
			 * 删除该session
			 */
			ds.update("delete from SZ_CUSTOM_CONFLICT where ID_=?",[lockObj.id]);
			
			return lockObj;
		}
	}
	
	return null;
}

function insertLockObj(citaskPath, uid_, formName, wordField, sessionid){
	var user = sz.security.getCurrentUser().id;
	var ds = sz.db.getDefaultDataSource();
	var sql = "insert into SZ_CUSTOM_CONFLICT values(?,?,?,?,?,?,?,?)"
	ds.update(sql, [uuid(), new java.sql.Timestamp(java.lang.System.currentTimeMillis()), citaskPath, uid_, formName, wordField, user, sessionid]);
}

function unlock(citaskPath, formName, wordField){
	var lockObj = lockService.createLock();
	lockObj.addReadLocks(SZ_CUSTOM_CONFLICT);
	lockObj.lock(TIME_ONE_DAY);
	try{
		
	}finally{
		lockObj.unlock();
	}
}

/**
 * 判断该资源是否被锁定
 * @param {} citaskPath
 * @param {} formName
 * @param {} wordfield
 */
function isLock(citaskPath, uid, formName, wordField, sessionid){
	
}

/**
 * 资源锁定了，才需要ping，如果未锁定则不需要ping，ping主要来处理解锁，目前不考虑某资源已经解锁的情形
 */
function pingLock(){
	
}



/**
 * ======================多人编辑word冲突处理结束====================================
 */

/**
 * 记录日志，便于调试
 * @param {} method
 * @param {} params
 */
function log(method, params){
	if(ISDEBUG){
		println(method+":"+JSON.stringify(params));	
	}
}

/**
 * 记录日志，参数是一个map
 * @param {} method
 * @param {} map
 */
function log2(method, map){
	if(!ISDEBUG){
		return "";
	}
	
	if(map == null){
		return "";
	}
	
	var result = [];
	var keys = map.keySet().toArray();
	for(var i=0; i<keys.length; i++){
		var key = keys[i];
		result.push(key+":"+map[key]);
	}
	return result.join(";");
}