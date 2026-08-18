---
title: 并查集
date: 2023-03-01 12:00:00
categories: 
- OI
- 数据结构
cover: assets/003.jpg
description: 用于管理元素所属集合的数据结构，支持合并、查询、删除、移动，并介绍按秩合并与路径压缩两种优化。
math: true
mermaid: true
---

并查集是一种用于管理元素所属集合的数据结构，实现为一个森林，其中每棵树表示一个集合，树中的节点表示对应集合中的元素。

并查集支持：
1. **合并：合并两个元素所属集合（合并对应的树）**
2. **查询：查询某个元素所属集合（查询对应的树的根节点），可用于判断两个元素是否属于同一集合**
3. **删除**：从一个集合中删除一个元素
4. **移动**：从一个集合中将一个元素移动到另一个集合

## 初始化
初始时，每个元素都位于一个单独的集合，表示为一棵只有根节点的树。方便起见，我们将根节点的父亲设为自己。

## 合并
要合并两棵树，只需要**将一棵树的根节点连到另一棵树的根节点**。

合并时，选择哪棵树的根节点作为新树的根节点会影响未来操作的复杂度，可**按秩合并**（将**节点较少**或**深度较小**的树连到另一棵），以免发生退化。

## 查询
沿着树向上移动，直至找到根节点。

查询过程中经过的每个元素都属于该集合，可==路径压缩==（**将其直接连到根节点**）以加快后续查询。

**注意，若题目有撤销操作，此时再用路径压缩时间复杂度会很高。**

## 删除、移动
把要从原集合中删除的元素**独立成一个新的集合**，根节点设为 $cnt$ 。

现在**给元素取一个新的元素名称**，旧的还存于树中的便不代表元素了，是根节点的话就做一个集合的代表，非根节点但是其它节点的祖先的话就成为后代节点路径压缩的跳板，是叶子节点的话就啥事没有了。这样就算达成了删除的操作。

移动就是**先从原集合中删除，后合并至新集合**即可。

## 实现
**基础并查集（无注释） $Code:$**
```cpp
vector <int> f;
vector <int> num;
int n, m;

void init()
{
	for(int i = 0; i <= n; i++)
	{
		f.push_back(i);
		num.push_back(1);
	}
	return;
}

int find(int x) {return f[x] == x ? x : f[x] = find(f[x]);}

void merge(int x, int y)
{
	x = find(x), y = find(y);
	if(x == y) return;
	if(num[x] < num[y]) swap(x, y);
	f[y] = x;
	num[x] += num[y];
	return;
}

bool check(int x, int y) {return find(x) == find(y);}
```

**可删除、移动、求和、求元素个数的并查集 $Code:$**
```cpp
typedef long long ll;

// 所有根结点相同的结点位于同一集合中，根节点为集合的代表元素
vector <int> f;
vector <int> t;
vector <int> num;  // 记录以该结点为根结点的树的节点数，用于优化，在合并时，将节点少的树连到到节点多的树下
vector <ll> sum;
int n, m, cnt;

void init()
{
	for(int i = 0; i <= n; i++)
	{
		f.push_back(i);  // 每个节点各为一个集合
		t.push_back(i);  // 元素名称，与元素编号无关
		num.push_back(1);  // 每个结点各为一棵节点数为 1 的树
		sum.push_back(i);  // 集合内所有元素之和 
	}
	cnt = n;
	return;
}

int find(int x) {return f[x] == x ? x : f[x] = find(f[x]);}  // 查找根结点，同时路径压缩

void merge(int x, int y)  // 合并
{
	x = find(t[x]), y = find(t[y]);  // 查找根结点
	if(x == y) return;
	// 若不在同一集合，将节点少的树连到到节点多的树下
	if(num[x] < num[y]) swap(x, y);
	f[y] = x;  // 合并
	num[x] += num[y];
	sum[x] += sum[y];
	return;
}

void del(int x)  // 删除
{
	num[find(t[x])]--;
	sum[find(t[x])] -= x;
	t[x] = ++cnt;  // 便于重新建立集合
	num[t[x]] = 1;  // 让 t[x] 建立独立的集合，节点数为 1
	sum[t[x]] = x;  // 和为 x
	f[t[x]] = t[x];  // 初始化新集合
	return;
}

void move(int x, int y) {del(x); merge(x, y); return;}  // 移动

int get_num(int x) {return num[find(t[x])];}  // 返回所在集合元素个数

ll get_sum(int x) {return sum[find(t[x])];}  // 返回所在集合所有元素之和

bool check(int x, int y) {return find(t[x]) == find(t[y]);}  // 判断两元素是否在同一集合内
```

# 可撤销并查集
可撤销并查集支持**回退到上一次合并操作前的状态**。

由于路径压缩会破坏原先树形结构，使撤销十分困难。所以这里**不使用路径压缩**。

用栈记录操作，回退时弹出栈顶。

**$Code:$**
```cpp
typedef pair <int, int> P;
stack <P> s;

int find(int x) {return f[x] == x ? x : f[x] = find(f[x]);}

void merge(int x, int y)
{
	x = find(x), y = find(y);
	if(x == y) return;
	if(num[x] < num[y]) swap(x, y);
	s.push({x, num[x]});
	s.push({y, f[y]});
	num[x] += num[y];
	f[y] = x;
}
void undo()
{
	int u = s.top().first, v = s.top().second; s.pop();
	f[u] = v;
	u = s.top().first, v = s.top().second; s.pop();
	num[u] = v;
}
```

# 带权并查集
带权并查集是**有边权**的并查集。

## 合并
将 $x$ 合并至 $y$ 时，易得 `val[px] = v + val[y] - val[x]`

故合并代码为：
```cpp
void merge(int x, int y, int v)
{
	int px = find(x), py = find(y);
	if(px == py) return;
	f[px] = py;
	val[px] = v + val[y] - val[x];
}
```

## 查询
```cpp
int find(int x)
{
	if(x == f[x]) return x;
	val[x] += val[f[x]];
	return f[x] = find(f[x]);
}
```

# 扩展域并查集
扩展域并查集用于解决**同时考虑多个有相互关系（如相互排斥）的集合**的问题。

建立多个并查集，用**拓展个体**把多个并查集联系起来。

## 拓展个体
将一个个体拆成多个。

例如有两个集合对立，对于个体 $a$ ，设 $a+n$ 与 $a$ 对立。则：
1. 若 $a,b$ 对立，则 $a+n,b$ 在同一集合， $b+n,a$ 在同一集合。
2. 若 $a,b$ 为同类， $a,b$ 在同一集合，且 $a+n,b+n$ 在同一集合。

同理，有 $k$ 个不同集合就可以将 $a$ 一直扩展到 $a+(k-1)\times n$ 。