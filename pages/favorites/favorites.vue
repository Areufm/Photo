<template>
	<view class="favorites-page">
		<!-- 顶部搜索栏 -->
		<view class="search-header">
			<view class="search-input">
				<uni-icons type="search" size="18" color="#999"></uni-icons>
				<input 
					type="text" 
					placeholder="搜索收藏的图片..." 
					v-model="searchKeyword"
					@input="onSearchInput"
				/>
			</view>
			<view class="sort-btn" @click="toggleSortOrder">
				<uni-icons 
					:type="sortOrder === 'desc' ? 'arrow-down' : 'arrow-up'" 
					size="20" 
					color="#007AFF"
				></uni-icons>
			</view>
		</view>

		<!-- 收藏统计 -->
		<view class="stats-bar" v-if="favoriteList.length > 0">
			<text class="stats-text">共 {{ filteredFavorites.length }} 张收藏图片</text>
			<view class="view-mode-toggle">
				<view 
					class="mode-btn"
					:class="{ active: viewMode === 'grid' }"
					@click="viewMode = 'grid'"
				>
					<uni-icons type="grid" size="16" color="#666"></uni-icons>
				</view>
				<view 
					class="mode-btn"
					:class="{ active: viewMode === 'list' }"
					@click="viewMode = 'list'"
				>
					<uni-icons type="list" size="16" color="#666"></uni-icons>
				</view>
			</view>
		</view>

		<!-- 网格视图 -->
		<view class="grid-view" v-if="viewMode === 'grid' && filteredFavorites.length > 0">
			<image-card 
				v-for="image in filteredFavorites" 
				:key="image.id"
				:image="image"
				@click="onImageClick"
				@favorite="onToggleFavorite"
			></image-card>
		</view>

		<!-- 列表视图 -->
		<view class="list-view" v-else-if="viewMode === 'list' && filteredFavorites.length > 0">
			<view 
				class="list-item"
				v-for="image in filteredFavorites"
				:key="image.id"
				@click="onImageClick(image)"
			>
				<view class="item-image">
					<image 
						:src="image.thumbnail" 
						mode="aspectFill"
						@error="onImageError"
					></image>
				</view>
				
				<view class="item-content">
					<view class="item-title">{{ image.title }}</view>
					<view class="item-meta">
						<text class="meta-text">{{ formatImageSize(image.size) }}</text>
						<text class="meta-divider">•</text>
						<text class="meta-text">{{ getRelativeTime(image.createTime) }}</text>
					</view>
					<view class="item-tags" v-if="image.tags && image.tags.length > 0">
						<view 
							class="tag" 
							v-for="tag in image.tags.slice(0, 3)" 
							:key="tag"
						>
							{{ tag }}
						</view>
					</view>
				</view>
				
				<view class="item-actions">
					<view class="action-btn" @click.stop="onToggleFavorite(image)">
						<uni-icons type="heart-filled" size="20" color="#FF3B30"></uni-icons>
					</view>
					<view class="action-btn" @click.stop="shareImage(image)">
						<uni-icons type="redo" size="20" color="#007AFF"></uni-icons>
					</view>
				</view>
			</view>
		</view>

		<!-- 空状态 -->
		<view class="empty-state" v-else-if="!loading">
			<image src="/static/images/empty_favorites.png" mode="aspectFit"></image>
			<text class="empty-title">暂无收藏</text>
			<text class="empty-desc">去首页发现更多精彩图片吧</text>
			<view class="btn btn-primary" @click="goToHome">
				去首页逛逛
			</view>
		</view>

		<!-- 加载状态 -->
		<view class="loading" v-if="loading">
			<uni-icons type="spinner-cycle" size="30" color="#007AFF"></uni-icons>
			<text>加载中...</text>
		</view>

		<!-- 批量操作栏 -->
		<view class="batch-toolbar" v-if="selectedItems.length > 0">
			<view class="selected-count">
				<text>已选择 {{ selectedItems.length }} 项</text>
			</view>
			<view class="batch-actions">
				<view class="batch-btn" @click="batchRemoveFavorite">
					<uni-icons type="heart" size="20" color="#FF3B30"></uni-icons>
					<text>取消收藏</text>
				</view>
				<view class="batch-btn" @click="batchShare">
					<uni-icons type="redo" size="20" color="#007AFF"></uni-icons>
					<text>分享</text>
				</view>
				<view class="batch-btn" @click="clearSelection">
					<uni-icons type="close" size="20" color="#666"></uni-icons>
					<text>取消</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import { ref, reactive, computed, onMounted } from 'vue'
	import { api } from '@/utils/api.js'
	import { 
		showLoading, 
		hideLoading, 
		showToast, 
		showConfirm,
		navigateTo,
		debounce,
		getRelativeTime,
		storage
	} from '@/utils/common.js'
	import ImageCard from '@/components/ImageCard.vue'

	export default {
		name: 'FavoritesPage',
		components: {
			ImageCard
		},
		setup() {
			// 响应式数据
			const loading = ref(false)
			const favoriteList = ref([])
			const searchKeyword = ref('')
			const sortOrder = ref('desc') // desc: 最新优先, asc: 最旧优先
			const viewMode = ref('grid') // grid: 网格视图, list: 列表视图
			const selectedItems = ref([])

			// 计算属性：过滤后的收藏列表
			const filteredFavorites = computed(() => {
				let list = [...favoriteList.value]

				// 关键词搜索
				if (searchKeyword.value.trim()) {
					const keyword = searchKeyword.value.trim().toLowerCase()
					list = list.filter(item => 
						item.title.toLowerCase().includes(keyword) ||
						item.description.toLowerCase().includes(keyword) ||
						item.tags.some(tag => tag.toLowerCase().includes(keyword))
					)
				}

				// 排序
				list.sort((a, b) => {
					const timeA = new Date(a.createTime).getTime()
					const timeB = new Date(b.createTime).getTime()
					return sortOrder.value === 'desc' ? timeB - timeA : timeA - timeB
				})

				return list
			})

			// 防抖搜索
			const onSearchInput = debounce(() => {
				console.log('搜索收藏:', searchKeyword.value)
			}, 300)

			/**
			 * 加载收藏列表
			 */
			async function loadFavorites() {
				try {
					loading.value = true
					
					// 从本地存储获取收藏ID列表
					const favoriteIds = storage.get('favorites', [])
					
					if (favoriteIds.length === 0) {
						favoriteList.value = []
						return
					}

					// 获取所有图片数据
					const response = await api.getImageList()
					
					if (response.code === 200) {
						const allImages = response.data.list || []
						// 筛选出收藏的图片
						favoriteList.value = allImages.filter(item => 
							favoriteIds.includes(item.id)
						).map(item => ({
							...item,
							isFavorite: true // 确保收藏状态为true
						}))
					} else {
						showToast('加载收藏失败')
					}
				} catch (error) {
					console.error('加载收藏列表失败:', error)
					showToast('网络错误，请重试')
				} finally {
					loading.value = false
				}
			}

			/**
			 * 图片点击事件
			 */
			function onImageClick(image) {
				navigateTo('/pages/detail/detail', { id: image.id })
			}

			/**
			 * 切换收藏状态
			 */
			async function onToggleFavorite(image) {
				try {
					// 从收藏列表中移除
					await api.removeFavorite(image.id)
					
					// 更新本地状态
					const index = favoriteList.value.findIndex(item => item.id === image.id)
					if (index !== -1) {
						favoriteList.value.splice(index, 1)
					}
					
					// 更新本地收藏列表
					const favorites = storage.get('favorites', [])
					const favIndex = favorites.indexOf(image.id)
					if (favIndex !== -1) {
						favorites.splice(favIndex, 1)
						storage.set('favorites', favorites)
					}
					
					showToast('已取消收藏')
					
				} catch (error) {
					console.error('取消收藏失败:', error)
					showToast('操作失败，请重试')
				}
			}

			/**
			 * 切换排序顺序
			 */
			function toggleSortOrder() {
				sortOrder.value = sortOrder.value === 'desc' ? 'asc' : 'desc'
				showToast(sortOrder.value === 'desc' ? '按最新排序' : '按最旧排序')
			}

			/**
			 * 格式化图片大小
			 */
			function formatImageSize(size) {
				if (!size) return '未知'
				return size
			}

			/**
			 * 图片加载失败处理
			 */
			function onImageError(e) {
				console.error('图片加载失败:', e)
			}

			/**
			 * 分享图片
			 */
			function shareImage(image) {
				uni.showActionSheet({
					itemList: ['复制链接', '保存到相册'],
					success: (res) => {
						switch (res.tapIndex) {
							case 0:
								uni.setClipboardData({
									data: image.url,
									success: () => {
										showToast('链接已复制', 'success')
									}
								})
								break
							case 1:
								showToast('保存功能开发中')
								break
						}
					}
				})
			}

			/**
			 * 去首页
			 */
			function goToHome() {
				uni.switchTab({
					url: '/pages/index/index'
				})
			}

			/**
			 * 批量取消收藏
			 */
			async function batchRemoveFavorite() {
				const confirmed = await showConfirm(
					`确定要取消收藏这 ${selectedItems.value.length} 张图片吗？`,
					'批量取消收藏'
				)
				
				if (confirmed) {
					try {
						showLoading('处理中...')
						
						// 模拟批量操作
						await new Promise(resolve => setTimeout(resolve, 1000))
						
						// 更新本地状态
						const selectedIds = selectedItems.value.map(item => item.id)
						favoriteList.value = favoriteList.value.filter(item => 
							!selectedIds.includes(item.id)
						)
						
						// 更新本地收藏列表
						const favorites = storage.get('favorites', [])
						const newFavorites = favorites.filter(id => !selectedIds.includes(id))
						storage.set('favorites', newFavorites)
						
						clearSelection()
						hideLoading()
						showToast(`已取消收藏 ${selectedIds.length} 张图片`, 'success')
						
					} catch (error) {
						hideLoading()
						console.error('批量取消收藏失败:', error)
						showToast('操作失败，请重试')
					}
				}
			}

			/**
			 * 批量分享
			 */
			function batchShare() {
				showToast('批量分享功能开发中')
			}

			/**
			 * 清除选择
			 */
			function clearSelection() {
				selectedItems.value = []
			}

			// 页面加载时执行
			onMounted(() => {
				loadFavorites()
			})

			return {
				loading,
				favoriteList,
				searchKeyword,
				sortOrder,
				viewMode,
				selectedItems,
				filteredFavorites,
				onSearchInput,
				onImageClick,
				onToggleFavorite,
				toggleSortOrder,
				formatImageSize,
				onImageError,
				shareImage,
				goToHome,
				batchRemoveFavorite,
				batchShare,
				clearSelection,
				getRelativeTime
			}
		}
	}
</script>

<style lang="scss" scoped>
	.favorites-page {
		min-height: 100vh;
		background-color: #f8f8f8;
		padding-bottom: 100rpx;
	}

	.search-header {
		display: flex;
		align-items: center;
		padding: 20rpx;
		background-color: #ffffff;
		gap: 20rpx;
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

	.sort-btn {
		width: 80rpx;
		height: 80rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: #f0f6ff;
		border-radius: 50%;
	}

	.stats-bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 20rpx 30rpx;
		background-color: #ffffff;
		margin-bottom: 20rpx;
	}

	.stats-text {
		font-size: 28rpx;
		color: #666666;
	}

	.view-mode-toggle {
		display: flex;
		border: 2rpx solid #e5e5e5;
		border-radius: 8rpx;
		overflow: hidden;
	}

	.mode-btn {
		width: 60rpx;
		height: 60rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: #ffffff;
		transition: all 0.2s ease;
	}

	.mode-btn.active {
		background-color: #007AFF;
	}

	.mode-btn.active uni-icons {
		color: #ffffff !important;
	}

	.grid-view {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 20rpx;
		padding: 20rpx;
	}

	.list-view {
		padding: 20rpx;
	}

	.list-item {
		display: flex;
		align-items: center;
		padding: 20rpx;
		background-color: #ffffff;
		border-radius: 16rpx;
		margin-bottom: 15rpx;
		gap: 20rpx;
		transition: transform 0.2s ease;
	}

	.list-item:active {
		transform: scale(0.98);
	}

	.item-image {
		width: 120rpx;
		height: 120rpx;
		border-radius: 12rpx;
		overflow: hidden;
		flex-shrink: 0;
	}

	.item-image image {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.item-content {
		flex: 1;
		min-width: 0;
	}

	.item-title {
		font-size: 32rpx;
		font-weight: 500;
		color: #333333;
		margin-bottom: 8rpx;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.item-meta {
		display: flex;
		align-items: center;
		margin-bottom: 12rpx;
		gap: 8rpx;
	}

	.meta-text {
		font-size: 24rpx;
		color: #999999;
	}

	.meta-divider {
		font-size: 24rpx;
		color: #999999;
	}

	.item-tags {
		display: flex;
		gap: 8rpx;
		flex-wrap: wrap;
	}

	.tag {
		background-color: #f0f6ff;
		color: #007AFF;
		font-size: 20rpx;
		padding: 4rpx 10rpx;
		border-radius: 10rpx;
	}

	.item-actions {
		display: flex;
		flex-direction: column;
		gap: 15rpx;
	}

	.action-btn {
		width: 60rpx;
		height: 60rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: #f5f5f5;
		border-radius: 50%;
		transition: all 0.2s ease;
	}

	.action-btn:active {
		transform: scale(0.9);
	}

	.batch-toolbar {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		background-color: #ffffff;
		border-top: 2rpx solid #f0f0f0;
		padding: 20rpx 30rpx;
		padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
		display: flex;
		align-items: center;
		justify-content: space-between;
		z-index: 1000;
	}

	.selected-count {
		font-size: 28rpx;
		color: #333333;
	}

	.batch-actions {
		display: flex;
		gap: 20rpx;
	}

	.batch-btn {
		display: flex;
		align-items: center;
		gap: 8rpx;
		padding: 15rpx 20rpx;
		background-color: #f5f5f5;
		border-radius: 20rpx;
		font-size: 26rpx;
		color: #333333;
		transition: all 0.2s ease;
	}

	.batch-btn:active {
		transform: scale(0.95);
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