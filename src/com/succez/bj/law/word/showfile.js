var BeanGetter = com.succez.commons.service.springmvcext.BeanGetterHolder.getBeanGetter();

var serviceAttachments = BeanGetter.getBean(com.succez.bi.ci.impl.mgr.CIServiceAttachmentsImpl);
var dataPackageUtil    = BeanGetter.getBean(com.succez.bi.ci.impl.mgr.datapackage.DataPackageUtil);
var mgr = BeanGetter.getBean(com.succez.commons.jdbc.ConnectionFactoryManager);
var sf  = BeanGetter.getBean(com.succez.commons.jdbc.sql.SQLFactory);
var queryAttach   = BeanGetter.getBean(com.succez.bi.wi.util.WIUtilQueryAttachments);
var attachContent = BeanGetter.getBean(com.succez.bi.wi.util.WIUtilAttachmentContent);
var uas = BeanGetter.getBean(com.succez.commons.util.domain.UserAgentService);

var MyByteArrayOutputStream = com.succez.commons.util.io.MyByteArrayOutputStream;
var MyByteArrayInputStream  = com.succez.commons.util.io.MyByteArrayInputStream;
var FilenameUtils    = com.succez.commons.util.FilenameUtils;
var IOUtils   = com.succez.commons.util.io.IOUtils;
var ContentTypeUtils = com.succez.commons.util.ContentTypeUtils;

var StringUtils = com.succez.commons.util.StringUtils;
var FileUtils = com.succez.commons.util.io.FileUtils;
var ContentTypeUtils = com.succez.commons.util.ContentTypeUtils;
var CIMetaConsts = com.succez.bi.ci.meta.CIMetaConsts;

var ProtectionType = com.aspose.words.ProtectionType;
var URLDecoder = java.net.URLDecoder;
var URLEncoder = java.net.URLEncoder;

/**
 * 在线显示表单、事实表中附件，支持word、pdf、图片等
 * 
 * 2015-1-14 添加在审批意见中直接在线打开内容的功能，审批意见中的附件下载，见ActionWIApi/attachements
 */
function execute(req, res){
	var myOut = new MyByteArrayOutputStream();
	try{
		var filename = "";
		var id = req.id;
		var resid = req.path;
		if(StringUtils.isNotBlank(id)){
			/**
			 * id不为空，有可能是工作流中的附件，工作流中的附件只有一个id，并且没有其他参数
			 */
			if(StringUtils.isNotBlank(resid)){
				var citask = serviceAttachments.getCITask(resid);
				var attachmentObj = {};
				getContractInputStreamByDraft(citask, id, myOut, attachmentObj);
				filename = attachmentObj.name;
			}else{
				filename = getWiAttachment(req, myOut);
			}
		}else{
			var attachmentInf = getAttachment(req, myOut);
			filename = attachmentInf.getFilename();
		}
		
		var ext = FilenameUtils.getExtension(filename);
		var contentType = ContentTypeUtils.getContentType(ext);
		if(ext == "doc" || ext == "docx" || ext == "xls" || ext=="xlsx"){
			/**
			 * 如果是上传，并且是草稿，那么那就直接打开，但对于范本合同，应该只读打开
			 */
//			res.attr("downloadtype",ProtectionType.READ_ONLY);
//			res.attr("method", "downloadFormWord");
//			res.attr("ext", ext);
			var ppt = req.getParameterMap();
			var keys = ppt.keySet().toArray();
			var queryString = [];
			for(var i=0 ; i<keys.length ; i++){
				queryString.push(keys[i]+"="+req.getParameter(keys[i]));
			}
			println("querystring:"+queryString.join("&"));
			return "redirect:/meta/LAWCONT/others/word/wordedit.action?mth=downloadFormWord&ext="+ext+"&"+queryString.join("&");
		}else if(ext == "pdf"){
			res.setContentType(contentType);
			showPdf(res, myOut);
		}else if(contentType.indexOf("image")>-1){
			res.setContentType(contentType);
			showPdf(res, myOut);
		}else{
			res.addHeader("Content-Disposition", "attachment;filename="+URLEncoder.encode(filename,"UTF-8"));
			showPdf(res, myOut);
		}
	}finally{
		myOut.close();
	}
}

/**
 * 直接显示图片大小，需要判断图片的大小，如果超过一屏幕，应该显示设置图片的最佳大小
 */
function showImage(res, attachment){
	
}

/**
 * 如果是IE8，那么进行转换显示，如果安装有插件，那么自动调用本地插件显示，反之则转换
 * 成html显示，
 * @param {} res
 */
function showPdf(res, myOut){
	var out = res.getOutputStream();
	try{
		var input = myOut.asInputStream();
		IOUtils.copy(input, out);
	}finally{
		out.close();
	}
}

/**
 * 使用插件打开，并且以只读模式打开
 * @param {} res
 */
function showWord(res, attachment){
	
}

/**
 * 返回工作流中的附件
 * @param {} req
 * @param {} out
 */
function getWiAttachment(req, out){
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
		IOUtils.copy(content, out);
		return attach.getName();
	}
	finally {
		content.close();
	}
}

/**
 * 获取采集中的
 */
function getAttachment(req, out){
	var resid = req.path;
	var datahierarchies = req.datahierarchies;
	println("datahierarchies:"+datahierarchies);
	
	var dedatahierarchies = URLDecoder.decode(datahierarchies, "utf-8");
	println("datahierarchies:"+dedatahierarchies);
	
	var dataperiod = req.dataperiod;
	var rowKey = req.rowKey;
	var dwTable = req.dwTable;
	var fileContentField = req.fileContentField;
	var fileNameField    = req.fileNameField;
	var citask = serviceAttachments.getCITask(resid);
	
	var attachmentInf = serviceAttachments.getAttachment(citask, dataperiod, dedatahierarchies, rowKey,
		dwTable, fileContentField, fileNameField, out);
	
	return attachmentInf;
}

/**
 * 拷贝自wordedit.js，注意两边保持同步
 */
function getContractInputStreamByDraft(task, id, myOut, attachmentObj){
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
	}
	finally {
		com.succez.commons.jdbc.impl.JdbcUtils.closeQuietly(conn, ps, rs);
	}
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