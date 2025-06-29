/**
 * API请求工具类 - TypeScript版本
 * 包含所有的接口定义和mock数据，支持完整的类型检查
 */

// 基础配置接口
interface ApiConfig {
	baseUrl: string
	timeout: number
	mockMode: boolean
}

// 图片数据接口
export interface ImageItem {
	id: string
	url: string
	thumbnail: string
	title: string
	description: string
	tags: string[]
	categoryId: string
	createTime: string
	isFavorite: boolean
	author: string
	size: string
	width: number
	height: number
}

// 分类数据接口
export interface CategoryItem {
	id: string
	name: string
	description: string
	cover: string
	count: number
	createTime: string
}

// 用户信息接口
export interface UserInfo {
	id: string
	nickname: string
	avatar: string
	email: string
	phone: string
	favoriteCount: number
	categoryCount: number
	uploadCount: number
	joinTime: string
}

// API响应基础接口
export interface ApiResponse<T = any> {
	code: number
	message: string
	data: T
}

// 分页响应接口
export interface PaginatedResponse<T> {
	list: T[]
	total: number
	page: number
	pageSize: number
}

// 请求参数接口
export interface RequestOptions {
	url: string
	method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
	data?: Record<string, any>
	header?: Record<string, string>
}

// 分页参数接口
export interface PaginationParams {
	page?: number
	pageSize?: number
}

// 基础配置
const config: ApiConfig = {
	baseUrl: 'https://api.photogallery.com', // 接口基础地址
	timeout: 10000, // 请求超时时间
	mockMode: true // 是否开启mock模式
}

/**
 * Mock数据
 */
const mockData = {
	// 图片列表数据
	imageList: [
		{
			id: '1',
			url: 'https://picsum.photos/400/600?random=1',
			thumbnail: 'https://picsum.photos/200/300?random=1',
			title: '美丽的风景',
			description: '这是一张美丽的风景照片',
			tags: ['风景', '自然'],
			categoryId: '1',
			createTime: '2024-01-15 10:30:00',
			isFavorite: false,
			author: '摄影师A',
			size: '2.5MB',
			width: 1920,
			height: 1280
		},
		{
			id: '2',
			url: 'https://picsum.photos/400/600?random=2',
			thumbnail: 'https://picsum.photos/200/300?random=2',
			title: '城市夜景',
			description: '繁华的城市夜景',
			tags: ['城市', '夜景'],
			categoryId: '2',
			createTime: '2024-01-14 20:45:00',
			isFavorite: true,
			author: '摄影师B',
			size: '3.2MB',
			width: 1920,
			height: 1080
		},
		{
			id: '3',
			url: 'https://picsum.photos/400/600?random=3',
			thumbnail: 'https://picsum.photos/200/300?random=3',
			title: '人物肖像',
			description: '专业人物肖像摄影',
			tags: ['人物', '肖像'],
			categoryId: '3',
			createTime: '2024-01-13 14:20:00',
			isFavorite: false,
			author: '摄影师C',
			size: '4.1MB',
			width: 1080,
			height: 1350
		},
		{
			id: '4',
			url: 'https://picsum.photos/400/600?random=4',
			thumbnail: 'https://picsum.photos/200/300?random=4',
			title: '动物世界',
			description: '可爱的动物照片',
			tags: ['动物', '野生'],
			categoryId: '4',
			createTime: '2024-01-12 09:15:00',
			isFavorite: true,
			author: '摄影师D',
			size: '1.8MB',
			width: 1440,
			height: 960
		},
		{
			id: '5',
			url: 'https://picsum.photos/400/600?random=5',
			thumbnail: 'https://picsum.photos/200/300?random=5',
			title: '建筑艺术',
			description: '现代建筑艺术作品',
			tags: ['建筑', '艺术'],
			categoryId: '1',
			createTime: '2024-01-11 16:00:00',
			isFavorite: false,
			author: '摄影师E',
			size: '2.9MB',
			width: 1600,
			height: 1200
		},
		{
			id: '6',
			url: 'https://picsum.photos/400/600?random=6',
			thumbnail: 'https://picsum.photos/200/300?random=6',
			title: '美食摄影',
			description: '诱人的美食照片',
			tags: ['美食', '料理'],
			categoryId: '5',
			createTime: '2024-01-10 12:30:00',
			isFavorite: true,
			author: '摄影师F',
			size: '3.5MB',
			width: 1920,
			height: 1440
		}
	] as ImageItem[],

	// 分类数据
	categories: [
		{
			id: '1',
			name: '风景',
			description: '自然风景和建筑摄影',
			cover: 'https://picsum.photos/300/200?random=10',
			count: 15,
			createTime: '2024-01-01 00:00:00'
		},
		{
			id: '2',
			name: '城市',
			description: '城市景观和街拍',
			cover: 'https://picsum.photos/300/200?random=11',
			count: 8,
			createTime: '2024-01-01 00:00:00'
		},
		{
			id: '3',
			name: '人物',
			description: '人物肖像摄影',
			cover: 'https://picsum.photos/300/200?random=12',
			count: 12,
			createTime: '2024-01-01 00:00:00'
		},
		{
			id: '4',
			name: '动物',
			description: '动物摄影作品',
			cover: 'https://picsum.photos/300/200?random=13',
			count: 6,
			createTime: '2024-01-01 00:00:00'
		},
		{
			id: '5',
			name: '美食',
			description: '美食摄影',
			cover: 'https://picsum.photos/300/200?random=14',
			count: 9,
			createTime: '2024-01-01 00:00:00'
		}
	] as CategoryItem[],

	// 用户信息
	userInfo: {
		id: '1',
		nickname: '图库用户',
		avatar: 'https://picsum.photos/200/200?random=100',
		email: 'user@example.com',
		phone: '138****8888',
		favoriteCount: 25,
		categoryCount: 8,
		uploadCount: 156,
		joinTime: '2023-12-01'
	} as UserInfo
}

/**
 * 模拟网络请求延迟
 */
const mockDelay = (ms: number = 500): Promise<void> => {
	return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 统一请求方法
 */
async function request<T = any>(options: RequestOptions): Promise<ApiResponse<T>> {
	const { url, method = 'GET', data = {}, header = {} } = options
	
	// Mock模式直接返回mock数据
	if (config.mockMode) {
		await mockDelay()
		return handleMockRequest(url, method, data)
	}
	
	// 真实网络请求
	return new Promise((resolve, reject) => {
		uni.request({
			url: config.baseUrl + url,
			method,
			data,
			header: {
				'Content-Type': 'application/json',
				...header
			},
			timeout: config.timeout,
			success: (res) => {
				if (res.statusCode === 200) {
					resolve(res.data as ApiResponse<T>)
				} else {
					reject(new Error(`请求失败: ${res.statusCode}`))
				}
			},
			fail: (error) => {
				reject(error)
			}
		})
	})
}

/**
 * 处理Mock请求
 */
function handleMockRequest(url: string, method: string, data: Record<string, any>): ApiResponse<any> {
	console.log(`Mock Request: ${method} ${url}`, data)
	
	switch (url) {
		case '/api/images':
			return {
				code: 200,
				message: '获取成功',
				data: {
					list: mockData.imageList,
					total: mockData.imageList.length,
					page: data.page || 1,
					pageSize: data.pageSize || 20
				}
			}
			
		case '/api/images/detail':
			const image = mockData.imageList.find(item => item.id === data.id)
			return {
				code: 200,
				message: '获取成功',
				data: image || null
			}
			
		case '/api/categories':
			return {
				code: 200,
				message: '获取成功',
				data: mockData.categories
			}
			
		case '/api/categories/images':
			const categoryImages = mockData.imageList.filter(item => item.categoryId === data.categoryId)
			return {
				code: 200,
				message: '获取成功',
				data: {
					list: categoryImages,
					total: categoryImages.length
				}
			}
			
		case '/api/user/info':
			return {
				code: 200,
				message: '获取成功',
				data: mockData.userInfo
			}
			
		case '/api/user/favorites':
			const favorites = mockData.imageList.filter(item => item.isFavorite)
			return {
				code: 200,
				message: '获取成功',
				data: favorites
			}
			
		default:
			return {
				code: 404,
				message: '接口不存在',
				data: null
			}
	}
}

/**
 * API接口定义类
 */
class ApiService {
	/**
	 * 获取图片列表
	 */
	async getImageList(params: PaginationParams = {}): Promise<ApiResponse<PaginatedResponse<ImageItem>>> {
		return request<PaginatedResponse<ImageItem>>({
			url: '/api/images',
			method: 'GET',
			data: params
		})
	}

	/**
	 * 获取图片详情
	 */
	async getImageDetail(id: string): Promise<ApiResponse<ImageItem | null>> {
		return request<ImageItem | null>({
			url: '/api/images/detail',
			method: 'GET',
			data: { id }
		})
	}

	/**
	 * 获取分类列表
	 */
	async getCategoryList(): Promise<ApiResponse<CategoryItem[]>> {
		return request<CategoryItem[]>({
			url: '/api/categories',
			method: 'GET'
		})
	}

	/**
	 * 获取分类下的图片
	 */
	async getCategoryImages(categoryId: string, params: PaginationParams = {}): Promise<ApiResponse<PaginatedResponse<ImageItem>>> {
		return request<PaginatedResponse<ImageItem>>({
			url: '/api/categories/images',
			method: 'GET',
			data: { categoryId, ...params }
		})
	}

	/**
	 * 获取用户信息
	 */
	async getUserInfo(): Promise<ApiResponse<UserInfo>> {
		return request<UserInfo>({
			url: '/api/user/info',
			method: 'GET'
		})
	}

	/**
	 * 获取用户收藏
	 */
	async getUserFavorites(): Promise<ApiResponse<ImageItem[]>> {
		return request<ImageItem[]>({
			url: '/api/user/favorites',
			method: 'GET'
		})
	}

	/**
	 * 添加收藏
	 */
	async addFavorite(imageId: string): Promise<ApiResponse<null>> {
		return request<null>({
			url: '/api/user/favorites',
			method: 'POST',
			data: { imageId }
		})
	}

	/**
	 * 取消收藏
	 */
	async removeFavorite(imageId: string): Promise<ApiResponse<null>> {
		return request<null>({
			url: '/api/user/favorites',
			method: 'DELETE',
			data: { imageId }
		})
	}

	/**
	 * 创建分类
	 */
	async createCategory(categoryData: Omit<CategoryItem, 'id' | 'createTime'>): Promise<ApiResponse<CategoryItem>> {
		return request<CategoryItem>({
			url: '/api/categories',
			method: 'POST',
			data: categoryData
		})
	}

	/**
	 * 上传图片
	 */
	async uploadImage(imageData: FormData): Promise<ApiResponse<ImageItem>> {
		return request<ImageItem>({
			url: '/api/images/upload',
			method: 'POST',
			data: imageData
		})
	}
}

// 导出API实例
export const api = new ApiService()

// 默认导出
export default api 