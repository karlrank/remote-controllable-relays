

# Getting sqlite3 and electron to behave nicely

Commands to build 
```
cd node_modules/sqlite3
npm run prepublish
node-gyp configure --module_name=node_sqlite3 --module_path=../lib/binding/node-v47-win32-x64
node-gyp rebuild --target=0.36.0 --arch=x64 --target_platform=win32 --dist-url=https://atom.io/download/atom-shell --module_name=node_sqlite3 --module_path=../lib/binding/node-v47-win32-x64
```

Possible package.json content for automatic rebuilding
```
"scripts": {
"postinstall": "npm run rebuild-sqlite3",
"rebuild-sqlite3": "cd node_modules/sqlite3 &amp;&amp; npm run prepublish &amp;&amp; node-gyp configure --module_name=node_sqlite3 --module_path=../lib/binding/node-v43-darwin-x64 &amp;&amp; node-gyp rebuild --target=0.27.1 --arch=x64 --target_platform=darwin --dist-url=https://atom.io/download/atom-shell --module_name=node_sqlite3 --module_path=../lib/binding/node-v43-darwin-x64"
},
```

# Running test using electron
Run `electron .` in the root of the project.