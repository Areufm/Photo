/**
 * 通用工具类 - TypeScript版本
 * 包含常用的工具函数，支持完整的类型检查
 */

// 时间格式化选项接口
interface FormatTimeOptions {
	format?: string
}

// 本地存储工具接口
interface StorageUtils {
	set<T>(key: string, value: T): void
	get<T>(key: string, defaultValue?: T): T | null
	remove(key: string): void
	clear(): void
}

// 页面跳转参数接口
interface NavigateParams {
	[key: string]: string | number | boolean
}

// 系统信息接口
interface SystemInfo {
	platform: string
	system: string
	version: string
	screenWidth: number
	screenHeight: number
	windowWidth: number
	windowHeight: number
	pixelRatio: number
	statusBarHeight: number
	safeArea: {
		left: number
		right: number
		top: number
		bottom: number
		width: number
		height: number
	}
}

// 选择图片结果接口
interface ChooseImageResult {
	tempFilePaths: string[]
	tempFiles: Array<{
		path: string
		size: number
	}>
}

// 网络状态变化结果接口
interface NetworkStatusResult {
	isConnected: boolean
	networkType: string
}

/**
 * 格式化时间
 * @param time 时间
 * @param format 格式
 */
export const formatTime = (time: string | Date, format: string = 'YYYY-MM-DD HH:mm:ss'): string => {
	if (!time) return ''
	
	const date = time instanceof Date ? time : new Date(time)
	const year = date.getFullYear()
	const month = String(date.getMonth() + 1).padStart ? 
		String(date.getMonth() + 1).padStart(2, '0') : 
		('0' + (date.getMonth() + 1)).slice(-2)
	const day = String(date.getDate()).padStart ? 
		String(date.getDate()).padStart(2, '0') : 
		('0' + date.getDate()).slice(-2)
	const hour = String(date.getHours()).padStart ? 
		String(date.getHours()).padStart(2, '0') : 
		('0' + date.getHours()).slice(-2)
	const minute = String(date.getMinutes()).padStart ? 
		String(date.getMinutes()).padStart(2, '0') : 
		('0' + date.getMinutes()).slice(-2)
	const second = String(date.getSeconds()).padStart ? 
		String(date.getSeconds()).padStart(2, '0') : 
		('0' + date.getSeconds()).slice(-2)
	
	return format
		.replace('YYYY', String(year))
		.replace('MM', month)
		.replace('DD', day)
		.replace('HH', hour)
		.replace('mm', minute)
		.replace('ss', second)
}

/**
 * 获取相对时间
 * @param time 时间
 */
export const getRelativeTime = (time: string | Date): string => {
	if (!time) return ''
	
	const now = new Date()
	const targetTime = time instanceof Date ? time : new Date(time)
	const diff = now.getTime() - targetTime.getTime()
	
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
 * @param size 字节大小
 */
export const formatFileSize = (size: number | string): string => {
	if (!size) return '0 B'
	
	const numSize = typeof size === 'string' ? parseFloat(size) : size
	const units = ['B', 'KB', 'MB', 'GB', 'TB']
	let index = 0
	let currentSize = numSize
	
	while (currentSize >= 1024 && index < units.length - 1) {
		currentSize /= 1024
		index++
	}
	
	return `${currentSize.toFixed(1)} ${units[index]}`
}

/**
 * 防抖函数
 * @param fn 要执行的函数
 * @param delay 延迟时间
 */
export const debounce = <T extends (...args: any[]) => any>(
	fn: T, 
	delay: number = 300
): ((...args: Parameters<T>) => void) => {
	let timer: number | null = null
	return (...args: Parameters<T>) => {
		if (timer) clearTimeout(timer)
		timer = setTimeout(() => {
			fn(...args)
		}, delay)
	}
}

/**
 * 节流函数
 * @param fn 要执行的函数
 * @param delay 延迟时间
 */
export const throttle = <T extends (...args: any[]) => any>(
	fn: T, 
	delay: number = 300
): ((...args: Parameters<T>) => void) => {
	let timer: number | null = null
	return (...args: Parameters<T>) => {
		if (!timer) {
			timer = setTimeout(() => {
				fn(...args)
				timer = null
			}, delay)
		}
	}
}

/**
 * 深拷贝对象
 * @param obj 要拷贝的对象
 */
export const deepClone = <T>(obj: T): T => {
	if (obj === null || typeof obj !== 'object') return obj
	
	if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T
	if (obj instanceof Array) return obj.map(item => deepClone(item)) as unknown as T
	
	if (typeof obj === 'object') {
		const clonedObj = {} as T
		Object.keys(obj).forEach(key => {
			;(clonedObj as any)[key] = deepClone((obj as any)[key])
		})
		return clonedObj
	}
	
	return obj
}

/**
 * 生成唯一ID
 */
export const generateId = (): string => {
	return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

/**
 * 本地存储工具
 */
export const storage: StorageUtils = {
	/**
	 * 设置存储
	 */
	set<T>(key: string, value: T): void {
		try {
			uni.setStorageSync(key, JSON.stringify(value))
		} catch (error) {
			console.error('存储失败:', error)
		}
	},
	
	/**
	 * 获取存储
	 */
	get<T>(key: string, defaultValue: T | null = null): T | null {
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
	remove(key: string): void {
		try {
			uni.removeStorageSync(key)
		} catch (error) {
			console.error('删除存储失败:', error)
		}
	},
	
	/**
	 * 清空存储
	 */
	clear(): void {
		try {
			uni.clearStorageSync()
		} catch (error) {
			console.error('清空存储失败:', error)
		}
	}
}

/**
 * 图片预览
 * @param current 当前图片URL
 * @param urls 图片URL数组
 */
export const previewImage = (current: string, urls: string[] = []): void => {
	uni.previewImage({
		current,
		urls: urls.length > 0 ? urls : [current],
		indicator: 'number',
		loop: true
	})
}

/**
 * 显示提示消息
 * @param title 提示内容
 * @param icon 图标类型
 * @param duration 显示时间
 */
export const showToast = (
	title: string, 
	icon: 'success' | 'loading' | 'none' = 'none', 
	duration: number = 2000
): void => {
	uni.showToast({
		title,
		icon,
		duration
	})
}

/**
 * 显示加载中
 * @param title 加载文字
 */
export const showLoading = (title: string = '加载中...'): void => {
	uni.showLoading({
		title,
		mask: true
	})
}

/**
 * 隐藏加载中
 */
export const hideLoading = (): void => {
	uni.hideLoading()
}

/**
 * 显示确认对话框
 * @param content 内容
 * @param title 标题
 */
export const showConfirm = (content: string, title: string = '提示'): Promise<boolean> => {
	return new (Promise as any)((resolve: (value: boolean) => void) => {
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
 * @param url 页面路径
 * @param params 参数
 */
export const navigateTo = (url: string, params: NavigateParams = {}): void => {
	const query = Object.keys(params)
		.map(key => `${key}=${encodeURIComponent(String(params[key]))}`)
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
export const navigateBack = (): void => {
	uni.navigateBack()
}

/**
 * 获取系统信息
 */
export const getSystemInfo = (): Promise<SystemInfo> => {
	return new (Promise as any)((resolve: (value: SystemInfo) => void) => {
		uni.getSystemInfo({
			success: (res) => resolve(res as SystemInfo)
		})
	})
}

/**
 * 选择图片
 * @param count 选择数量
 * @param sourceType 选择来源
 */
export const chooseImage = (
	count: number = 9, 
	sourceType: Array<'album' | 'camera'> = ['album', 'camera']
): Promise<ChooseImageResult> => {
	return new (Promise as any)((resolve: (value: ChooseImageResult) => void, reject: (reason?: any) => void) => {
		uni.chooseImage({
			count,
			sourceType,
			success: (res) => resolve(res as ChooseImageResult),
			fail: reject
		})
	})
}

/**
 * 保存图片到相册
 * @param filePath 图片路径
 */
export const saveImageToPhotosAlbum = (filePath: string): Promise<any> => {
	return new (Promise as any)((resolve: (value?: any) => void, reject: (reason?: any) => void) => {
		uni.saveImageToPhotosAlbum({
			filePath,
			success: () => resolve(),
			fail: reject
		})
	})
}

// 默认导出所有工具函数
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