# roll_load
移动端的向下滚动加载更多

依赖库
jquery或者zepto

html格式
使用.roll_load作为最外层载体,.page来区分页面,主要使用在滑动动态加载其他page

参数
options={
	speed 动画时间,默认300
	index 开始下标,默认0
	stopPropagation 阻止默认时间 默认false
	callback 回调函数 (当前显示下标, 当前显示页面)
	transitionEnd 动画结束回调(事件参数,当前显示下标, 当前显示页面)
}

方法 
init (初始化)
resizeHeight(重新获取page[index]高度)

author:wyc

新人