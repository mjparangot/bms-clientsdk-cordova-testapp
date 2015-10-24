all:
	make clean && make add
all_ios:
	make clean && make add && make run_ios
all_droid:
	make clean && make add && make run_droid
list:
	cordova plugin list
add:
	cordova plugin add ../mfpcore-development/mfpcore-plugin
	cordova plugin add ../mfppush-development/mfppush-plugin
clean:
	cordova plugin remove ibm-mfp-core
	cordova plugin remove ibm-mfp-push
pf_ios:
	cordova platform add ios
pf_droid:
	cordova platform add android
build_droid:
	cordova build android
build_ios:
	cordova build ios
build: build_droid build_ios
	cordova build ios
run_droid:
	cordova run android
run_ios:
	cordova run ios
test_droid:
	mv config.xml bak_config.xml
	sed 's/content src="index.html"/content src="cdvtests\/index.html"/g' bak_config.xml >> config.xml
	cordova run android
	rm config.xml
	mv bak_config.xml config.xml
test_ios:
	mv config.xml bak_config.xml
	sed 's/content src="index.html"/content src="cdvtests\/index.html"/g' bak_config.xml >> config.xml
	cordova run ios
	rm config.xml
	mv bak_config.xml config.xml
