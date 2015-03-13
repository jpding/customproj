<#--
20140923 guob
ISSUE:LAWCONT-38
在线编辑word文档
menubar必须设置为1，即显示menubar，否则会出现一个黑线，然后无法编辑文档，不清楚为什么
@depends sz.commons.html,sz.commons.html.head,sz.commons.html.body
-->
<@sz.commons.htmlDirective>
	<@head>
		<title>word</title>
		<link rel="stylesheet" href="css/jquery.jgrowl.min.css" type="text/css" media="screen"/>
		<style>
			.sz-ci-wsoffice,
			.sz-ci-wsoffice-plugs{
				width:100%;
				height:100%;
			}
			
			.sz-ci-div-title{
				padding-top : 5px;
				background-color : #F0F0F0;
			}
			
			.sz-ci-div-title-caption{
				padding-top : 10px;
				color : #004797;
				font-size : 22px;
				height : 40px;
				padding-left : 26px;
				text-algin : left;
			}
		</style>
	</@head>
	<@body>
		<@script src="js/office.js"/>
		<@script src="js/jquery.jgrowl.min.js"/>
		<div class="sz-ci-div-title-caption">
			沪东中华造船（集团）有限公司电子签章系统
		</div>
		<div class="sz-ci-div-title" style="display:none;">
			<@sz.commons.button icon="sz-app-icon-setup" caption="参数设置" onclick="_signatureSetup()"/>
			<@sz.commons.button icon="sz-app-icon-run" caption="批量验证" onclick="_signatureHandSign()"/>
			<@sz.commons.button icon="sz-app-icon-add2" caption="电子签章" onclick="_signature()"/>
			<@sz.commons.button icon="sz-app-icon-save" caption="保存" onclick="saveWord()"/>
		</div>
		<form name=webform  method=post style="height:0;">
			<OBJECT id="SignatureAPI" width="0" height="0" classid="clsid:79F9A6F8-7DBE-4098-A040-E6E0C3CF2001" codebase="iSignatureAPI.ocx#version=8,0,0,0"></OBJECT>																																				 
		</form>
		<div class="sz-ci-wsoffice" data-szclass="sz.ci.WSOffice">
			<OBJECT id="wsofficeobject" class="sz-ci-wsoffice-plugs" data-namespace='${namespace!""}' codeBase="${url('/static-file/wsoffice/wsoffice(2,3,0,1).cab#version=2,3,0,1')}" classid="clsid:33A018F5-DF85-4D66-9C66-4E5BB0360092">
				<PARAM NAME="Titlebar" VALUE="0">
				<PARAM NAME="Toolbars" VALUE="1">
				<PARAM NAME="Menubar" VALUE="1">
			</OBJECT>
			<@script>
				ext = '${ext!"doc"}';
				method = '${method!""}';
				savemethod   = '${savemethod!""}';
				rurl = '${rurl!""}';
				
				var wsOffice = $$(".sz-ci-wsoffice");
				
				$(window).bind("beforeunload", function(){
					if(ext == "xls" || ext== "xlsx"){
						return ;
					}
					
					if(wsOffice.isDirty()){
						return "文档已修改，您还未保存!";
					}
				});
				
				$(window).unload(function(){
					wsOffice.closeFile();
				});
				
				window._signature = function(){
				    webform.SignatureAPI.ActiveDocument=wsofficeobject.ActiveDocument;
					webform.SignatureAPI.ActionAddinButton(0x00000001);
					webform.SignatureAPI.ReleaseActiveDocument();
				};
				
				window._signatureSetup = function(){
					webform.SignatureAPI.ActiveDocument=wsofficeobject.ActiveDocument;
					webform.SignatureAPI.DoAction(4,"");
					webform.SignatureAPI.ReleaseActiveDocument();
				};
				
				window._signatureHandSign = function(){
					webform.SignatureAPI.ActiveDocument=wsofficeobject.ActiveDocument;
					webform.SignatureAPI.DoAction(3,"");
					webform.SignatureAPI.ReleaseActiveDocument();
				};
				
				window.saveWord = function(){
					wsOffice.saveToServer();
				};
			</@script>
		</div>
		
		<iframe id="ifm" style="width:500px;height:500px;right:0px;top:0px;position:absolute;display:none;">
		</iframe>
	</@body>
</@sz.commons.htmlDirective>