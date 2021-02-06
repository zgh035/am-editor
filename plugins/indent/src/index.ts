import {
	addUnit,
	HEADING_TAG_MAP,
	INDENT_KEY,
	MAX_INDENT,
	NodeInterface,
	Plugin,
	removeUnit,
	setNodeProps,
} from '@aomao/engine';

export type Options = {
	hotkey?: string | Array<string>;
	maxPadding?: number;
};

// value > 0：增加缩进
// value < 0：减少缩进
export const addPadding = (
	block: NodeInterface,
	padding: number,
	isTab: boolean,
	maxPadding: number,
) => {
	if (['ul', 'ol'].includes(block.name || '')) {
		const currentValue = parseInt(block.attr(INDENT_KEY), 10) || 0;
		let newValue = currentValue + (padding < 0 ? -1 : 1);

		if (newValue > MAX_INDENT) {
			newValue = MAX_INDENT;
		}
		if (newValue < 1) {
			block.removeAttr(INDENT_KEY);
		} else {
			block.attr(INDENT_KEY, newValue);
		}
		return;
	}
	// 标题、正文
	if (block.isHeading()) {
		addTextIndent(block, padding, isTab, maxPadding);
	}
};
// value > 0：增加缩进，第一次先进行文本缩进
// value < 0：减少缩进，第一次先取消文本缩进
const addTextIndent = (
	block: NodeInterface,
	padding: number,
	isTab: boolean,
	maxPadding: number,
) => {
	if (padding > 0) {
		if (removeUnit(block.css('text-indent')) || isTab !== true) {
			const currentValue = block.css('padding-left');
			let newValue = removeUnit(currentValue) + padding;
			newValue = Math.min(newValue, maxPadding);
			setNodeProps(block, {
				style: {
					'padding-left': addUnit(newValue > 0 ? newValue : 0, 'em'),
				},
			});
		} else {
			setNodeProps(block, {
				style: {
					'text-indent': '2em',
				},
			});
		}
	} else if (removeUnit(block.css('text-indent'))) {
		setNodeProps(block, {
			style: {
				'text-indent': '',
			},
		});
	} else {
		const currentValue = block.css('padding-left');
		const newValue = removeUnit(currentValue) + padding;
		setNodeProps(block, {
			style: {
				'padding-left': addUnit(newValue > 0 ? newValue : 0, 'em'),
			},
		});
	}
};

export default class extends Plugin<Options> {
	queryState() {
		if (!this.engine) return;
		const { change } = this.engine;
		const range = change.getRange();
		const block = range.startNode.getClosestBlock();
		if (block.name === 'li') {
			return parseInt(block.closest('ul,ol').attr(INDENT_KEY), 10) || 0;
		}

		if (block.isHeading()) {
			const padding = removeUnit(block.css('padding-left'));
			const textIndent = removeUnit(
				block.get<HTMLElement>()?.style.textIndent || '',
			);
			return padding || textIndent;
		}
		return 0;
	}

	execute(isTab: boolean = false) {
		if (!this.engine) return;
		const { change } = this.engine;
		change.separateBlocks();
		const range = change.getRange();
		const blocks = range.getActiveBlocks();
		// 没找到目标 block
		if (!blocks) {
			return;
		}
		const maxPadding = this.options.maxPadding || 50;
		// 其它情况
		blocks.forEach(block => {
			addPadding(block, 2, isTab, maxPadding);
		});
		change.mergeAdjacentList();
	}

	hotkey() {
		return this.options.hotkey || 'mod+]';
	}

	schema() {
		const tags = Object.keys(HEADING_TAG_MAP);
		const rules: Array<any> = [];
		tags.forEach(tag => {
			const rule = {};
			rule[tag] = {
				style: {
					'text-indent': '@length',
					'padding-left': '@length',
				},
			};
			rules.push(rule);
		});
		return rules;
	}
}
