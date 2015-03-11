function afterbatchaudit(args) {
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
					var row = row.next();
					results = groupByAuditResults(formResult.getAuditExpAuditResults());
					writeResults(bsdw, key, row.getKey(), keyname, table, results, dwDataUpdate);
				}
			}
		}
	}
}

function groupByAuditResults(expAuditResults) {
	var results = new java.util.HashMap();
	for (var i = 0; i < expAuditResults.size(); i++) {
		var item = expAuditResults.get(i);
		if (item.getAuditTag() != 1) {
			var catalog = item.getCompileInf().getAuditExp().getCatalog();
			var catalogs = results[catalog];
			if (!catalogs) {
				catalogs = results[catalog] = [];
			}
			catalogs.push(item);
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
	println('bsdw=' + bsdw + ';key=' + key + ';fkey=' + fkey + ';keyname=' + keyname + ';table=' + table + ';error=' + results.keySet().size());
	var keySet = results.keySet();
	while (keySet.hasNext()) {
		var catalog = keySet.next();
		var value = results.get(catalog);
		var row = {};
		row.ID = fkey == null ? key : fkey;
		row.KEY = key;
		row.PROTYPE = catalog;
		row.TABLE = table;
		row.GXGSS = bsdw;
		row.ERROR = value.size();
		row.KEYNAME = keyname;
		dwDataUpdate.addRow(row);
	}
}