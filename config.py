
# Network settings:

# Use ssh to map port 8013 to remote:
# ssh -N -f user@xxx.xxx.xxx.xxx -L 8013:localhost:8013
IMG_URL = 'http://localhost:8013/renderToken?token='
PORT = 7142

# Web app settings:

PART_DIR = './template_parts'
TMPL_DIR = './templates'

JS_TMPL_FILE = './template_parts/js/kitty.js'
JS_FILE = './static/js/kitty.js'

# Whether to use files in TMPL_DIR and JS_FILE directly.
STATIC = False

URLS = {
	'index': '首页',
	'sale': '猫猫售卖',
	'my': '我的猫猫',
	'cat': '猫猫详情',
	'err': '错误',
}
