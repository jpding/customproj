var BeanGetter = com.succez.commons.service.springmvcext.BeanGetterHolder.getBeanGetter();
var PortalPathTransformer  = com.succez.bi.portal.utils.PortalPathTransformer;
var PortalViewXmlParser    = com.succez.bi.portal.pages.portal.PortalViewXmlParser;

var login = BeanGetter.getBean(com.succez.security.api.session.Login);
var repo  = BeanGetter.getBean(com.succez.metadata.api.MetaRepository);
var resourceBrowser = BeanGetter.getBean(com.succez.security.api.restree.ResourceBrowser);
var expContextFactory = BeanGetter.getBean(com.succez.security.api.LoginExpContextFactory);

function main(args){
	println(login.getUser());
	//println(login.getUser().getPermissionChecker());
	var entity = repo.getMetaEntity("LAWCONT:/analyses/index/portal_busiflow");
	var doc = getResolvedViewDocument(entity);
	println(getSelectedId(doc, null));
	
	var dd = {};
	dd["a"] = "dd";
	dd["v"] = "123";
	
	var test = [];
	test.push(dd);
	
	var mapper = new ObjectMapper();
	println(mapper.writeValueAsString(test));
}

/**
 * 显示默认首页
 * @param {} req
 * @param {} res
 * @return {String}
 */
function execute(req, res){
	var entity = repo.getMetaEntity("LAWCONT:/analyses/index/portal_zlbzb");
	var doc = getResolvedViewDocument(entity);
	var selectid = getSelectedId(doc, null);
	var selectedItem = getSelectedItem(doc, selectid);
	var portalData = new CustomPortalData(req, selectedItem);
	res.attr("itemMenus", portalData.listMenus());
	return "home.ftl";
}

/**
 * 点击顶上的TabSet时，显示左边树节点
 * @param {} req
 * @param {} res
 * @return {String}
 */
function lefttree(req, res){
	var path = req.path;
	var entity = repo.getMetaEntity(path);
	var doc = getResolvedViewDocument(entity);
	var selectedId = getSelectedId(doc, null);
	var selectedItem = getSelectedItem(doc, selectedId);
	var portalData = new CustomPortalData(req, selectedItem);
	var showtype = req.getParameter("showtype");
	res.attr("showtype", showtype);
	if(showtype == "tree"){
		res.attr("treedata", portalData.getJTreeData());
	}else{
		res.attr("itemMenus", portalData.listMenus());
	}
	
	return "leftree.ftl";
}

/**
 * 根据门户实体返回解析后doc对象，解析：
 * 1.根据用户权限，只返回该用户能查看的内容
 * 2.根据门户节点的显示隐藏条件，删除掉隐藏的节点
 * @param {} entity
 * @return {}
 */
function getResolvedViewDocument(entity){
	var doc = entity.readContent().asDocument();
	doc = new PortalPathTransformer(repo, false).perform(doc, entity.getPath());
	var parser = new PortalViewXmlParser(resourceBrowser, login.getUser(),
														  expContextFactory.getLoginExpContext());
	var checker = login.getUser().getPermissionChecker();
	parser.setCheckPermissionEnabled(checker.check(entity.getPath(),"referer", false).isForbidden());
	parser.setSyncEnabled(true);
	parser.setRemoveEmptyItemEnabled(true);
	parser.setUseViewId(true);
	doc = parser.parse(doc);
	return doc;
}

/**
 * 根据门户节点id获取相应门户节点对象
 * @param {} doc
 * @param {} selectedId
 * @return {}
 */
function getSelectedItem(doc, selectedId){
	var nodes = doc.selectNodes("//item[@id='" + selectedId + "']");
	if (nodes.size() == 0)
		selectedElem = doc.selectNodes("//item[@id='root']").get(0);
	else
		selectedElem = nodes.get(0);
	return selectedElem;
}	

/**
 * 获取门户默认的展开节点，如果门户没有设置默认的展开节点，那么就设置第一个节点
 * 为默认的展开节点
 * @param {} doc
 * @param {} selectedId
 * @return {}
 */
function getSelectedId(doc, selectedId) {
	var elem = null;
	/*
	 * 1. 如果当前请求参数的ID存在且有效，那么使用该ID，否则进行下一步
	 * 2. 如果当前cookie中存在ID且有效，那么使用该ID，否则进行下一步
	 * 3. 读取配置中选中的节点并返回
	 * 4. 找到第一个节点并返回
	 */
	if (selectedId != null)
		elem = doc.selectSingleNode("//item[@id='" + selectedId + "']");
	
	if (elem == null) {
		var selectNodes = doc.selectNodes("//item/properties/selected");
		for (var i=0; i<selectNodes.size(); i++) {
			var selectNode = selectNodes.get(i);
			if (true == selectNode.getText()) {
				elem = selectNode.getParent().getParent();
				break;
			}
		}
	}
	
	if (elem == null){
		var firstNode = doc.selectSingleNode("//item[count(children)=0]");
		if (firstNode == null) {
			var children = doc.selectSingleNode("//item/children[count(item)=0]");
			if (children != null)
				firstNode = children.getParent();
		}
		
		elem = firstNode;
	}
	
	/*
		 * 根据当前选中节点，找到它的子节点中被选中的那个节点。比如选中了一个目录，他的子节点设置了选中，那么
		 * 选中该子节点。
		 */
	if (elem != null) {
		var nodes = elem.selectNodes(".//item/properties/selected");
		for (var i=0; i<nodes.size(); i++) {
			var selectNode = nodes.get(i);
			if ("true" == selectNode.getText()) {
				elem = selectNode.getParent().getParent();
				break;
			}
		}
	}
	
	return elem.attributeValue("id");
}

/**
 * 获取门户的根节点，参考门户XML格式
 * @param {} doc
 * @return {}
 */
function getDocRoot(doc){
	var elem = doc.selectSingleNode("//container");
	var itemList = elem.elements("item");
	for(var i=0; i<itemList.size(); i++){
		var node = itemList.get(i);
		var vv = node.attributeValue("id");
		if("root" == vv){
			return node;
		}
	}
	
	return null;
}

/**
 * ZTreeWrite
 */
var ArrayList = java.util.ArrayList;
var HashMap   = java.util.HashMap;
var HashSet   = java.util.HashSet;
var Collections = java.util.Collections;

var PortalUtils = com.succez.bi.portal.utils.PortalUtils;
var StringUtils = com.succez.commons.util.StringUtils;
var StringEscapeUtils = com.succez.commons.util.StringEscapeUtils;
var WebUtils = com.succez.commons.util.WebUtils;
/**
 * var nodes = [
 *		{name: "父节点1", children: [
 *			{name: "子节点1"},
 *			{name: "子节点2"}
 *		]}
 *	];
 */
function ZTreeWrite(req, root, selectedElem){
	this.req = req;
	this.rootElem = root;
	this.selElem  = selectedElem; 
	
	this.selectedId = "";
	if(this.selElem != null){
		this.selectedId = this.selElem.attributeValue("id");
	}
	
	this.result = [];
	this.expandIds = new HashSet();
	
	this.init();
}

ZTreeWrite.prototype.writeJson = function(){
	var childNodes = this.rootElem.element("children");
	if(childNodes == null)
		return this.result;
	var nodes = childNodes.elements("item");
	if(nodes == null || nodes.size() == 0)
		return this.result;
	
	for(var i=0; i<nodes.size(); i++){
		var node = nodes.get(i);
		var itemObj = this.write(node);
		this.result.push(itemObj);
	}
	return this.result;
}

ZTreeWrite.prototype.write = function(elem){
	var propNode = elem.element("properties");
	var propMap = this.writeProp(elem.attributeValue("id"), propNode);
	var childNodes = elem.element("children");
	if(childNodes == null){
		return propMap;
	}
	
	var nodes = childNodes.elements("item");
	if(nodes == null || nodes.size() == 0)
		return propMap;
	
	var children = [];
	for(var i=0; i<nodes.size(); i++){
		var node = nodes.get(i);
		var itemObj = this.write(node);
		children.push(itemObj);
	}
	
	propMap["children"] = children;
	
	return propMap;
}

ZTreeWrite.prototype.getJTreeData = function(){
	var mapper = new org.codehaus.jackson.map.ObjectMapper();
	var result = this.writeJson();
	return mapper.writeValueAsString(result);
}

ZTreeWrite.prototype.writeProp=function(id , propElem){
	var prop = {};
	var path = propElem.elementText("path");
	prop["name"] =  propElem.elementText("caption");
	prop["id"]   = id;
	
	//prop.put("icon", propElem.elementText("icon"));
	if(StringUtils.isNotEmpty(path)){
		prop["url"] = this.getUrl(propElem, id, path);
		prop["target"] = "navTab";
		prop["path"] = path;
	}
	
//		prop.put("target", "_self");
	if(this.expandIds.contains(id)){
		prop["open"] = "true";
	}
	
	if(this.selectedId == id){
		prop["selected"] = "true";	
	}
	
	return prop;
}

ZTreeWrite.prototype.getUrl = function(propElem, id, path){
	var  buffer = new java.lang.StringBuilder();
//		buffer.append("/home/").append(path.replace(":/", "/"));
//		buffer.append("?selectedId=").append(id);
	var enPath = StringEscapeUtils.encodeParamValue(StringEscapeUtils.escapeJavaScript(path));
	buffer.append(WebUtils.getContextPath(this.req)).append("meta/LAWCONT/analyses/index/newhome/showcontent.action?path=").append(enPath);
	
	this.getParams(propElem, buffer);
	
	return buffer.toString();
}


ZTreeWrite.prototype.getParams = function(propElem, buffer) {
	var params = propElem.elementText("params");
	var map = new java.util.HashMap();
	StringUtils.parseKeyValuePairs(params, map);
	PortalUtils.mergeRequestParams(this.req, map);
	var keys = map.keySet().toArray();
	for(var i=0; i<keys.length; i++){
		var key = keys[i];
		if(key == "method"){
			continue;
		}
		buffer.append('&').append(key).append('=').append(StringEscapeUtils.encodeParamValue(map[key]));
	}
}
	
ZTreeWrite.prototype.init = function(){
	if(this.selElem == null)
		return ;
	
	var rootid = this.rootElem.attributeValue("id");
	var id = this.selElem.attributeValue("id");
	this.expandIds.add(id);
	var parent = this.selElem.getParent();
	while(parent != null){
		var name = parent.getName();
		if("item" != name){
			parent = parent.getParent();
			continue;
		}
		id = parent.attributeValue("id");
		if(StringUtils.equalsIgnoreCase(rootid, id)){
			break;
		}
		
		this.expandIds.add(id);
		
		parent = parent.getParent();
	}
}

/**
 * =====================================================================
 */
var ObjectMapper = org.codehaus.jackson.map.ObjectMapper;

function CustomPortalData(req, selectedItem){
	this.selItem = selectedItem;
	this.req = req;
}

CustomPortalData.prototype.getJTreeData = function(){
	var mapper = new ObjectMapper();
	var doc = this.selItem.getDocument();
	var root = getDocRoot(doc);
	var writer = new ZTreeWrite(this.req, root, this.selItem);
	var result = writer.writeJson();
	return mapper.writeValueAsString(result);
}

CustomPortalData.prototype.listMenus = function(){
	var items = [];
	var doc = this.selItem.getDocument();
	var root = getDocRoot(doc);
	
	var childNodes = root.element("children");
	if(childNodes == null)
		return Collections.EMPTY_LIST;
	var nodes = childNodes.elements("item");
	if(nodes == null || nodes.size() == 0)
		return Collections.EMPTY_LIST;
	
	for(var i=0; i<nodes.size(); i++){
		var node = nodes.get(i);
		var writer = new ZTreeWrite(this.req, node, null);
		var id = node.attributeValue("id");
		var caption =  node.element("properties").elementText("caption");
		var item = {"id":id, "caption":caption, "treeData":writer.getJTreeData()};
		items.push(item);
	}
	
	return items;
}

/*
 * =========================================================================================================
 * 测试
 */
function testWrite(){
	
}

function testPortalData(req, res){
	var entity = repo.getMetaEntity("LAWCONT:/analyses/index/portal_func");
	var doc = getResolvedViewDocument(entity);
	var selectid = getSelectedId(doc, null);
	var selectedItem = getSelectedItem(doc, selectid);
	var portalData = new CustomPortalData(req, selectedItem);
	var treeData = portalData.listMenus();
}