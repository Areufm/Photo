/**
 * 通用工具类
 * 包含常用的工具函数
 */

/**
 * 格式化时间
 * @param {string|Date} time 时间
 * @param {string} format 格式
 */
export function formatTime(time, format = 'YYYY-MM-DD HH:mm:ss') {
	if (!time) return ''
	
	const date = new Date(time)
	const year = date.getFullYear()
	const month = String(date.getMonth() + 1).padStart(2, '0')
	const day = String(date.getDate()).padStart(2, '0')
	const hour = String(date.getHours()).padStart(2, '0')
	const minute = String(date.getMinutes()).padStart(2, '0')
	const second = String(date.getSeconds()).padStart(2, '0')
	
	return format
		.replace('YYYY', year)
		.replace('MM', month)
		.replace('DD', day)
		.replace('HH', hour)
		.replace('mm', minute)
		.replace('ss', second)
}

/**
 * 获取相对时间
 * @param {string|Date} time 时间
 */
export function getRelativeTime(time) {
	if (!time) return ''
	
	const now = new Date()
	const targetTime = new Date(time)
	const diff = now - targetTime
	
	const minute = 60 * 1000
	const hour = 60 * minute
	const day = 24 * hour
	const month = 30 * day
	const year = 365 * day
	
	if (diff < minute) {
		return '刚刚'
	} else if (diff < hour) {
		return `${Math.floor(diff / minute)}分钟前`
	} else if (diff < day) {
		return `${Math.floor(diff / hour)}小时前`
	} else if (diff < month) {
		return `${Math.floor(diff / day)}天前`
	} else if (diff < year) {
		return `${Math.floor(diff / month)}个月前`
	} else {
		return `${Math.floor(diff / year)}年前`
	}
}

/**
 * 格式化文件大小
 * @param {number} size 字节大小
 */
export function formatFileSize(size) {
	if (!size) return '0 B'
	
	const units = ['B', 'KB', 'MB', 'GB', 'TB']
	let index = 0
	
	while (size >= 1024 && index < units.length - 1) {
		size /= 1024
		index++
	}
	
	return `${size.toFixed(1)} ${units[index]}`
}

/**
 * 防抖函数
 * @param {Function} fn 要执行的函数
 * @param {number} delay 延迟时间
 */
export function debounce(fn, delay = 300) {
	let timer = null
	return function (...args) {
		if (timer) clearTimeout(timer)
		timer = setTimeout(() => {
			fn.apply(this, args)
		}, delay)
	}
}

/**
 * 节流函数
 * @param {Function} fn 要执行的函数
 * @param {number} delay 延迟时间
 */
export function throttle(fn, delay = 300) {
	let timer = null
	return function (...args) {
		if (!timer) {
			timer = setTimeout(() => {
				fn.apply(this, args)
				timer = null
			}, delay)
		}
	}
}

/**
 * 深拷贝对象
 * @param {any} obj 要拷贝的对象
 */
export function deepClone(obj) {
	if (obj === null || typeof obj !== 'object') return obj
	
	if (obj instanceof Date) return new Date(obj)
	if (obj instanceof Array) return obj.map(item => deepClone(item))
	
	if (typeof obj === 'object') {
		const clonedObj = {}
		Object.keys(obj).forEach(key => {
			clonedObj[key] = deepClone(obj[key])
		})
		return clonedObj
	}
	
	return obj
}

/**
 * 生成唯一ID
 */
export function generateId() {
	return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

/**
 * 本地存储工具
 */
export const storage = {
	/**
	 * 设置存储
	 */
	set(key, value) {
		try {
			uni.setStorageSync(key, JSON.stringify(value))
		} catch (error) {
			console.error('存储失败:', error)
		}
	},
	
	/**
	 * 获取存储
	 */
	get(key, defaultValue = null) {
		try {
			const value = uni.getStorageSync(key)
			return value ? JSON.parse(value) : defaultValue
		} catch (error) {
			console.error('获取存储失败:', error)
			return defaultValue
		}
	},
	
	/**
	 * 删除存储
	 */
	remove(key) {
		try {
			uni.removeStorageSync(key)
		} catch (error) {
			console.error('删除存储失败:', error)
		}
	},
	
	/**
	 * 清空存储
	 */
	clear() {
		try {
			uni.clearStorageSync()
		} catch (error) {
			console.error('清空存储失败:', error)
		}
	}
}

/**
 * 图片预览
 * @param {string} current 当前图片URL
 * @param {Array} urls 图片URL数组
 */
export function previewImage(current, urls = []) {
	uni.previewImage({
		current,
		urls: urls.length > 0 ? urls : [current],
		indicator: 'number',
		loop: true
	})
}

/**
 * 显示提示消息
 * @param {string} title 提示内容
 * @param {string} icon 图标类型
 * @param {number} duration 显示时间
 */
export function showToast(title, icon = 'none', duration = 2000) {
	uni.showToast({
		title,
		icon,
		duration
	})
}

/**
 * 显示加载中
 * @param {string} title 加载文字
 */
export function showLoading(title = '加载中...') {
	uni.showLoading({
		title,
		mask: true
	})
}

/**
 * 隐藏加载中
 */
export function hideLoading() {
	uni.hideLoading()
}

/**
 * 显示确认对话框
 * @param {string} content 内容
 * @param {string} title 标题
 */
export function showConfirm(content, title = '提示') {
	return new Promise((resolve) => {
		uni.showModal({
			title,
			content,
			confirmText: '确定',
			cancelText: '取消',
			success: (res) => {
				resolve(res.confirm)
			}
		})
	})
}

/**
 * 页面跳转
 * @param {string} url 页面路径
 * @param {Object} params 参数
 */
export function navigateTo(url, params = {}) {
	const query = Object.keys(params)
		.map(key => `${key}=${encodeURIComponent(params[key])}`)
		.join('&')
	
	const fullUrl = query ? `${url}?${query}` : url
	
	uni.navigateTo({
		url: fullUrl,
		fail: (error) => {
			console.error('页面跳转失败:', error)
		}
	})
}

/**
 * 返回上一页
 */
export function navigateBack() {
	uni.navigateBack()
}

/**
 * 获取系统信息
 */
export function getSystemInfo() {
	return new Promise((resolve) => {
		uni.getSystemInfo({
			success: resolve
		})
	})
}

/**
 * 选择图片
 * @param {number} count 选择数量
 * @param {Array} sourceType 选择来源
 */
export function chooseImage(count = 9, sourceType = ['album', 'camera']) {
	return new Promise((resolve, reject) => {
		uni.chooseImage({
			count,
			sourceType,
			success: resolve,
			fail: reject
		})
	})
}

/**
 * 保存图片到相册
 * @param {string} filePath 图片路径
 */
export function saveImageToPhotosAlbum(filePath) {
	return new Promise((resolve, reject) => {
		uni.saveImageToPhotosAlbum({
			filePath,
			success: resolve,
			fail: reject
		})
	})
}

export default {
	formatTime,
	getRelativeTime,
	formatFileSize,
	debounce,
	throttle,
	deepClone,
	generateId,
	storage,
	previewImage,
	showToast,
	showLoading,
	hideLoading,
	showConfirm,
	navigateTo,
	navigateBack,
	getSystemInfo,
	chooseImage,
	saveImageToPhotosAlbum
} 