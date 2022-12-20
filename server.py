# -*- coding: utf-8 -*-

from flask import Flask, request as fl_req, abort as fl_abort,\
	render_template, redirect, make_response

import urllib.parse
import os
import requests
import base64

from cat_info.check_cat import getGene
from cat_info.config import CONTRACT_ADDR

from config import *

from utils import COLORS, NAMES


def get_cat_id(cat_id):
	if cat_id and cat_id[0] == '#':
		cat_id = cat_id[1:]

	try:
		c = int(cat_id)
		return cat_id
	except Exception as e:
		pass

	x = cat_id.split(' ')
	if any(i not in NAMES for i in x):
		return None

	n = len(NAMES)
	cid = 0
	for i in reversed(x):
		cid = cid * n + NAMES.index(i)

	for i in range(len(x)):
		cid += (n ** i)

	print('Parsed:', cid)
	return str(cid)


def url_get(url):
	template = f'{url}.html'
	args = fl_req.args
	print(url, args)
	title = 'DreamKittens'
	if 'cat_id' in args and url == 'cat':
		err_msg = urllib.parse.quote_plus('找不到猫猫 ' + args['cat_id']);
		cat_id = get_cat_id(args['cat_id'])
		if cat_id is None:
			return redirect('err?msg='+err_msg)
		color = COLORS[int(cat_id) % len(COLORS)]
		title = f'猫猫 #{cat_id} - {title}'
		return render_template(template, cat_id = cat_id, err_msg = err_msg, color = color, title = title)
	if 'msg' in args and url == 'err':
		title = f'错误 - {title}'
		return render_template(template, msg = args['msg'], title = title)

	page_name = URLS.get(url, '')
	title = f'{page_name} - {title}'
	return render_template(template, title = title)


def main_get():
	return redirect('/index')


def show_img(fname):
	if not fname.endswith('.png'):
		fl_abort(404)

	try:
		cat_id = int(fname[:-4])
		assert cat_id > 0, 'cat_id < 0'
	except Exception as e:
		print(e)
		fl_abort(404)

	fname = f'./img_cache/{cat_id}.png'
	if os.path.isfile(fname):
		with open(fname, 'rb') as f:
			res = f.read()
	else:
		try:
			token = getGene(cat_id)
		except Exception as e:
			print(e)
			fl_abort(504)
		try:
			res = requests.get(f'{IMG_URL}{token}')
			res = base64.b64decode(res.content)
			# print(res[:100])
		except Exception as e:
			print(e)
			fl_abort(504)
		with open(fname, 'wb') as f:
			f.write(res)
	response = make_response(res)
	response.headers['Content-Type'] = 'image/png'
	return response


def main():
	if not STATIC:
		l = os.listdir(PART_DIR)
		header = ''
		body = ''
		try:
			with open(f'{PART_DIR}/header_part.html', 'r', encoding = 'utf-8') as f:
				tmp = f.read()
				header = tmp
		except Exception as e:
			print(e)

		try:
			with open(f'{PART_DIR}/body_part.html', 'r', encoding = 'utf-8') as f:
				tmp = f.read()
				body = tmp
		except Exception as e:
			print(e)

		for i in l:
			if i.endswith('_temp.html'):
				with open(f'{PART_DIR}/{i}', 'r', encoding = 'utf-8') as f:
					res = f.read()
				# print(res)
				res = res.replace('$$header$$', header)
				res = res.replace('$$body$$', body)
				j = i[:-10] + '.html';
				with open(f'{TMPL_DIR}/{j}', 'w', encoding = 'utf-8') as f:
					f.write(res)

		try:
			with open(f'{JS_TMPL_FILE}', 'r', encoding = 'utf-8') as f:
				res = f.read()
			if '{{address}}' in res:
				res = res.replace('{{address}}', CONTRACT_ADDR)
				with open(f'{JS_FILE}', 'w', encoding = 'utf-8') as f:
					f.write(res)
		except Exception as e:
			print(e)

	app = Flask(__name__)
	# app._static_folder = './static'

	app.add_url_rule('/', methods = ('GET',), view_func = main_get)
	for url in URLS:
		f = lambda url=url: url_get(url)
		print(url)
		app.add_url_rule('/' + url, methods = ('GET',), view_func = f, endpoint = url)
	app.add_url_rule('/img/<string:fname>', methods = ('GET',), view_func = show_img)
	app.run(host = '0.0.0.0', port = PORT) # , port = '3456'


if __name__ == '__main__':
	exit(main())