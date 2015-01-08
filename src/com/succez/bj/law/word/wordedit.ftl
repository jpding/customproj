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
		</style>
	</@head>
	<@body>
		<@script src="js/office.js"/>
		<@script src="js/jquery.jgrowl.min.js"/>
		
		<div class="sz-ci-wsoffice" data-szclass="sz.ci.WSOffice">
			<OBJECT id="wsofficeobject" class="sz-ci-wsoffice-plugs" data-namespace='${namespace!""}' codeBase="${url('/static-file/wsoffice/wsoffice(2,3,0,1).cab#version=2,3,0,1')}" classid="clsid:33A018F5-DF85-4D66-9C66-4E5BB0360092">
				<PARAM NAME="Titlebar" VALUE="0">
				<PARAM NAME="Toolbars" VALUE="1">
				<PARAM NAME="Menubar" VALUE="1">
			</OBJECT>
			<@script>
				method = '${method!""}';
				var wsOffice = $$(".sz-ci-wsoffice");
				$(window).unload(function(){
					wsOffice.closeFile();
				})
			</@script>
		</div>
	</@body>
</@sz.commons.htmlDirective>
