/*#

#include directive


© 2016 - Guillaume Gonnet
License GPLv2

Sources at https://github.com/ParksProjets/C-Preprocessor

#*/


createDirective("include", function(text) {
	var _this = this;

	// Get the name of the file to include
	var name = text.getNextString();
	if (!name) {
		name = text.getNextStringInclude();
		if (!name)
		{
			this.error('invalid include');
			return _this.next();
		}
	}


	// File to read
	var file = this.path + name;

	let path;
	// If the file is already included and #pragma once
	if (this.parent.includeOnce[file])
		return;

	if (fs.existsSync("./" + file))
		path = "./"
	else
		for (let i of this.options.basePath) {
			if (fs.existsSync(i + file))
				path = i;
			// console.log(i)
		}

	// Read the file asynchronously and parse it
	fs.readFile(path + file, 'utf8', function(err, code) {

		if (err)
		{
			_this.error(`can't read file "${file}"`);
			return _this.next();
			// return _this.error('file not found');
		}


		_this.options.filename = file;
		var processor = new Processor(_this.parent, code);

		// On success: add the file content to the result
		processor.onsuccess = function() {
			processor.onsuccess = null;

			var e = '';
			for (var i = 0, l = _this.options.includeSpaces; i < l; i++)
				e += _this.options.newLine;

			_this.addLine(e + processor.result.trim() + e);

			_this._compConst('FILE', _this.currentFile);
			_this.next();
		};

		processor.onerror = function() {
			processor.onerror = null;
			_this.next();
		}

		processor.run();
	});


	// Block the synchronous loop
	return false;
});
