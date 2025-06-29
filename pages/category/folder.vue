<template>
	<view class="folder-page">
		<!-- 分类信息头部 -->
		<view class="category-header">
			<view class="category-cover">
				<image 
					:src="categoryInfo.cover" 
					mode="aspectFill"
					@error="onCoverError"
				></image>
				<view class="cover-overlay">
					<view class="category-title">{{ categoryInfo.name }}</view>
					<view class="category-stats">
						<text>{{ imageList.length }} 张图片</text>
						<text v-if="categoryInfo.description">{{ categoryInfo.description }}</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 操作栏 -->
		<view class="action-bar">
			<view class="search-input">
				<uni-icons type="search" size="18" color="#999"></uni-icons>
				<input 
					type="text" 
					placeholder="搜索分类中的图片..." 
					v-model="searchKeyword"
				/>
			</view>
			<view class="action-buttons">
				<view class="action-btn" @click="addImages">
					<uni-icons type="plus" size="20" color="#007AFF"></uni-icons>
				</view>
			</view>
		</view>

		<!-- 图片网格 -->
		<view class="images-grid" v-if="filteredImages.length > 0">
			<view 
				class="image-item"
				v-for="(image, index) in filteredImages"
				:key="image.id"
				@click="viewImage(image)"
			>
				<view class="image-container">
					<image 
						:src="image.thumbnail" 
						mode="aspectFill"
						class="image"
					></image>
					
					<!-- 收藏状态 -->
					<view class="favorite-indicator" v-if="image.isFavorite">
						<uni-icons type="heart-filled" size="16" color="#FF3B30"></uni-icons>
					</view>
				</view>
				
				<view class="image-info">
					<text class="image-title">{{ image.title }}</text>
					<text class="image-meta">{{ getRelativeTime(image.createTime) }}</text>
				</view>
			</view>
		</view>

		<!-- 空状态 -->
		<view class="empty-state" v-else-if="!loading">
			<image src="/static/images/empty_folder.png" mode="aspectFit"></image>
			<text class="empty-title">该分类暂无图片</text>
			<text class="empty-desc">添加一些图片到这个分类吧</text>
			<view class="btn btn-primary" @click="addImages">
				添加图片
			</view>
		</view>

		<!-- 加载状态 -->
		<view class="loading" v-if="loading">
			<uni-icons type="spinner-cycle" size="30" color="#007AFF"></uni-icons>
			<text>加载中...</text>
		</view>
	</view>
</template>

<script>
	import { ref, reactive, computed, onMounted, onLoad } from 'vue'
	import { api } from '@/utils/api.js'
	import { 
		showLoading, 
		hideLoading, 
		showToast,
		navigateTo,
		getRelativeTime,
		chooseImage
	} from '@/utils/common.js'

	export default {
		name: 'FolderPage',
		setup() {
			// 响应式数据
			const loading = ref(false)
			const categoryInfo = ref({})
			const imageList = ref([])
			const searchKeyword = ref('')

			// 计算属性：过滤后的图片列表
			const filteredImages = computed(() => {
				let list = [...imageList.value]

				// 关键词搜索
				if (searchKeyword.value.trim()) {
					const keyword = searchKeyword.value.trim().toLowerCase()
					list = list.filter(item => 
						item.title.toLowerCase().includes(keyword) ||
						item.description.toLowerCase().includes(keyword)
					)
				}

				return list
			})

			/**
			 * 页面加载时获取参数
			 */
			onLoad((options) => {
				const categoryId = options.id
				const categoryName = options.name
				
				if (categoryId) {
					categoryInfo.value.id = categoryId
					categoryInfo.value.name = categoryName || '未知分类'
					loadCategoryImages(categoryId)
					loadCategoryInfo(categoryId)
				}
			})

			/**
			 * 加载分类信息
			 */
			async function loadCategoryInfo(categoryId) {
				try {
					const response = await api.getCategoryList()
					
					if (response.code === 200) {
						const categories = response.data || []
						const category = categories.find(item => item.id === categoryId)
						if (category) {
							categoryInfo.value = { ...categoryInfo.value, ...category }
						}
					}
				} catch (error) {
					console.error('加载分类信息失败:', error)
				}
			}

			/**
			 * 加载分类下的图片
			 */
			async function loadCategoryImages(categoryId) {
				try {
					loading.value = true
					const response = await api.getCategoryImages(categoryId)
					
					if (response.code === 200) {
						imageList.value = response.data.list || []
					} else {
						showToast('加载图片失败')
					}
				} catch (error) {
					console.error('加载分类图片失败:', error)
					showToast('网络错误，请重试')
				} finally {
					loading.value = false
				}
			}

			/**
			 * 查看图片
			 */
			function viewImage(image) {
				navigateTo('/pages/detail/detail', { id: image.id })
			}

			/**
			 * 添加图片到分类
			 */
			async function addImages() {
				try {
					const result = await chooseImage(9)
					
					if (result.tempFilePaths && result.tempFilePaths.length > 0) {
						showLoading('添加中...')
						
						// 模拟添加图片到分类
						setTimeout(() => {
							hideLoading()
							showToast(`成功添加${result.tempFilePaths.length}张图片`, 'success')
							// 重新加载分类图片
							loadCategoryImages(categoryInfo.value.id)
						}, 2000)
					}
				} catch (error) {
					console.error('添加图片失败:', error)
					showToast('添加图片失败')
				}
			}

			/**
			 * 封面加载失败处理
			 */
			function onCoverError() {
				categoryInfo.value.cover = '/static/images/default_category.png'
			}

			return {
				loading,
				categoryInfo,
				imageList,
				searchKeyword,
				filteredImages,
				viewImage,
				addImages,
				onCoverError,
				getRelativeTime
			}
		}
	}
</script>

<style lang="scss" scoped>
	.folder-page {
		min-height: 100vh;
		background-color: #f8f8f8;
		padding-bottom: 100rpx;
	}

	.category-header {
		height: 300rpx;
		position: relative;
		overflow: hidden;
	}

	.category-cover {
		width: 100%;
		height: 100%;
		position: relative;
	}

	.category-cover image {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.cover-overlay {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
		padding: 40rpx 30rpx 30rpx;
		color: #ffffff;
	}

	.category-title {
		font-size: 40rpx;
		font-weight: bold;
		margin-bottom: 10rpx;
		text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.5);
	}

	.category-stats {
		display: flex;
		flex-direction: column;
		gap: 5rpx;
	}

	.category-stats text {
		font-size: 26rpx;
		opacity: 0.9;
		text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.5);
	}

	.action-bar {
		display: flex;
		align-items: center;
		padding: 20rpx;
		background-color: #ffffff;
		gap: 20rpx;
		margin-bottom: 20rpx;
	}

	.search-input {
		flex: 1;
		display: flex;
		align-items: center;
		background-color: #f5f5f5;
		border-radius: 25rpx;
		padding: 15rpx 20rpx;
		gap: 10rpx;
	}

	.search-input input {
		flex: 1;
		font-size: 28rpx;
		border: none;
		background: transparent;
	}

	.action-buttons {
		display: flex;
		gap: 15rpx;
	}

	.action-btn {
		width: 80rpx;
		height: 80rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: #f0f6ff;
		border-radius: 50%;
		transition: all 0.2s ease;
	}

	.action-btn:active {
		transform: scale(0.9);
	}

	.images-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 20rpx;
		padding: 20rpx;
	}

	.image-item {
		background-color: #ffffff;
		border-radius: 16rpx;
		overflow: hidden;
		transition: transform 0.2s ease;
	}

	.image-item:active {
		transform: scale(0.98);
	}

	.image-container {
		position: relative;
		width: 100%;
		aspect-ratio: 3/4;
		overflow: hidden;
	}

	.image {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.favorite-indicator {
		position: absolute;
		top: 15rpx;
		right: 15rpx;
		width: 40rpx;
		height: 40rpx;
		background-color: rgba(255, 255, 255, 0.9);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		backdrop-filter: blur(10rpx);
	}

	.image-info {
		padding: 20rpx;
	}

	.image-title {
		font-size: 28rpx;
		font-weight: 500;
		color: #333333;
		margin-bottom: 8rpx;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		display: block;
	}

	.image-meta {
		font-size: 24rpx;
		color: #999999;
	}

	.loading {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 80rpx 40rpx;
		gap: 20rpx;
	}

	.loading text {
		font-size: 28rpx;
		color: #999999;
	}

	.empty-state {
		text-align: center;
		padding: 100rpx 40rpx;
	}

	.empty-state image {
		width: 200rpx;
		height: 200rpx;
		margin-bottom: 30rpx;
		opacity: 0.5;
	}

	.empty-title {
		font-size: 32rpx;
		color: #333333;
		margin-bottom: 15rpx;
		display: block;
	}

	.empty-desc {
		font-size: 26rpx;
		color: #999999;
		margin-bottom: 40rpx;
		display: block;
	}
</style> 