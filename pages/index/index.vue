<template>
	<view class="container">
		<!-- 顶部搜索栏 -->
		<view class="header">
			<view class="search-container">
				<view class="search-box">
					<uni-icons type="search" size="18" color="#999999" />
					<input 
						v-model="searchKeyword"
						placeholder="搜索图片..."
						placeholder-class="search-placeholder"
						@input="onSearchInput"
					/>
				</view>
				<view class="filter-btn" @click="showFilterModal = true">
					<uni-icons type="tune" size="18" color="#007AFF" />
				</view>
			</view>
		</view>
		
		<!-- 图片网格 -->
		<view class="image-grid">
			<ImageCard
				v-for="image in filteredImages"
				:key="image.id"
				:image="image"
				@click="handleImageClick"
				@favorite="handleFavoriteToggle"
			/>
		</view>
		
		<!-- 加载状态 -->
		<view v-if="loading" class="loading">
			<uni-icons type="spinner-cycle" size="20" color="#999999" />
			<text>加载中...</text>
		</view>
		
		<!-- 空状态 -->
		<view v-if="!loading && filteredImages.length === 0" class="empty-state">
			<image src="/static/images/empty.png" mode="aspectFit" />
			<text>暂无图片</text>
		</view>
		
		<!-- 浮动上传按钮 -->
		<view class="upload-fab" @click="handleUpload">
			<uni-icons type="plus" size="24" color="#ffffff" />
		</view>
		
		<!-- 筛选模态框 -->
		<uni-popup ref="filterPopup" type="bottom">
			<view class="filter-modal">
				<view class="modal-header">
					<text class="modal-title">筛选条件</text>
					<view class="close-btn" @click="showFilterModal = false">
						<uni-icons type="close" size="20" color="#999999" />
					</view>
				</view>
				
				<view class="filter-content">
					<!-- 分类筛选 -->
					<view class="filter-section">
						<text class="section-title">分类</text>
						<view class="category-list">
							<view 
								v-for="category in categories"
								:key="category.id"
								class="category-item"
								:class="{ active: selectedCategoryId === category.id }"
								@click="selectedCategoryId = category.id"
							>
								{{ category.name }}
							</view>
						</view>
					</view>
					
					<!-- 排序方式 -->
					<view class="filter-section">
						<text class="section-title">排序</text>
						<view class="sort-list">
							<view 
								v-for="sort in sortOptions"
								:key="sort.value"
								class="sort-item"
								:class="{ active: sortBy === sort.value }"
								@click="sortBy = sort.value"
							>
								{{ sort.label }}
							</view>
						</view>
					</view>
				</view>
				
				<view class="modal-footer">
					<button class="btn btn-secondary" @click="resetFilter">重置</button>
					<button class="btn btn-primary" @click="applyFilter">确定</button>
				</view>
			</view>
		</uni-popup>
	</view>
</template>

<script setup lang="ts">
/**
 * 首页 - TypeScript + Setup语法糖版本
 * 展示图片网格，支持搜索、筛选、收藏等功能
 */
import { ref, computed, onMounted } from 'vue'
import { debounce, navigateTo, chooseImage, showToast } from '@/utils/common'
import { api } from '@/utils/api'
import ImageCard from '@/components/ImageCard.vue'
import type { ImageItem, CategoryItem } from '@/utils/api'

// 响应式数据
const searchKeyword = ref<string>('')
const images = ref<ImageItem[]>([])
const categories = ref<CategoryItem[]>([])
const loading = ref<boolean>(false)
const showFilterModal = ref<boolean>(false)
const selectedCategoryId = ref<string>('')
const sortBy = ref<string>('createTime')

// 排序选项
const sortOptions = [
	{ label: '最新上传', value: 'createTime' },
	{ label: '最多收藏', value: 'favorite' },
	{ label: '文件大小', value: 'size' },
	{ label: '图片尺寸', value: 'resolution' }
]

// 计算属性 - 筛选后的图片列表
const filteredImages = computed<ImageItem[]>(() => {
	let result = [...images.value]
	
	// 搜索关键词筛选
	if (searchKeyword.value.trim()) {
		const keyword = searchKeyword.value.toLowerCase()
		result = result.filter(image => 
			image.title.toLowerCase().includes(keyword) ||
			image.description.toLowerCase().includes(keyword) ||
			image.tags.some(tag => tag.toLowerCase().includes(keyword))
		)
	}
	
	// 分类筛选
	if (selectedCategoryId.value) {
		result = result.filter(image => image.categoryId === selectedCategoryId.value)
	}
	
	// 排序
	result.sort((a, b) => {
		switch (sortBy.value) {
			case 'createTime':
				return new Date(b.createTime).getTime() - new Date(a.createTime).getTime()
			case 'favorite':
				return Number(b.isFavorite) - Number(a.isFavorite)
			case 'size':
				return parseFloat(b.size) - parseFloat(a.size)
			case 'resolution':
				return (b.width * b.height) - (a.width * a.height)
			default:
				return 0
		}
	})
	
	return result
})

/**
 * 防抖搜索处理
 */
const onSearchInput = debounce(() => {
	console.log('搜索关键词:', searchKeyword.value)
}, 300)

/**
 * 获取图片列表
 */
const getImageList = async (): Promise<void> => {
	try {
		loading.value = true
		const response = await api.getImageList()
		if (response.code === 200) {
			images.value = response.data.list
		}
	} catch (error) {
		console.error('获取图片列表失败:', error)
		showToast('获取图片列表失败')
	} finally {
		loading.value = false
	}
}

/**
 * 获取分类列表
 */
const getCategoryList = async (): Promise<void> => {
	try {
		const response = await api.getCategoryList()
		if (response.code === 200) {
			categories.value = [
				{ id: '', name: '全部', description: '', cover: '', count: 0, createTime: '' },
				...response.data
			]
		}
	} catch (error) {
		console.error('获取分类列表失败:', error)
	}
}

/**
 * 处理图片点击
 */
const handleImageClick = (image: ImageItem): void => {
	navigateTo('/pages/detail/detail', { id: image.id })
}

/**
 * 处理收藏切换
 */
const handleFavoriteToggle = async (image: ImageItem): Promise<void> => {
	try {
		if (image.isFavorite) {
			await api.removeFavorite(image.id)
			showToast('已取消收藏')
		} else {
			await api.addFavorite(image.id)
			showToast('已添加收藏')
		}
		
		// 更新本地状态
		const index = images.value.findIndex(item => item.id === image.id)
		if (index !== -1) {
			images.value[index].isFavorite = !images.value[index].isFavorite
		}
	} catch (error) {
		console.error('收藏操作失败:', error)
		showToast('操作失败')
	}
}

/**
 * 处理上传
 */
const handleUpload = async (): Promise<void> => {
	try {
		const result = await chooseImage(9)
		if (result.tempFilePaths.length > 0) {
			showToast('图片上传功能开发中')
			// TODO: 实现图片上传功能
		}
	} catch (error) {
		console.error('选择图片失败:', error)
	}
}

/**
 * 应用筛选
 */
const applyFilter = (): void => {
	showFilterModal.value = false
	showToast('筛选已应用')
}

/**
 * 重置筛选
 */
const resetFilter = (): void => {
	selectedCategoryId.value = ''
	sortBy.value = 'createTime'
	searchKeyword.value = ''
	showToast('筛选已重置')
}

// 页面挂载时初始化数据
onMounted(() => {
	getImageList()
	getCategoryList()
})
</script>

<style lang="scss" scoped>
	.container {
		background-color: #f8f8f8;
		min-height: 100vh;
	}

	.header {
		background-color: #ffffff;
		padding: 20rpx;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
		position: sticky;
		top: 0;
		z-index: 100;
	}

	.search-container {
		display: flex;
		align-items: center;
		gap: 20rpx;
	}

	.search-box {
		flex: 1;
		display: flex;
		align-items: center;
		background-color: #f5f5f5;
		border-radius: 20rpx;
		padding: 0 30rpx;
		height: 70rpx;
	}

	.search-box input {
		flex: 1;
		margin-left: 20rpx;
		font-size: 28rpx;
	}

	.search-placeholder {
		color: #999999;
	}

	.filter-btn {
		width: 70rpx;
		height: 70rpx;
		background-color: #f0f6ff;
		border-radius: 20rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.image-grid {
		display: flex;
		flex-wrap: wrap;
		padding: 20rpx;
		gap: 20rpx;
	}

	.image-grid :deep(.image-card) {
		width: calc((100% - 20rpx) / 2);
	}

	.loading {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 60rpx;
		gap: 20rpx;
	}

	.loading text {
		color: #999999;
		font-size: 26rpx;
	}

	.empty-state {
		text-align: center;
		padding: 100rpx 40rpx;
	}

	.empty-state image {
		width: 200rpx;
		height: 200rpx;
		margin-bottom: 20rpx;
		opacity: 0.5;
	}

	.empty-state text {
		color: #999999;
		font-size: 28rpx;
	}

	.upload-fab {
		position: fixed;
		bottom: 100rpx;
		right: 40rpx;
		width: 100rpx;
		height: 100rpx;
		background-color: #007AFF;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 8rpx 20rpx rgba(0, 122, 255, 0.3);
		z-index: 999;
	}

	.upload-fab:active {
		transform: scale(0.95);
	}

	.filter-modal {
		background-color: #ffffff;
		border-radius: 30rpx 30rpx 0 0;
		padding: 40rpx;
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 40rpx;
	}

	.modal-title {
		font-size: 32rpx;
		font-weight: 600;
		color: #333333;
	}

	.close-btn {
		width: 60rpx;
		height: 60rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.filter-content {
		margin-bottom: 60rpx;
	}

	.filter-section {
		margin-bottom: 40rpx;
	}

	.section-title {
		font-size: 28rpx;
		font-weight: 500;
		color: #333333;
		margin-bottom: 20rpx;
		display: block;
	}

	.category-list,
	.sort-list {
		display: flex;
		flex-wrap: wrap;
		gap: 20rpx;
	}

	.category-item,
	.sort-item {
		padding: 15rpx 30rpx;
		background-color: #f5f5f5;
		border-radius: 20rpx;
		font-size: 26rpx;
		color: #666666;
		transition: all 0.2s ease;
	}

	.category-item.active,
	.sort-item.active {
		background-color: #007AFF;
		color: #ffffff;
	}

	.modal-footer {
		display: flex;
		gap: 20rpx;
	}

	.modal-footer .btn {
		flex: 1;
		height: 80rpx;
		border-radius: 20rpx;
		font-size: 28rpx;
	}
</style> 