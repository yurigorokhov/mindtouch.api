java \
 	-jar google-compiler-20100917.jar \
 	--js ../src/string.js \
 	--js ../src/util.js \
 	--js ../src/pagebus.js \
 	--js ../src/plug.js \
 	--js ../src/property.js \
 	--js_output_file ../dist/mindtouch.api.js
cp ../redist/* ../dist