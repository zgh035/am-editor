import { ANCHOR, CURSOR, FOCUS } from '../constants/selection';
import {
	CARD_EDITABLE_KEY,
	CARD_TYPE_KEY,
	CARD_VALUE_KEY,
	READY_CARD_KEY,
} from '../constants/card';
import { DATA_ELEMENT } from '../constants/root';
import { isMacos } from './user-agent';

/**
 * 随机字符串
 * @param length 长度
 */
export const random = (length: number = 5) => {
	if (length < 5) length = 5;
	const str =
		'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	let word = '';
	for (let index = 0; index < length; index++) {
		word += str.charAt(Math.floor(Math.random() * str.length));
	}
	return word;
};

/**
 * 驼峰命名转换枚举
 */
export enum CamelCaseType {
	UPPER = 'upper',
	LOWER = 'lower',
}

/**
 * 转换为驼峰命名法
 * @param {string} value 需要转换的字符串
 * @param {upper,lower} type 转换类型，upper 大驼峰命名法，lower，小驼峰命名法（默认）
 */
export const toCamelCase = (
	value: string,
	type: CamelCaseType = CamelCaseType.LOWER,
): string => {
	return value
		.split('-')
		.map((str, index) => {
			if (type === 'upper' || index > 0) {
				return str.charAt(0).toUpperCase() + str.substr(1);
			}
			if (type === 'lower' && index === 0) {
				return str.charAt(0).toLowerCase() + str.substr(1);
			}
			return str;
		})
		.join('');
};

/**
 * RGB 颜色转换为16进制颜色代码
 * @param {string} rgb
 */
export const toHex = (rgb: string): string => {
	const hex = (num: string) => {
		const char = parseInt(num, 10).toString(16).toUpperCase();
		return char.length > 1 ? char : '0' + char;
	};

	const reg = /rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/gi;
	return rgb.replace(reg, ($0, $1, $2, $3) => {
		return '#' + hex($1) + hex($2) + hex($3);
	});
};

/**
 * 将节点属性转换为 map 数据类型
 * @param {string} value
 */
export const getAttrMap = (value: string): { [k: string]: string } => {
	const map: { [k: string]: string } = {};
	const reg =
		/\s+(?:([\w\-:]+)|(?:([\w\-:]+)=([^\s"'<>]+))|(?:([\w\-:"]+)="([^"]*)")|(?:([\w\-:"]+)='([^']*)'))(?=(?:\s|\/|>)+)/g;
	let match;

	while ((match = reg.exec(value))) {
		const key: string = (
			match[1] ||
			match[2] ||
			match[4] ||
			match[6]
		).toLowerCase();
		const val: string =
			(match[2] ? match[3] : match[4] ? match[5] : match[7]) || '';
		map[key] = val;
	}

	return map;
};

const stylesCaches = new Map<string, { [k: string]: string }>();
/**
 * 将 style 样式转换为 map 数据类型
 * @param {string} style
 */
export const getStyleMap = (style: string): { [k: string]: string } => {
	style = style.replace(/&quot;/g, '"');
	const map: { [k: string]: string } = {};
	if (!style) return map;
	const cacheStyle = stylesCaches.get(style);
	if (cacheStyle) return cacheStyle;
	const reg = /\s*([\w\-]+)\s*:([^;]*)(;|$)/g;
	let match;

	while ((match = reg.exec(style))) {
		const key = match[1].toLowerCase().trim();
		let val = match[2].trim();
		if (val.toLowerCase().includes('rgb')) {
			val = toHex(val);
		}
		map[key] = val;
	}
	stylesCaches.set(style, map);
	return map;
};

/**
 * 使用window内置函数getComputedStyle获取节点style
 * @param {Node} node
 * @param {string} attrName
 */
export const getComputedStyle = (element: Element, attrName: string) => {
	const camelKey = toCamelCase(attrName);
	const style = window.getComputedStyle(element, null);
	return style ? style[camelKey] : '';
};

/**
 * 字符串编码
 * @param value 需要编码的字符串
 */
export const escape = (value: string) => {
	return (value || '')
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
};

/**
 * 字符串解码
 * @param value 需要解码的字符串
 */
export const unescape = (value: string) => {
	return (value || '')
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&quot;/g, '"')
		.replace(/&amp;/g, '&');
};

/**
 * 字符 `.` 编码
 * @param value 需要编码的字符串
 */
export const escapeDots = (value: string) => {
	return value.replace(/\./g, '&dot;');
};

/**
 * 字符 `.` 解码
 * @param value 需要解码的字符串
 */
export const unescapeDots = (value: string) => {
	return value.replace(/&dot;/g, '.');
};

/**
 * 给值增加单位
 * @param value 值
 * @param unit 单位
 */
export const addUnit = (value: string | number, unit: string = 'px') => {
	return value && /^-?\d+(?:\.\d+)?$/.test(value.toString())
		? value + unit
		: value;
};

/**
 * 移除值的单位
 * @param value 值
 */
export const removeUnit = (value: string) => {
	let match;
	return value && (match = /^(-?\d+)/.exec(value))
		? parseInt(match[1], 10)
		: 0;
};

/**
 * Card组件值编码
 * @param value 需要编码的字符串
 */
export const encodeCardValue = (value: any): string => {
	try {
		value = encodeURIComponent(JSON.stringify(value || ''));
	} catch (e) {
		value = '';
	}

	return 'data:'.concat(value);
};

/**
 * Card组件值解码
 * @param value 需要解码的字符串
 */
export const decodeCardValue = (value: string): any => {
	try {
		value = value.substr(5);
		return JSON.parse(decodeURIComponent(value));
	} catch (e) {
		return {};
	}
};

/**
 * 转换光标以及Card组件标签为html
 * @param value 需要转换的字符串
 */
export const transformCustomTags = (value: string) => {
	return value
		.replace(
			/<anchor\s*\/>/gi,
			'<span '.concat(DATA_ELEMENT, '="').concat(ANCHOR, '"></span>'),
		)
		.replace(
			/<focus\s*\/>/gi,
			'<span '.concat(DATA_ELEMENT, '="').concat(FOCUS, '"></span>'),
		)
		.replace(
			/<cursor\s*\/>/gi,
			'<span '.concat(DATA_ELEMENT, '="').concat(CURSOR, '"></span>'),
		)
		.replace(/(<card\s+[^>]+>).*?<\/card>/gi, (_, tag) => {
			//获取Card属性
			const attributes = getAttrMap(tag);
			const { type, name, value, editable } = attributes;
			const isInline = type === 'inline';
			const tagName = isInline ? 'span' : 'div';
			const list = ['<'.concat(tagName)];
			list.push(' '.concat(CARD_TYPE_KEY, '="').concat(type || '', '"'));
			list.push(' '.concat(READY_CARD_KEY, '="').concat(name || '', '"'));
			if (editable !== '')
				list.push(
					' '
						.concat(CARD_EDITABLE_KEY, '="')
						.concat(editable || '', '"'),
				);
			Object.keys(attributes).forEach((attrsName) => {
				if (
					attrsName.indexOf('data-') === 0 &&
					attrsName.indexOf('data-card') !== 0
				) {
					list.push(
						' '
							.concat(attrsName, '="')
							.concat(attributes[attrsName] || '', '"'),
					);
				}
			});
			if (value !== undefined) {
				list.push(' '.concat(CARD_VALUE_KEY, '="').concat(value, '"'));
			}

			list.push('></'.concat(tagName, '>'));
			return list.join('');
		});
};

/**
 * 验证是否是合法的url地址
 * @param url URL地址
 */
export const validUrl = (url: string) => {
	if (typeof url !== 'string') {
		return false;
	}

	url = url.toLowerCase(); // https://developer.mozilla.org/en-US-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs

	if (url.startsWith('data:text/html')) {
		return false;
	}

	if (!!!url.match(/^\S*$/)) {
		return false;
	}

	if (
		!!['http:', 'https:', 'data:', 'ftp:'].some((protocol) => {
			return url.startsWith(protocol);
		})
	) {
		return true;
	}

	if (url.startsWith('./') || url.startsWith('/')) {
		return true;
	}

	if (url.indexOf(':') < 0) {
		return true;
	}
	return false;
};

export const sanitizeUrl = (url: string) => {
	return validUrl(url) ? url : '';
};
/**
 * 格式化编辑器值，移除光标标记标签，以及标签无效属性
 * @param value
 * @returns
 */
export const formatEngineValue = (value: string) => {
	if (!value) return value;
	const newValue = value.replace(/<(anchor|focus|cursor)[^>]*?\/>/gi, '');
	return /^<p(\s[^>]*?)><br \/><\/p>$/i.test(newValue)
		? value.replace(RegExp.$1, '')
		: value;
};

/**
 * 格式化热键
 * @param key 热键
 */
export const formatHotkey = (key: string) => {
	let keys = key.toLowerCase().split('+');
	keys = keys.map((key) => {
		if (key === 'mod') {
			return isMacos ? '⌘' : 'Ctrl';
		} else if (key === 'opt') {
			return isMacos ? 'Option' : 'Alt';
		} else if (key.length > 1) {
			return key.substr(0, 1).toUpperCase() + key.substr(1).toLowerCase();
		}
		return key.toUpperCase();
	});
	return keys.join('+');
};
