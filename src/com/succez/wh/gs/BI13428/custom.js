function afterbatchaudit(args) {
	println("=============afterbatchaudit=============================================");
	println("=============afterbatchaudit=============================================");
	var dwDataUpdate = getDwDataUpdate();
	var result = args.result;
	println(result);
	var notPassed = result.getNotPassedResults();
	for (var i = 0; i < notPassed.size(); i++) {
		var formsResults = notPassed.get(i);
		var bsdw = formsResults.getDataHierarchies().split('&')[0].split('=')[1];
		var values = formsResults.getProperty('exportColumnValues');
		var key = values.get(0);
		var keyname = values.get(1);
		var formResults = formsResults.getFormDataAuditResults();
		for (var k = 0; k < formResults.size(); k++) {
			var formResult = formResults.get(k);
			var table = formResult.getCompileInf().getName();
			var results = groupByAuditResults(formResult.getAuditExpAuditResults());
			
			writeResults(bsdw, key, null, keyname, table, results, dwDataUpdate);
			var frs = formResult.getFloatAreaDataAuditResults();
			var keys = frs.keySet().iterator();
			while (keys.hasNext()) {
				var f = keys.next();
				var fr = frs.get(f);
				table = fr.getCompileInf().getFloatCellInf().getDbfieldinf().getTableName();
				var rows = fr.listRows();
				while (rows.hasNext()) {
					var row = rows.next();
					results = groupByAuditResults(row.getAuditExpAuditResults());
					writeResults(bsdw, key, row.getKey(), keyname, table, results, dwDataUpdate);
				}
			}
		}
	}
}

function groupByAuditResults(expAuditResults) {
	var results = {};
	for (var i = 0; i < expAuditResults.size(); i++) {
		var item = expAuditResults.get(i);
		if (item.getAuditTag() != 1) {
			var catalog = item.getCompileInf().getAuditExp().getCatalog();
			var catalogs = results[catalog];
			if (!catalogs) {
				results[catalog] = catalogs = [];
			}
			catalogs.push(item);
			println("catalogs:"+Object.keys(catalogs));
		}
	}
	return results;
}

function getDwDataUpdate() {
	var beanGetter = com.succez.commons.service.springmvcext.BeanGetterHolder.getBeanGetter();
	var dwDataUpdate = beanGetter.getBean(com.succez.bi.dw.dwdata.DwDataUpdateUtility);
	dwDataUpdate.setDimpath('sjzl:/datamodels/事实表/F_DETAILS');
	return dwDataUpdate;
}

function writeResults(bsdw, key, fkey, keyname, table, results, dwDataUpdate) {
	println('bsdw=' + bsdw + ';key=' + key + ';fkey=' + fkey + ';keyname=' + keyname + ';table=' + table + ';error=' + Object.keys(results).length);
	var keys = Object.keys(results);
	println("writeResults:"+keys);
	for(var i=0; keys && i<keys.length; i++){
		var catalog = keys[i];
		var value = results[catalog];
		var row = {};
		row.ID = fkey == null ? key : fkey;
		row.KEY = key;
		row.PROTYPE = catalog;
		row.TABLE = table;
		row.GXGSS = bsdw;
		row.ERROR = value.length;
		row.KEYNAME = keyname;
		println("row:"+JSON.stringify(row))
		dwDataUpdate.addRow(row);
	}
}