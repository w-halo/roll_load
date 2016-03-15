<h1># roll_load</h1>
移动端的向下滚动加载更多

<h3>依赖库</h3>
jquery或者zepto

<h3>html格式</h3>
使用.roll_load作为最外层载体,.page来区分页面,主要使用在滑动动态加载其他page

<h3>参数</h3>
<pre>
<code>
options={
	speed 动画时间,默认300
	index 开始下标,默认0
	stopPropagation 阻止默认时间 默认false
	callback 回调函数 (当前显示下标, 当前显示页面)
	transitionEnd 动画结束回调(事件参数,当前显示下标, 当前显示页面)
}
</code>
</pre>

<h3>方法</h3>
<pre>
init (初始化)
resizeHeight(重新获取page[index]高度)
pageTo(跳到index的page)
toTop(回到顶部)
</pre>

author:wyc