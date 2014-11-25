<#--
@depends sz.commons.html,sz.metadata.resource,sz.commons.outputCsses
-->
<@sz.commons.htmlDirective>
	<head>
		<@sz.commons.html.head.meta/>
		<@sz.metadata.resource.importResourceDepends path=respath params=params/>
		<#-- 输出控件样式，需要在动态引入控件之后进行，否则动态引入的控件无效 -->
		<@outputCsses/>
	</head>
	
	<@sz.commons.html.body>
		<style>
			.portal-layout-content {
				width:100%;
				height:100%;
			}
		</style>
		<div class="portal-layout-content">
			<@sz.metadata.resource path=respath params=params showiniframe=false/>
		</div>
	</@sz.commons.html.body>
</@sz.commons.htmlDirective>