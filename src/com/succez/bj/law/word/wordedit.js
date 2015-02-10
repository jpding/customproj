var BeanGetter = com.succez.commons.service.springmvcext.BeanGetterHolder.getBeanGetter();

var serviceAttachments = BeanGetter.getBean(com.succez.bi.ci.impl.mgr.CIServiceAttachmentsImpl);
var dataPackageUtil    = BeanGetter.getBean(com.succez.bi.ci.impl.mgr.datapackage.DataPackageUtil);
var scmgr = BeanGetter.getBean(com.succez.bi.ci.mgr.CIServiceCacheMgr);

var mgr = BeanGetter.getBean(com.succez.commons.jdbc.ConnectionFactoryManager);
var sf  = BeanGetter.getBean(com.succez.commons.jdbc.sql.SQLFactory);
var uas = BeanGetter.getBean(com.succez.commons.util.domain.UserAgentService);

var WebUtils = com.succez.commons.util.WebUtils;
var StringUtils = com.succez.commons.util.StringUtils;
var IOUtils   = com.succez.commons.util.io.IOUtils;
var FileUtils = com.succez.commons.util.io.FileUtils;
var ContentTypeUtils = com.succez.commons.util.ContentTypeUtils;
var FilenameUtils    = com.succez.commons.util.FilenameUtils;
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
var ActionUtils = com.succez.commons.webctrls.domain.ActionUtils;

var FunctionNames = com.succez.commons.jdbc.function.FunctionNames;

var ISDEBUG = true;
var INFO_WORD_ERROR = "fail:保存的文件为空，请用管理员权限打开IE浏览器，重新编辑在保存!";

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
	  

2015-2-5 工作流中操作word功能说明：
    1.直接打开表单中的word，分为起草状态和审批状态
      a.合同起草状态，范本合同是只读模式，自由合同是直接导出即可
      b.审批状态，如果是范本合同，在部门内部审批，还是只读模式，反之则是修订模式
      c.非合同表单，上传的word，都是直接打开，不经过任何转换，但不提供word的保存功能(那就还是只读打开)
    2.打开报表中的word文件，报表中的word是来自于采集表单，通过showfile.action进行访问，实际上是访问的wordedit.action
    3.工作流中上传的附件，以修订模式打开	  
	  
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
	res.attr("downloadtype", ProtectionType.ALLOW_ONLY_FORM_FIELDS);
	if(req.namespace){
		res.attr("namespace",req.namespace);
	}
	
	/**
	 * 如果非IE浏览器，那么直接下载word
	 */
	if(!uas.isMsie()){
		directDownloadWord(req, res);
		return ;
	}
	
//	var hideToolbar =  req.getAttribute("facttable");
	
//	print(req.hideToolbar);
//	if(hideToolbar == true){
	//	res.attr("hideToolbar", true);
//	}else{
//		res.attr("hideToolbar", false);
//	}
	
	/**
	 * 插件只能在IE下打开，假如安装了chromeframe，那么应该在这里忽略谷歌插件
	 */
	res.attr("ignoreChromeFrame", "true");
	
	var ext = req.getAttribute("ext");
	if(!ext){
		req.setAttribute("ext","doc");
	}
	
	var enumNames = req.getAttributeNames();
	while(enumNames.hasMoreElements()){
		var attrName = enumNames.nextElement();
		res.attr(attrName, req.getAttribute(attrName));
	}
	
	/*
	var ext = req.getAttribute("ext");
	if(!ext){
		ext = "doc";
	}
	res.attr("ext", ext);
	
	var mtd = req.getAttribute("method");
	if(mtd){
		res.attr("method", mtd);
	}
	
	var savemtd = req.getAttribute("savemethod");
	if(savemtd){
		res.attr("savemethod", savemtd);
	}
	*/
	return "wordedit.ftl";
}

/**
 * 
 * @param {} req
 * @param {} res
 */
function directDownloadWord(req, res){
	/**
	 * 要区分是在工作流中的附件还是在表单中附件
	 */
	println("directDownloadWord:"+req.getRequestURI());
	var id = req.id;
	var resid = req.path;
	
	/**
	 * 工作流中的附件，只有单独的id参数，没有任何附加信息
	 */
	if(StringUtils.isNotBlank(id) && !StringUtils.isNotBlank(resid)){
		downloadWIHisAttachments(req, res);
	}else{
		downloadFormWord(req, res);
	}
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
		ActionUtils.setHeaderForDownload(res, req.getHeader("USER-AGENT"), "application/msword","utf-8", null, "word.doc");
				
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
 * 2015-2-5 生成合同文本，返回对应的合同附件信息，生成的合同文本始终是存储在草稿中，当保存表单时，把草稿中的附件存储到表单中
 * 
 * 2015-2-6 在生成审签单时，需要根据表单里面的附件重新生成，并且把内容重新回写到当前表单中，调用该方法时会自动把替换相关数据
 *          并把生成好的word写入到草稿表中，点击的保存的时候，会分两种情形:
 *          1.未提交审批的表单，保存时数据会写入到草稿表中
 *          2.提交审批后的表单，数据会直接写入到表单中     
 *          
 *          对于审签单目前存在两个问题：
 *          1.如果有电子签章后，数据不能在初始化的，只能存储为docm，不能存储为docx
 *          2.如果部长打开后，签章保存后，关闭word后，在打开，仍然是草稿里面的内容，没有签章数据，原因是签章数据保存在表单中，而没有直接
 *            保存草稿中。
 *            
 *         解决：
 *          1.如果含有宏的word，那就不用初始化，直接返回word源文件，并且也不用存储到草稿中   
 *          
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
		/**
		 * 如果包含有电子签章，是不能替换里面的内容的，替换会直接报错，直接把原始文件下载下来
		 *   1.This document contains macros (VBA project) and you are attempting to save it in a Macro-Free format. 
		 *     Such document will be invalid if created. You need to either save it in a Macro-Enabled format (.DOCM or .DOTM) 
		 *     or remove macros before saving using the Document.RemoveMacros method.)
		 */
		var myOutput = new MyByteArrayOutputStream();
		
		if(doc.hasMacros()){
			input.reset();
			IOUtils.copy(input,myOutput);
			return "";
		}else{
			var formData = jsonMapper.readValue(formDataStr, java.util.Map);
			makeTemplateContract(doc, formData);
			doc.save(myOutput, SaveFormat.DOCX);
		}
		var filename = attachmentObj["name"];
		var contentType = "application/msword";
		var inputStream = myOutput.asInputStream();
		try {
			println("filename:"+filename);
			var attachment = serviceAttachments.saveDraft(citask, id, dataperiod, datahierarchies, rowKey,
					req.formName, req.compName, filename, contentType, inputStream.available(), inputStream, false);
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
	println("writeWordByInputStream:downloadtype:"+downloadtype);
	var doc = new Document(input);
	writeWordByDoc(doc, out, downloadtype, is2003);
}

function writeWordByDoc(doc, out, downloadtype, is2003){
	/*
	* 如果是审签单的话，那么直接输出，不需要经过其他处理	----wangyg
	*/
	if (isSQD(doc) == 'true'){
		print("doc is not protect and isSQD = ");
		doc.save(out,SaveFormat.DOC);
	}else{
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
		 * 
		 * 2005-1-10 由于范本使用限制编辑功能，参考了帮助文档，只有doc和OOXML两种格式才支持
		 */
		//doc.save(out,is2003 ? SaveFormat.DOC:SaveFormat.DOCX);
		print("doc has protected and downloadType == " + downloadtype);
		doc.save(out,SaveFormat.DOC);
	}
}


/**
 * 点击保存时，保存先前打开的word文件
 *
function uploadWord(req, res){
	var params = getDownloadParam(req);
	var wordfile = getUploadFile(req);
	
	 //防止客户端随意存储word，这里先屏蔽掉，表单中的word存储，会走其他接口
	 
	log("uploadWord", params);
	//saveWordToDb(params, file);
}
*/

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
 * 把文件存储到数据库，最好不要直接调用该函数，该函数没有通过CI
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
	/**
	 * 2015-1-14 在WIN7下，非管理员点击保存，这样上传的附件是空，这样会导致覆盖以前的附件，故在这里怕判断，如果是0字节的文件，
	 *   不让存储
	 */
	try{
		if(ins == null || ins.available()==0){
			return INFO_WORD_ERROR;
		}
		ds.update(updateSql,[ins, args.keys]);
		
		return "success";
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
 * 
 * 2015-1-14 加入可以下载审批历史记录中的，如果只有id一个参数，那么就认为是直接下载审批历史表中的附件
 * 
 * 2015-1-15 可以直接下载Excel附件，由于word控件不支持对Excel处理，故直接下载
 * 
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
	println("=========downloadFormWord==="+id+";resid:"+resid);
	if(ISDEBUG){
		log("downloadFormWord", {"cipath":resid,"dwTable":dwTable,"fileContentField":fileContentField, "datahierarchies":datahierarchies});
	}
	
	if(StringUtils.isNotBlank(id)){
		var citask = serviceAttachments.getCITask(resid);
		downloadDraftAttachment(req, res, citask, id);
	}else{
		var citask = serviceAttachments.getCITask(resid);
		datahierarchies = URLDecoder.decode(datahierarchies, "utf-8");
		var myOut = new MyByteArrayOutputStream();
		
		var attachmentInf = serviceAttachments.getAttachment(citask, dataperiod,datahierarchies, rowKey,
			dwTable, fileContentField, fileNameField, myOut);
		var fileName = attachmentInf.getFilename();	
		var bins = myOut.asInputStream();
		
		var fileExt = FilenameUtils.getExtension(fileName);
		if(StringUtils.equalsIgnoreCase(fileExt, "xls") || StringUtils.equalsIgnoreCase(fileExt, "xlsx")){
				downloadXls(req, res, bins, null, fileName);
		}else{	
			ActionUtils.setHeaderForDownload(res, req.getHeader("USER-AGENT"), "application/msword", "utf-8", null, fileName);
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
				downloadType = getDocConflictDownloadType(req, citask, resid, dwTable, fileContentField, datahierarchies);
			}else if(state == "-1"){
				/**
				 * 不存在状态字段，由于合同范本里面设置了限制编辑，并且是只读状态是可以编辑的，这样就导致浏览范本时，会看到
				 * 那些可编辑项是可以填写的，目前这里设置成只能填写表单域，而范本里面是没有表单域的，这样就是只读状态了
				 */
				//downloadType = ProtectionType.READ_ONLY;
				downloadType = ProtectionType.ALLOW_ONLY_FORM_FIELDS;
			}else if(StringUtils.isNotEmpty(state)){
				downloadType = ProtectionType.ALLOW_ONLY_FORM_FIELDS;
			}
			println("downloadFormWord:downloadType=="+downloadType);
			writeWord(bins, res, downloadType, req.version == "Word.Application.11");	
		}
	}
}

/**
 * 下载或者打开工作流中的内容，在合同审批中，法务部上传的意见修改，要进行在线留痕
 * @param {} req
 * @param {} res
 * @mapping
 */
function downloadwiattach(req, res){
	downloadWIHisAttachments(req, res);
}

function downloadWIHisAttachments(req, res){
	/**
	 * 下载历史表中的附件
	 */
	var myOut = res.getOutputStream();
	try{
		getWiAttachment(req, res, myOut);
	}finally{
		myOut.close();
	}
}

/**
 * STARTFORM,SZRSH,BMLDSH,BZSH
 */
function getDocAuditType(req){
	/**
	 * 如果自由合同，那么则应该是留痕模式
	 */
	var formName = req.wiformname;
	var formNames = ["STARTFORM","SZRSH","BMLDSH","BZSH"];
	var idx = formNames.indexOf(StringUtils.upperCase(formName));
	if(idx>=0){
		return  ProtectionType.READ_ONLY;
	}
	return ProtectionType.ALLOW_ONLY_REVISIONS;
}

/**
 * 对于合同管理，在流程内部是只读的，如果在部门外才是修订模式
 * @return {}
 */
function getDocConflictDownloadType(req,citask, resid, dwTable, fileContentField, datahierarchies){
	var downloadType = ProtectionType.ALLOW_ONLY_REVISIONS;
	
	var isContModel = getCITableFieldValue(citask, dwTable, req.dataperiod, datahierarchies, "ISCONTRACTMODEL");
	if(isContModel == "1" && citask != null && citask.getPath() == "LAWCONT:/collections/HD_PROJECT/HDBD_HTGL/LC_CONT_INFO"){
		downloadType = getDocAuditType(req);
		println("contract downloadType:"+downloadType);
	}
	
	
	/**
	 * 审批后在表单中打开word，要判断多人同时编辑的情形，其判断的逻辑见lock函数
	 * 只是需要修改的附件，才需要锁定，例如：合同文本，规章制度文本，而除此之外的文档，不需要
	 * 冲突，大家都能看
	 * TODO
	 * citaskPath, uid, formName, wordField, sessionid)
	 */
	if(needCheckConflict(resid, fileContentField)){
		var uidField = citask.getDetailGrainDef().getIDField();
		var uid = getDetailIdValue(datahierarchies, uidField);
		println("needLock:"+uid);
		var sessionid = req.getSession().getId();
		var lockObj = checkLock(resid, uid, dwTable, fileContentField, sessionid);
		if(lockObj != null){
			if(ISDEBUG){
				println("lockObj:"+lockObj.user+","+lockObj.createtime+","+lockObj.id);
			}
			downloadType = ProtectionType.ALLOW_ONLY_FORM_FIELDS;
		}
	}
	return downloadType;
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
	println("====saveDraft:resid="+resid+";datahierarchies="+datahierarchies+";compid="+compid+";formName="+formName);
	
	var ciattachmentstr = req.ciattachment;
	var ciattachment = jsonMapper.readValue(ciattachmentstr, java.util.Map);
	
	var srctaskid = ciattachment["taskid"];
	var srcdatahierarchies = ciattachment["datahierarchies"];
	var srcdataperiod = ciattachment["dataperiod"];
	var srcrowKey = ciattachment["rowKey"];
	var srcfileContentField = ciattachment["fileContentField"];
	var srcfileNameField = ciattachment["fileNameField"];
	var srcdwtable = ciattachment["dwTable"];
	var srcuid     = ciattachment["uid"];

	var citask = serviceAttachments.getCITask(srctaskid);
	var file = tempFileService.createTempFile("doc");
	try {
		var srcAttachment = null;
		var out = new FileOutputStream(file);
		try {
			if(!srcdatahierarchies){
				srcdatahierarchies = getDataHierarchiesByUid(srctaskid, srcdwtable, srcuid);
			}
			srcAttachment = serviceAttachments.getAttachment(citask, srcdataperiod, srcdatahierarchies, srcrowKey, srcdwtable,
					srcfileContentField, srcfileNameField, out);
		}
		finally {
			out.close();
		}
		var filename = srcAttachment.getFilename();
		var contentType = srcAttachment.getContentType();
		
		/**
		 * 插入范本之前做一些处理，见函数说明
		 */
		var formDataStr = req.formdatas;
		if(ISDEBUG){
			println("formDataStr:"+formDataStr);
		}
		var formData = jsonMapper.readValue(formDataStr, java.util.Map);
		
		insertTemplateBefore(file, formData,"sqdwj"==compid);
		
		var ins = new FileInputStream(file);
		try {
			var attachment = serviceAttachments.saveAttachment(resid, formset, dataperiod, datahierarchies, rowKey, formName, compid, false,
					filename, ins.available(), ins, contentType, id); 
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
 * 目前只有合同用到，故直接写死
 * @param {} taskPath
 * @param {} dwTable
 * @param {} uid
 */
function getDataHierarchiesByUid(taskPath, dwTable, uid){
	var brow = sz.ci.getDataBrowser(taskPath);
	brow.addDWTable(dwTable);
	brow.addField("org", "org");
	brow.addFilter(dwTable+".uid='"+uid+"'");
	var q = brow.query();
	if(!q || q.size()==0){
		return "";
	}
	var org = q.get(0)[0];
	return "ORG="+org+"&"+"UID="+uid;
}

/**
 * 插入范本之前，对文档做如下处理：
 * 1.插入范本标识
 * 2.把表单内容填入到word中
 * @formDatas key全大写
 * 加上一个参数：isSQD，是否为审签单附件，为了兼容电子签章，如果是审签单的话，那么服务器端不做任何保护措施
 *
 */
function insertTemplateBefore(file, formDatas, isSQD){
	var doc = new Document(file);
	doc.getVariables().add(PROP_TEMPLATE, "1");
	doc.getVariables().add(PROP_ISSQD,isSQD)
	
	println("insert template sign:"+file);
	
	/**
	 * 初始化BookMark的值
	 */
	makeTemplateContract(doc, formDatas);
	
	doc.save(file, SaveFormat.DOC);
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
 * wordedit.action?id=xxx&method=saveWordInWI&xxx
 * 保存工作流中的word文档
 * @param {} req
 * @param {} res
 */
function saveWordInWI(req, res){
	var wordfile = getUploadFile(req);
	/**
	 * 防止客户端随意存储word，这里先屏蔽掉，表单中的word存储，会走其他接口
	 */
	var ins = wordfile.file.getInputStream();
	try{
		return updateWIAttachment(req.id, ins);
	}finally{
		ins.close();
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
		/**
		 * 起草阶段打开表单，附件一般都存储在草稿箱
		 */
		return editFormSavingWord(req, res, ciTask);
	}else if(state == "20"){
		/**
		 * 审批表单界面，直接保存word，要注意非管理员打开word时，上传word文件的长度为0
		 */
		return auditFormSavingWord(req, res, ciTask, formName, compName);
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
	var contentType = ContentTypeUtils.getContentType(filename);//自动识别contentType
	var inputStream = file.getInputStream();
	try {
		println("filename:"+filename);
		var size = inputStream.available();
		if(inputStream == null || inputStream.available()==0){
			return INFO_WORD_ERROR;
		}
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
		return "fail:"+ciTask.getPath()+"未设置填报明细，暂不支持!";
	}
	var uid = ciTask.getDetailGrainDef().getIDField();
	var facttable = ciTask.getDWTableInf(srcdwtable).getPath();
	var dataHier  = URLDecoder.decode(req.datahierarchies, "utf-8");
	var keys = getDetailIdValue(dataHier, uid);
	if(!keys){
		return "fail:" + dataHier+"找不到填报明细的内容!填报明细字段为："+uid;
	}
	
	var wordfile = getUploadFile(req);
	/**
	 * 防止客户端随意存储word，这里先屏蔽掉，表单中的word存储，会走其他接口
	 */
	var params = {"facttable":facttable, "wordfield":wordfield, "keyfield":uid, "keys":keys};
	return saveWordToDb(params, wordfile.file);
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
	var attachObj = {};
	var input = getContractInputStreamByDraft(task,id, attachObj);
	try {
		/**
		 * 如果是范本合同  ProtectionType.ALLOW_ONLY_FORM_FIELDS，那么以窗体只读的方式打开
		 */
		var out = res.getOutputStream();
		try{
			var fileName = attachObj["name"];
			var fileExt = FilenameUtils.getExtension(fileName);
			if(StringUtils.equalsIgnoreCase(fileExt, "xls") || StringUtils.equalsIgnoreCase(fileExt, "xlsx")){
				downloadXls(req, res, input, out, fileName);
			}else{
				ActionUtils.setHeaderForDownload(res, req.getHeader("USER-AGENT"), "application/msword", "utf-8", null, fileName);
				var downloadType = -1;
				var doc = new Document(input);
				if(isTemplateContract(doc)){
					/**
					 * 采用限制编辑实现，不在使用窗体的方式实现，原因是使用窗体，不好控制word格式
					 */
					downloadType = ProtectionType.READ_ONLY;
					//downloadType = ProtectionType.ALLOW_ONLY_FORM_FIELDS;
				}
				println("downloadDraftAttachment=======downloadType=="+downloadType);
				writeWordByDoc(doc, out, downloadType, req.version == "Word.Application.11");
			}
		}finally{
			out.close();
		}
	}
	finally {
		IOUtils.closeQuietly(input);
	}
}

/**
 * 直接下载Excel文件
 * @param {} req
 * @param {} res
 * @param {} input
 * @param {} out
 */
function downloadXls(req, res, input, out, fileName){
	ActionUtils.setHeaderForDownload(res, req.getHeader("USER-AGENT"), "application/vnd.ms-excel", "utf-8", null, fileName);
	var needClose = out == null;
	try{
		if(needClose){
			out = res.getOutputStream();
		}
		IOUtils.copy(input, out);
	}finally{
		out.close();
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
var PROP_ISSQD = "succezdocsqd"; //如果是审签单文件，那么服务器端除了替换标签以外，不进行任何其他处理

/**
 * 判断是否是范本合同，直接从文档流里面读出，在插入到临时表时，就记录上一个特殊的标记
 */
function isTemplateContract(doc){
	var tpl = doc.getVariables().get(PROP_TEMPLATE);
	println("=========tpl======="+tpl);
	return tpl == "1";
}


function isSQD(doc){
	var issqd = doc.getVariables().get(PROP_ISSQD);
	println("=========isSqd======="+issqd);
	return issqd;
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
 * 需要处理冲突
 */
function needCheckConflict(citaskPath, wordField){
	return true;
}

/**
 * 检查某个文档是否被锁定了，如果锁定了，那么就返回锁定信息，反之则返回null
 * @return {}
 */
function checkLock(citaskPath, uid, formName, wordField, sessionid){
	var lockObj = lockService.createLock();
	lockObj.addReadLocks(conflictTableResource);
	lockObj.lock(TIME_ONE_DAY);
	try{
		if(ISDEBUG){
			println("checkLock:"+JSON.stringify({"citaskpath":citaskPath,"uid":uid,"formName":formName,"wordField":wordField}));	
		}
		var queryObj = queryLockObj(citaskPath, uid, formName, wordField);
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

/**
 * 返回锁定信息，如果没有锁定则返回空，有些锁定信息是过期的，还有可能是用户遗留下来的，故要返回
 * 真实的锁定信息，判断方式如下：
 * 1.发现该条锁定信息，获取其sessionid和锁定人员，并且都是活动的，那么就认为其有效，反之则无效，删除该条锁定信息
 * @param {} citaskPath
 * @param {} uid_
 * @param {} formName
 * @param {} wordField
 * @return {}
 */
function queryLockObj(citaskPath, uid_, formName, wordField){
	var lockObj = queryLockObjInfo(citaskPath, uid_, formName, wordField);
	if(lockObj == null){
		return null;
	}
	
	/**
	 * 如果是当前用户，重复打开，那么就删除先前的记录，重新加入
	 */
	var ds = sz.db.getDefaultDataSource();
	var currUser = sz.security.getCurrentUser().id;
	if(lockObj.user == currUser){
		ds.update("delete from SZ_CUSTOM_CONFLICT where ID_=?",[lockObj.id]);
		return null;
	}
	
	
	var actUsers = activeusers.getActiveUsers();
	for(var i=0; i<actUsers.size(); i++){
		var login = actUsers.get(i);
		var sessionid = login.getSessionId();
		var userid = login.getUser().getId();
		println("activeuser:"+userid);
		if(sessionid == lockObj.sessionid && lockObj.user == userid){
			return lockObj;
		}
	}
	
	/**
	 * 删除无效的锁定
	 */
	ds.update("delete from SZ_CUSTOM_CONFLICT where ID_=?",[lockObj.id]);
	
	return null;
}

function queryLockObjInfo(citaskPath, uid_, formName, wordField){
	var ds = sz.db.getDefaultDataSource();
	var rs = ds.select("select ID_, CREATETIME_,USERID_, SESSIONID_ from SZ_CUSTOM_CONFLICT where TASKID_=? and UID_= ? and formname_ = ? and attachfield_=?", 
			[citaskPath, uid_, formName, wordField]);
	if(rs == null || rs.length == 0 || rs[0].length == 0 || rs[0][0] == null){
		return null;
	}		
	var lockObj = {"user":rs[0][2], "sessionid":rs[0][3], "createtime":rs[0][1], "id":rs[0][0]};
	if(ISDEBUG){
		println("queryLockObjInfo:"+lockObj.user+","+lockObj.id);
	}
	return lockObj;
}

function insertLockObj(citaskPath, uid_, formName, wordField, sessionid){
	var user = sz.security.getCurrentUser().id;
	var ds = sz.db.getDefaultDataSource();
	var sql = "insert into SZ_CUSTOM_CONFLICT values(?,?,?,?,?,?,?,?)"
	ds.update(sql, [uuid(), new java.sql.Timestamp(java.lang.System.currentTimeMillis()), citaskPath, uid_, formName, wordField, user, sessionid]);
}

/**
 * 显示锁定信息
 * @param {} req
 * @param {} res
 */
function showlockinfo(req, res){
	var resid = req.path;
	var datahierarchies = req.datahierarchies;
	var dataperiod = req.dataperiod;
	var rowKey = req.rowKey;
	var dwTable = req.dwTable;
	var fileContentField = req.fileContentField;
	var fileNameField    = req.fileNameField;
	if(needCheckConflict(resid, fileContentField)){
		var citask = serviceAttachments.getCITask(resid);
		var uidField = citask.getDetailGrainDef().getIDField();
		var dehir = URLDecoder.decode(URLDecoder.decode(datahierarchies, "utf-8"),"utf-8");
		var uid = getDetailIdValue(dehir, uidField);
		log("showlockinfo", {"citask":resid, "uid":uid, "fileContentField":fileContentField,"dwTable":dwTable, "datahierarchies":datahierarchies, "dahie":dehir});
		var lockObj = queryLockObjInfo(resid, uid, dwTable, fileContentField);
		if(lockObj == null){
			return null;
		}
		
		var currUser = sz.security.getCurrentUser().id;
		if(lockObj.user == currUser){
			return null;
		}
		return lockObj;
	}
	return null;
}

/**
 * @request
 * @param {} req
 * @param {} res
 */
function unlock(req, res){
	var fileContentField = req.fileContentField;
	var citaskid = req.path;
	if(ISDEBUG){
		println("unlock:"+JSON.stringify({"citask":citaskid,"fileContentField":fileContentField, "user":sz.security.getCurrentUser().id}));
	}
	unlockObj(citaskid, null, fileContentField);
}

/**
 * 关闭打开的word时，要自动解锁
 * @param {} citaskPath
 * @param {} formName
 * @param {} wordField
 */
function unlockObj(citaskPath, formName, wordField){
	var lockObj = lockService.createLock();
	lockObj.addReadLocks(conflictTableResource);
	lockObj.lock(TIME_ONE_DAY);
	try{
		var user = sz.security.getCurrentUser().id;
		var ds = sz.db.getDefaultDataSource();
		var sql = "delete from SZ_CUSTOM_CONFLICT where taskid_=? and userid_=? and attachfield_=?";
		ds.update(sql, [citaskPath, user, wordField]);
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

var queryAttach   = BeanGetter.getBean(com.succez.bi.wi.util.WIUtilQueryAttachments);
var attachContent = BeanGetter.getBean(com.succez.bi.wi.util.WIUtilAttachmentContent);

/**
 * 返回工作流中的附件，拷贝自showfile.js两边要保持一致
 * @param {} req
 * @param {} out
 */
function getWiAttachment(req, res, out){
	queryAttach.reset();
	queryAttach.setAttachementId(req.id);
	var attach = queryAttach.singleResult();
	if (attach == null) {
		throw new Error("no found!");
	}
//	String userAgent = request.getHeader("USER-AGENT");
//	response.setHeader("Content-Disposition",
//			"attachment;filename=" + StringEscapeUtils.escapeDownloadFileName(attach.getName(), userAgent));
	attachContent.reset();
	attachContent.setAttachment(attach);
	var content = attachContent.getContent();
	try {
		var fileName = attach.getName();
		var fileExt = StringUtils.lowerCase(FilenameUtils.getExtension(fileName));
		var contentDisposition = "application/msword";
		if(fileExt == "xls" || fileExt == "xlsx"){
			contentDisposition = "application/vnd.ms-excel";
		}
		ActionUtils.setHeaderForDownload(res, req.getHeader("USER-AGENT"), contentDisposition,"utf-8", null, fileName);
		/**
		 * 如果是word，那么以修订模式打开，并且可以保存
		 */
		if(fileExt=="doc" || fileExt == "docx"){
			writeWordByInputStream(content, out, ProtectionType.ALLOW_ONLY_REVISIONS, req.version == "Word.Application.11");
		}else{
			IOUtils.copy(content, out);
		}
	}
	finally {
		content.close();
	}
}

/**
 * 更新工作流中的附件，并且只是法务人员上传的附件，附件存储以修订的方式打开，直接修改工作流对应的附件表，不是通过工作流的方法修改
 * 目前是所有人员的附件，都进行修订存储
 * ACT_GE_BYTEARRAY   
 * 	  ID_、BYTES_
 * ACT_HI_ATTACHMENT
 *    ID_、CONTENT_ID_
 * ACT_HI_ATTACHMENT.CONTENT_ID_ = ACT_GE_BYTEARRAY.ID_   
 */
function updateWIAttachment(id, content){
	var ds = sz.db.getDefaultDataSource();
	var rs = ds.select("select CONTENT_ID_ from ACT_HI_ATTACHMENT where ID_=?", id);
	if(!rs || rs.length == 0 || rs[0].length == 0){
		return "根据“"+id+"”找不到对应的附件ID";
	}
	/**
	 * 2015-1-14 在WIN7下，非管理员点击保存，这样上传的附件是空，这样会导致覆盖以前的附件，故在这里怕判断，如果是0字节的文件，
	 *   不让存储
	 */
	if(content == null || content.available()==0){
		return INFO_WORD_ERROR;
	}
	
	var content_id = rs[0][0]; 
	ds.update("update ACT_GE_BYTEARRAY set BYTES_ = ? where ID_ = ?", [content, content_id]);
	return "success";
}