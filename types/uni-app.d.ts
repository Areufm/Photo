/**
 * uni-app TypeScript 类型声明文件
 */

declare global {
	const uni: UniApp.Uni
	
	interface Window {
		uni: UniApp.Uni
	}
}

declare namespace UniApp {
	interface Uni {
		// 存储相关
		setStorageSync(key: string, data: any): void
		getStorageSync(key: string): any
		removeStorageSync(key: string): void
		clearStorageSync(): void
		
		// 网络请求
		request(options: RequestOptions): RequestTask
		
		// 界面相关
		showToast(options: ShowToastOptions): void
		showLoading(options: ShowLoadingOptions): void
		hideLoading(): void
		showModal(options: ShowModalOptions): void
		previewImage(options: PreviewImageOptions): void
		
		// 导航相关
		navigateTo(options: NavigateToOptions): void
		navigateBack(options?: NavigateBackOptions): void
		
		// 系统信息
		getSystemInfo(options: GetSystemInfoOptions): void
		onNetworkStatusChange(callback: (result: NetworkStatusResult) => void): void
		
		// 文件相关
		chooseImage(options: ChooseImageOptions): void
		saveImageToPhotosAlbum(options: SaveImageToPhotosAlbumOptions): void
	}
	
	interface RequestOptions {
		url: string
		method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
		data?: any
		header?: Record<string, string>
		timeout?: number
		success?: (result: RequestSuccessResult) => void
		fail?: (error: any) => void
		complete?: () => void
	}
	
	interface RequestTask {
		abort(): void
	}
	
	interface RequestSuccessResult {
		statusCode: number
		data: any
		header: Record<string, string>
	}
	
	interface ShowToastOptions {
		title: string
		icon?: 'success' | 'loading' | 'none'
		duration?: number
		mask?: boolean
	}
	
	interface ShowLoadingOptions {
		title: string
		mask?: boolean
	}
	
	interface ShowModalOptions {
		title?: string
		content: string
		confirmText?: string
		cancelText?: string
		success?: (result: { confirm: boolean; cancel: boolean }) => void
	}
	
	interface PreviewImageOptions {
		current: string
		urls: string[]
		indicator?: string
		loop?: boolean
	}
	
	interface NavigateToOptions {
		url: string
		success?: () => void
		fail?: (error: any) => void
		complete?: () => void
	}
	
	interface NavigateBackOptions {
		delta?: number
	}
	
	interface GetSystemInfoOptions {
		success: (result: SystemInfoResult) => void
		fail?: (error: any) => void
	}
	
	interface SystemInfoResult {
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
	
	interface NetworkStatusResult {
		isConnected: boolean
		networkType: string
	}
	
	interface ChooseImageOptions {
		count?: number
		sourceType?: Array<'album' | 'camera'>
		success?: (result: ChooseImageResult) => void
		fail?: (error: any) => void
	}
	
	interface ChooseImageResult {
		tempFilePaths: string[]
		tempFiles: Array<{
			path: string
			size: number
		}>
	}
	
	interface SaveImageToPhotosAlbumOptions {
		filePath: string
		success?: () => void
		fail?: (error: any) => void
	}
}

export {}; 