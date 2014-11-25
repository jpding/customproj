<#--
@depends sz.commons.outputJses,sz.custom.law.navtree2
-->
<div class="accordion" fillSpace="sideBar">
	<#if showtype="tree">
		<div class="accordionContent">
			<@navtree treedata=treedata/>
		</div>
	<#else>
		<@navtree2 menus=itemMenus/>
	</#if>
	<@sz.commons.outputJses />
</div>

<#macro navtree treedata>
	<div id="navtree" style="width:100%;height:100%">
		<ul id="navtreedom">
		
		</ul>
	</div>
	<@script>
		var ulDom = $("#navtreedom");
		var data = ${treedata};
		var selectedNode = null;
		var tree = sz.commons.JTree.create({
			pdom:ulDom,
			data:data,
			view : {
				addDiyDom : function(treeId, treeNode){
					if(treeNode.url){
						var a = $("#"+treeNode.tId+"_a");
						a.attr("external", "true");
						a.attr("rel", treeNode.tId);
					}
					
					if(treeNode.selected){
						selectedNode = treeNode; 
					}
				}
			}
		});
		
		if(selectedNode){
			tree.selectNode(selectedNode);
			var title = selectedNode.name;
			var tabid = selectedNode.tId;
			var url = selectedNode.url;
			navTab.openTab(tabid, url,{title:title, fresh:true, external:true});
		}
	</@script>
</#macro>

<#macro navtree2 menus>
	<#list menus as item>
	<div class="accordionHeader">
		<h2><span>Folder</span>${item.caption}</h2>
	</div>
	
	<div class="accordionContent">
		<div id="p_${item.id}" class="navtree" style="width:100%;height:100%">
			<ul id="${item.id}" class="navtreedom">
			
			</ul>
		</div>
	</div>
	<@script>
		var ulDom = $("#${item.id}");
		var data = ${item.treeData};
		var tree = sz.commons.JTree.create({
			pdom:ulDom,
			data:data,
			view : {
				addDiyDom : function(treeId, treeNode){
					if(treeNode.url){
						var a = $("#"+treeNode.tId+"_a");
						a.attr("external", "true");
						a.attr("rel", treeNode.tId);
					}
				}
			}
		});
	</@script>
	</#list>
</#macro>
